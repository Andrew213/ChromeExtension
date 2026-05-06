import { createJobAgent } from "../api/jobAgent";
import { tickHH } from "../hh.ts";

const COVER_KEY = "jobagent.coverLetter";

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

(() => {
  // Работать только в top-frame, иначе будет куча контекстов и другой sessionStorage
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
    document.addEventListener("DOMContentLoaded", bootstrapResume, {
      once: true,
    });
  } else {
    bootstrapResume();
  }

  // 2) ловим SPA-навигацию (HH часто меняет view без перезагрузки)
  let lastHref = location.href;
  const onUrlChange = () => {
    if (location.href === lastHref) return;
    lastHref = location.href;
    bootstrapResume();
  };

  const mo = new MutationObserver(onUrlChange);
  mo.observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener("popstate", onUrlChange);

  // 3) команды из popup
  chrome.runtime.onMessage.addListener(async (message) => {
    if (message?.type === "START_HH") {
      const agent = ensureAgent();

      const s = message.settings ?? {};
      const letter =
        typeof s.responseLetter === "string" && s.responseLetter.trim()
          ? s.responseLetter
          : await loadCoverLetter();

      agent.start({ ...s, responseLetter: letter });
      return;
    }

    if (message?.type === "STOP_HH") {
      window.__jobAgent?.stop();
      return;
    }

    if (message?.type === "TEST_STEP") {
      const agent = ensureAgent();
      agent.stop();
      agent.test(message.settings ?? {});
      return;
    }
  });
})();
