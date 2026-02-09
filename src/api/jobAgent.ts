import { SiteId } from "../types";

export function createJobAgent(params: {
  site: SiteId;
  tickImpl: (state: { idx: number; settings: BotSettings }) => {
    nextIdx: number;
    done?: boolean;
  };
}) {
  const log = (m: string) => console.log(`[JobAgent] ${m}`);

  const state = {
    running: false,
    idx: 0,
    timerId: 0 as any,
    settings: { speed: 3, responseLetter: "" } as BotSettings,
  };
  const computeDelayMs = () => {
    const speed = Number(state.settings.speed || 3);
    const base = 1800 - speed * 300;
    return Math.max(250, base);
  };

  const scheduleNext = (ms: number) => {
    if (!state.running) return;
    if (state.timerId) clearTimeout(state.timerId);
    state.timerId = setTimeout(api.tick, ms);
  };

  const api = {
    start(nextSettings: Partial<BotSettings>) {
      // speed
      if (typeof nextSettings.speed === "number") {
        state.settings.speed = nextSettings.speed as any;
      }

      // responseLetter — обновляем только если реально строка
      if (typeof nextSettings.responseLetter === "string") {
        state.settings.responseLetter = nextSettings.responseLetter;
      }

      // теперь в state.settings письмо точно сохранено
      // можно логнуть длину
      log(
        `START site=${params.site} speed=${state.settings.speed} letterLen=${state.settings.responseLetter?.length}`,
      );

      if (state.running) return;
      state.running = true;
      scheduleNext(0);
    },

    tick() {
      if (!state.running) return;

      const res = params.tickImpl({ idx: state.idx, settings: state.settings });
      state.idx = res.nextIdx;

      if (res.done) {
        state.running = false;
        log("DONE");
        return;
      }

      scheduleNext(computeDelayMs());
    },
  };

  return api;
}
