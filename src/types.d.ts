export type SiteId = "hh" | "superjob" | "unknown";

declare global {
  type BotSettings = { speed: number };
  type Speed = 1 | 2 | 3 | 4 | 5;
  type UiToBgMessage =
    | { type: "START"; settings: BotSettings }
    | { type: "STOP" }
    | { type: "RUN_TEST_STEP"; settings?: BotSettings };
  type BgToContentMessage =
    | { type: "START"; settings: BotSettings }
    | { type: "STOP" }
    | { type: "RUN_TEST_STEP"; settings?: BotSettings };
  type ContentToBgMessage =
    | { type: "LOG"; line: string }
    | { type: "STATUS"; running: boolean; site: SiteId };
}

export interface SiteHandler {
  name: string;
  run: (ctx: BotCtx) => Promise<void>;
  stop?: (ctx: BotCtx) => Promise<void>;
}

export interface BotCtx {
  settings: BotSettings;
  log: (msg: string) => void;
  sleep: (ms: number) => Promise<void>;
  isAborted: () => boolean;
}
