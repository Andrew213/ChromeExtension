import hhPng from "./assets/hh.png";
import sjPng from "./assets/sj.png";

export const SITES = {
  hh: "hh",
  sj: "sj",
  unknown: "unknown",
} as const;

type SiteId = keyof typeof SITES;

type SiteT = {
  id: SiteId;
  name: string;
  match?: (a: string) => boolean;
  img: string;
  subtitle: string;
};

const siteMap: SiteT[] = [
  {
    id: SITES.hh,
    name: "HeadHunter",
    match: (host: string) => host === "hh.ru" || host.endsWith(".hh.ru"),
    img: hhPng,
    subtitle: "Режим: hh.ru",
  },
  {
    id: SITES.sj,
    name: "SuperJob",
    match: (host: string) =>
      host === "superjob.ru" || host.endsWith(".superjob.ru"),
    img: sjPng,
    subtitle: "Режим: superjob.ru",
  },
];

function normalizeHost(host: string) {
  host = (host || "").toLowerCase().trim();
  return host.startsWith("www.") ? host.slice(4) : host;
}

export function resolveSite(host: string): SiteT {
  const h = normalizeHost(host);
  const found = siteMap.find((x) => x.match && x.match(h)); // Проверка на наличие match
  return (
    found || {
      id: SITES.unknown,
      name: "Unknown",
      img: "images/unknown.png",
      subtitle: "Сайт не поддержан",
    }
  );
}

export async function getActiveTabHost() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const urlStr = tab?.url || "";
  let host = "";

  try {
    host = urlStr ? new URL(urlStr).host : "";
  } catch {
    host = "";
  }

  return host;
}

// Типизация для SiteId
type SiteIdWithoutUnknown = keyof Omit<typeof SITES, "unknown">;

// Обработчики для каждого сайта

export type Handler = {
  name: string;
  run: (setting: BotSettings) => void;
  stop: (ctx: BotSettings) => void;
};

export const handlers: Record<SiteIdWithoutUnknown, Handler> = {
  hh: {
    name: "HeadHunter",
    run(setting) {
      console.log(`HH`, setting);
      // TODO: шаги
    },
    async stop(ctx) {},
  },

  sj: {
    name: "SuperJob",
    run(setting) {
      console.log(`SJ`, setting);
      // TODO: шаги
    },
    async stop() {},
  },
};
