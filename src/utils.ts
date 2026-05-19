import hhPng from "./assets/hh.png";
import sjPng from "./assets/sj.png";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const SITES = {
  hh: "hh",
  sj: "sj",
  unknown: "unknown",
} as const;

export type SiteId = keyof typeof SITES;

export type SiteT = {
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
  console.log({ hostHere: host });

  return host;
}
