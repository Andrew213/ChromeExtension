import { SiteId } from "../types";

export type TickResult = {
  nextIdx: number;
  done?: boolean;
  hold?: boolean; // true => не двигаем idx (ждём)
};

export type Phase =
  | "idle" // - дефолтная фаза начала отлкика
  | "waiting_apply_result" // - ожидание результата отклика
  | "fill_modal" // - заполнения модалки сопровод письма
  | "fill_inline" // - заполнения сопровод письма в карточке вакансии. если есть сопровод текст
  | "submit_modal" // - отправление в модалке сопровод письма
  | "submit_inline" // - отправление в карточке вакансии сопровод письма
  | "wait_inline_done" // - заверешние отправки в карточке сопровод письма
  | "wait_return_to_serp" // - ожидание возврата после редиректа на форму работодателя
  | "wait_modal_close"; // - закрыть модалку с сопровод письмом

export type AgentCtx = {
  beforeUrl: string;
  waitStartedAt: number;
  timeoutMs: number;
  returnUrl?: string;
  resumeIdx?: number;
};

export type TickState = {
  idx: number;
  settings: BotSettings;
  phase: Phase;
  ctx: AgentCtx;
  setPhase: (p: Phase) => void;
  setCtx: (patch: Partial<AgentCtx>) => void;
};

export function createJobAgent(params: {
  site: SiteId;
  tickTmpl: (state: TickState) => TickResult;
}) {
  const log = (m: string) => console.log(`[JobAgent] ${m}`);

  const state = {
    running: false,
    idx: 0,
    timerId: 0 as any,
    phase: "idle" as Phase,
    ctx: {
      beforeUrl: "",
      waitStartedAt: 0,
      timeoutMs: 5000,
    } as AgentCtx,
    settings: { speed: 3, responseLetter: "" } as BotSettings,
  };

  const computeDelayMs = () => {
    const speed = Number(state.settings?.speed || 3);
    return Math.max(250, 1800 - speed * 300);
  };

  const clearTimer = () => {
    if (state.timerId) clearTimeout(state.timerId);
    state.timerId = 0 as any;
  };

  const scheduleNext = (ms: number) => {
    if (!state.running) return;
    clearTimer();
    state.timerId = setTimeout(api.tick, ms);
  };

  const applySettings = (next: Partial<BotSettings>) => {
    if (typeof next.speed === "number")
      state.settings.speed = next.speed as any;
    if (typeof next.responseLetter === "string")
      state.settings.responseLetter = next.responseLetter;
  };

  const api = {
    setIdx(nextIdx: number) {
      state.idx = nextIdx;
    },
    setPhase(p: Phase) {
      state.phase = p;
    },
    resume(responseLetter?: string) {
      state.settings.responseLetter = responseLetter;
      if (!state.running) state.running = true;
      scheduleNext(0);
    },
    start(nextSettings: Partial<BotSettings>) {
      applySettings(nextSettings);

      log(
        `START site=${params.site} speed=${state.settings.speed} letterLen=${state.settings.responseLetter?.length}`,
      );

      if (state.running) return;

      state.running = true;
      scheduleNext(0);
    },

    tick() {
      if (!state.running) return;

      const res = params.tickTmpl({
        idx: state.idx,
        settings: state.settings,
        phase: state.phase,
        ctx: state.ctx,
        setPhase: (p) => (state.phase = p),
        setCtx: (patch) => (state.ctx = { ...state.ctx, ...patch }),
      });

      if (res.done) {
        state.running = false;
        clearTimer();
        log("DONE");
        return;
      }

      // idx двигаем только если не hold
      if (res.hold) {
        // ждём — idx не меняем
        state.idx = state.idx;
      } else {
        // если мы только что завершили "возврат на SERP" — прыгаем на resumeIdx
        if (
          state.phase === "wait_return_to_serp" &&
          typeof state.ctx.resumeIdx === "number"
        ) {
          state.idx = state.ctx.resumeIdx;
          // чистим, чтобы не применялось снова
          state.ctx = {
            ...state.ctx,
            resumeIdx: undefined,
            returnUrl: undefined,
          };
        } else {
          state.idx = res.nextIdx;
        }
      }

      scheduleNext(computeDelayMs());
    },

    stop() {
      state.running = false;
      clearTimer();
      sessionStorage.removeItem("jobagent:resume");
      log("STOP");
    },

    test(nextSettings?: Partial<BotSettings>) {
      if (nextSettings) applySettings(nextSettings);

      const res = params.tickTmpl({
        idx: state.idx,
        settings: state.settings,
        phase: state.phase,
        ctx: state.ctx,
        setPhase: (p) => (state.phase = p),
        setCtx: (patch) => (state.ctx = { ...state.ctx, ...patch }),
      });

      state.idx = res.hold ? state.idx : res.nextIdx;
      return res;
    },

    // для дебага
    getState() {
      return {
        running: state.running,
        idx: state.idx,
        phase: state.phase,
        ctx: state.ctx,
        settings: state.settings,
      };
    },
  };

  return api;
}
