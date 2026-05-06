export type SiteId = "hh" | "superjob" | "unknown";

declare global {
  type BotSettings = { speed: number; responseLetter?: string };
  type Speed = 1 | 2 | 3 | 4 | 5;
}
