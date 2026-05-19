import { tickHH } from "@/bords/hh";
import { createJobAgent } from "../api/jobAgent";
import { ContentMessageType } from "@/content/messages";
import type { SiteId } from "@/utils";

type BackgroundResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; status?: number } };

function requestFromContent<T = unknown>(options: {
  method?: string;
  url: string;
  data?: unknown;
  skipAuth?: boolean;
}): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: "API_REQUEST",
        payload: {
          method: options.method ?? "GET",
          url: options.url,
          body: options.data,
          skipAuth: options.skipAuth,
        },
      },
      (response: BackgroundResponse<T>) => {
        const error = chrome.runtime.lastError;

        if (error) {
          reject(new Error(error.message));
          return;
        }

        if (!response?.ok) {
          reject(new Error(response?.error?.message ?? "Request failed"));
          return;
        }

        resolve(response.data);
      },
    );
  });
}

const COVER_KEY = "jobagent.coverLetter";

const VACANCY_FORM_SELECTOR =
  'form#RESPONSE_MODAL_FORM_ID[name="vacancy_response"]';
const CAPTURED_VACANCY_FORMS_KEY = "jobagent:capturedVacancyForms";

let captureTimer = 0;

function readCapturedVacancyForms() {
  const raw = sessionStorage.getItem(CAPTURED_VACANCY_FORMS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function rememberCapturedVacancyForm(key: string) {
  const captured = readCapturedVacancyForms();
  if (captured.includes(key)) return;

  captured.push(key);
  sessionStorage.setItem(
    CAPTURED_VACANCY_FORMS_KEY,
    JSON.stringify(captured.slice(-200)),
  );
}

function getVacancyIdFromUrl(url: string) {
  try {
    return new URL(url).searchParams.get("vacancyId");
  } catch {
    return null;
  }
}

function getVacancyFormCaptureKey(form: HTMLFormElement) {
  const vacancyId =
    getVacancyIdFromUrl(location.href) || getVacancyIdFromUrl(form.action);

  if (vacancyId) return `vacancy:${vacancyId}`;

  return `url:${location.origin}${location.pathname}`;
}

function isEmployerQuestionnaireForm(form: HTMLFormElement) {
  // форма есть как в модалке для сопроводительного, так и в тестах
  return Boolean(
    form.querySelector(
      '[data-qa="employer-asking-for-test"], [data-qa="task-body"], [data-qa="task-question"]',
    ),
  );
}

async function captureVacancyResponseForm() {
  const form = document.querySelector<HTMLFormElement>(VACANCY_FORM_SELECTOR);
  if (!form) return false;

  if (!isEmployerQuestionnaireForm(form)) return true;

  const captureKey = getVacancyFormCaptureKey(form);
  if (readCapturedVacancyForms().includes(captureKey)) {
    console.log(
      "[JobAgent] vacancy response form already captured",
      captureKey,
    );
    return true;
  }

  try {
    await requestFromContent({
      method: "POST",
      url: "/vacancy-response-forms",
      skipAuth: true,
      data: {
        pageUrl: location.href,
        formSelector: VACANCY_FORM_SELECTOR,
        formHtml: form.outerHTML,
        formText: form.textContent?.trim(),
        action: form.action || undefined,
        method: form.method || undefined,
        collectedAt: new Date().toISOString(),
      },
    });

    rememberCapturedVacancyForm(captureKey);
    console.log("[JobAgent] vacancy response form captured", captureKey);
    return true;
  } catch (error) {
    console.warn("[JobAgent] vacancy response form capture failed", error);
    return true;
  }
}

function scheduleVacancyResponseFormCapture() {
  window.clearTimeout(captureTimer);

  let attempts = 0;

  const tick = async () => {
    const captured = await captureVacancyResponseForm();

    if (captured) return;

    if (attempts++ < 20) {
      captureTimer = window.setTimeout(tick, 500);
    }
  };

  void tick();
}

declare global {
  interface Window {
    __jobAgent?: ReturnType<typeof createJobAgent>;
  }
}

async function loadCoverLetter(): Promise<string> {
  const data = await chrome.storage.local.get(COVER_KEY);
  const v = data[COVER_KEY];
  return typeof v === "string" ? v : "";
}

function detectContentSite(host: string): SiteId {
  const normalizedHost = host.toLowerCase().replace(/^www\./, "");

  if (normalizedHost === "hh.ru" || normalizedHost.endsWith(".hh.ru")) {
    return "hh";
  }

  if (
    normalizedHost === "superjob.ru" ||
    normalizedHost.endsWith(".superjob.ru")
  ) {
    return "sj";
  }

  return "unknown";
}

(() => {
  // Работать только в top-frame, иначе будет куча контекстов и другой sessionStorage
  // обработка редиректа на форму работодателя
  if (window.top !== window.self) return;

  const RESUME_KEY = "jobagent:resume";

  function isSerpPage() {
    return (
      document.querySelectorAll("[data-qa='vacancy-serp__vacancy']").length > 0
    );
  }

  function readResume() {
    const raw = sessionStorage.getItem(RESUME_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as {
        resumeIdx: number;
        returnUrl: string;
        ts: number;
      };
    } catch {
      return null;
    }
  }

  function clearResume() {
    sessionStorage.removeItem(RESUME_KEY);
  }

  function ensureAgent() {
    if (!window.__jobAgent) {
      window.__jobAgent = createJobAgent({ site: "hh", tickTmpl: tickHH });
    }
    return window.__jobAgent;
  }

  /**
   * Если есть RESUME_KEY:
   * - не SERP -> возвращаемся на returnUrl
   * - SERP -> стопаем агента, выставляем idx/phase, продолжаем
   */
  async function bootstrapResume() {
    const resume = readResume();
    if (!resume) return;

    // протухание 2 минуты
    if (Date.now() - resume.ts > 2 * 60 * 1000) {
      clearResume();
      return;
    }

    // Мы не на SERP (анкета/форма) — возвращаемся на сохранённый URL
    if (!isSerpPage()) {
      location.href = resume.returnUrl;
      return;
    }

    // Мы на SERP — применяем resumeIdx и продолжаем
    const agent = ensureAgent();

    // важно: остановить, чтобы не было гонки с таймерами
    agent.stop?.();
    const letter = await loadCoverLetter();
    agent.setIdx?.(resume.resumeIdx);
    agent.setPhase?.("idle");
    agent.resume?.(letter);

    clearResume();
  }

  console.log("[JobAgent] content loaded", location.href);

  // 1) один раз при загрузке
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        bootstrapResume();
        scheduleVacancyResponseFormCapture();
      },
      {
        once: true,
      },
    );
  } else {
    bootstrapResume();
    scheduleVacancyResponseFormCapture();
  }

  // 2) ловим SPA-навигацию (HH часто меняет view без перезагрузки)
  let lastHref = location.href;

  const onUrlChange = () => {
    if (location.href === lastHref) return;
    lastHref = location.href;
    bootstrapResume();
    scheduleVacancyResponseFormCapture();
  };

  const mo = new MutationObserver(onUrlChange);
  mo.observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener("popstate", onUrlChange);

  // 3) команды из popup
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const { Ping, Start, Stop, TestStep } = ContentMessageType;

    // попап пингует сначала контент скрипты и потом уже позволяется пользоваться кнопками
    if (message?.type === Ping) {
      const site = detectContentSite(location.host);
      // в пинге определяю сайт
      sendResponse({
        ok: true,
        site,
        ready: site !== "unknown",
        href: location.href,
        capabilities: {
          start: site === "hh",
          stop: site === "hh",
          testStep: site === "hh",
        },
      });
      return false;
    }

    if (message?.type === Start) {
      void (async () => {
        const agent = ensureAgent();

        const s = message.settings ?? {};
        const letter =
          typeof s.responseLetter === "string" && s.responseLetter.trim()
            ? s.responseLetter
            : await loadCoverLetter();

        agent.start({ ...s, responseLetter: letter });
      })();
      return false;
    }

    if (message?.type === Stop) {
      window.__jobAgent?.stop();
      return false;
    }

    if (message?.type === TestStep) {
      const agent = ensureAgent();
      agent.stop();
      agent.test(message.settings ?? {});
      return false;
    }

    return false;
  });
})();
