import hhPng from "./assets/hh.png";
import sjPng from "./assets/sj.png";

const siteMap = [
  {
    id: "hh",
    name: "HeadHunter",
    match: (host: string) => host === "hh.ru" || host.endsWith(".hh.ru"),
    img: hhPng,
    subtitle: "Режим: hh.ru",
  },
  {
    id: "superjob",
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

export function resolveSite(host: string) {
  const h = normalizeHost(host);
  const found = siteMap.find((x) => x.match(h));
  return (
    found || {
      id: "unknown",
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
