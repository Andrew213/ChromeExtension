import type { TickResult, TickState } from "../../api/jobAgent";
import { setNativeValue } from "../actions/input";
import {
  findInlineCoverLetterForm,
  findInlineSubmitButton,
  findInlineTextarea,
  getResponseButton,
} from "../ui/inline";
import {
  closeModal,
  findLetterTextarea,
  findSubmitButton,
  getApplyModal,
  isDisabled,
} from "../ui/modal";

export function applyFromSerpFlow(state: TickState): TickResult {
  const { idx, settings, phase, ctx, setPhase, setCtx } = state;

  const cards = document.querySelectorAll<HTMLElement>(
    "[data-qa='vacancy-serp__vacancy']",
  );
  if (!cards.length) return { nextIdx: idx, done: true };

  const now = Date.now();

  // wait result
  if (phase === "waiting_apply_result") {
    console.log("waiting_apply_result");

    const modal = getApplyModal();
    if (modal) {
      setPhase("fill_modal");
      return { nextIdx: idx, hold: true };
    }

    if (settings.responseLetter) {
      const inlineButton = getResponseButton(cards[idx]);
      if (inlineButton) {
        setPhase("fill_inline");
        inlineButton.click();
        return { nextIdx: idx, hold: true };
      }
    }

    console.log("ctx.beforeUrl", ctx.beforeUrl);
    console.log("location.href", location.href);
    if (ctx.beforeUrl && location.href !== ctx.beforeUrl) {
      console.log("SPA redirect detected, going back", {
        from: ctx.beforeUrl,
        to: location.href,
      });

      setCtx({
        returnUrl: ctx.beforeUrl,
        resumeIdx: idx + 1,
        waitStartedAt: now,
        timeoutMs: 8000,
      });

      history.back();
      setPhase("wait_return_to_serp");

      return { nextIdx: idx, hold: true };
    }

    if (now - ctx.waitStartedAt > ctx.timeoutMs) {
      setPhase("idle");
      return { nextIdx: idx + 1 };
    }

    return { nextIdx: idx, hold: true };
  }

  if (phase === "wait_return_to_serp") {
    console.log("wait_return_to_serp");
    //  если есть вакансии
    const isSerp =
      document.querySelectorAll("[data-qa='vacancy-serp__vacancy']").length > 0;

    if (isSerp && ctx.resumeIdx) {
      console.log("Returned to SERP, resume", { resumeIdx: ctx.resumeIdx });
      setPhase("idle");
      return { nextIdx: ctx.resumeIdx };
    }
  }

  if (phase === "fill_inline") {
    console.log("fill_inline");

    const form = findInlineCoverLetterForm(cards[idx]);
    if (!form) {
      // inline формы нет — вернёмся в ожидание/или скипнем
      setPhase("idle");
      return { nextIdx: idx + 1 };
    }

    const textarea = findInlineTextarea(form);
    if (!textarea) return { nextIdx: idx, hold: true };

    setNativeValue(textarea, settings.responseLetter || "");
    setPhase("submit_inline");
    return { nextIdx: idx, hold: true };
  }

  // submit inline (если есть сопроводительное)
  if (phase === "submit_inline") {
    console.log("submit_inline");

    const form = findInlineCoverLetterForm(cards[idx]);
    if (!form) {
      setPhase("idle");
      return { nextIdx: idx + 1 };
    }
    const submitBtn = findInlineSubmitButton(cards[idx]);
    if (!submitBtn) return { nextIdx: idx, hold: true };
    submitBtn.click();
    setPhase("wait_inline_done");
    setCtx({ waitStartedAt: now, timeoutMs: 8000 });
    return { nextIdx: idx, hold: true };
  }

  //wait_inline_done - после ожидания отправки сопровод. убедиться, что форма пропала
  if (phase === "wait_inline_done") {
    console.log("wait_inline_done");

    const form = findInlineCoverLetterForm(document);

    // если форма исчезла — считаем, что отправили
    if (!form) {
      setPhase("idle");
      return { nextIdx: idx + 1 };
    }

    if (now - ctx.waitStartedAt > ctx.timeoutMs) {
      // зависло — скипнем, чтобы не застрять
      setPhase("idle");
      return { nextIdx: idx + 1 };
    }

    return { nextIdx: idx, hold: true };
  }

  // fill modal
  if (phase === "fill_modal") {
    console.log("fill_modal");

    const modal = getApplyModal();
    if (!modal) {
      setPhase("idle");
      return { nextIdx: idx + 1 };
    }

    const textarea = findLetterTextarea(modal);
    if (!textarea) return { nextIdx: idx, hold: true };

    setNativeValue(textarea, settings.responseLetter || "");
    setPhase("submit_modal");
    return { nextIdx: idx, hold: true };
  }

  // submit
  if (phase === "submit_modal") {
    console.log("submit_modal");

    const modal = getApplyModal();
    if (!modal) {
      setPhase("idle");
      return { nextIdx: idx + 1 };
    }

    const submitBtn = findSubmitButton(modal);
    if (!submitBtn) return { nextIdx: idx, hold: true };

    if (isDisabled(submitBtn)) {
      setPhase("fill_modal");
      return { nextIdx: idx, hold: true };
    }

    submitBtn.click();
    setPhase("wait_modal_close");
    setCtx({ waitStartedAt: now, timeoutMs: 8000 });
    return { nextIdx: idx, hold: true };
  }

  // wait close
  if (phase === "wait_modal_close") {
    console.log("wait_modal_close");
    const modal = getApplyModal();
    if (!modal) {
      setPhase("idle");
      return { nextIdx: idx + 1 };
    }

    if (now - ctx.waitStartedAt > ctx.timeoutMs) {
      closeModal(modal);
      setPhase("idle");
      return { nextIdx: idx + 1 };
    }

    return { nextIdx: idx, hold: true };
  }

  // start - idle
  console.log("idle");
  const card = cards[idx];
  if (!card) return { nextIdx: idx, done: true };

  card.scrollIntoView({ block: "center" });

  const title = card
    .querySelector<HTMLElement>('[data-qa="serp-item__title"]')
    ?.textContent?.trim();

  console.log(
    `[JobAgent] HH [${idx + 1}/${cards.length}] ${title ?? "(no title)"}`,
  );

  const btn = card.querySelector<HTMLAnchorElement>(
    '[data-qa="vacancy-serp__vacancy_response"]',
  );
  if (!btn) return { nextIdx: idx + 1 };

  if (btn.getAttribute("aria-disabled") === "true") return { nextIdx: idx + 1 };

  sessionStorage.setItem(
    "jobagent:resume",
    JSON.stringify({
      resumeIdx: idx + 1,
      returnUrl: location.href,
      ts: now,
    }),
  );
  btn.click();

  setCtx({ waitStartedAt: now, timeoutMs: 5000 });
  setPhase("waiting_apply_result");

  return { nextIdx: idx, hold: true };
}
