import { getActiveTabHost, resolveSite } from "../utils";

const $ = (id: string) => document.getElementById(id)!;

const speedRange = $("speedRange") as HTMLInputElement;
const speedBadge = $("speedBadge") as HTMLLabelElement;
const startBtn = $("startBtn") as HTMLButtonElement;
const stopBtn = $("stopBtn") as HTMLButtonElement;
const testBtn = $("testBtn") as HTMLButtonElement;
const refreshBtn = $("refreshBtn") as HTMLButtonElement;

const settings: BotSettings = { speed: Number(speedRange.value) as Speed };

const START = () => {};

startBtn.onclick = async () => {
  console.log(123);
  // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //   console.log(`curr tab`, tabs[0], document);
  // });
  // chrome.runtime.sendMessage({ type: "START", settings } as UiToBgMessage);
};
stopBtn.onclick = () => chrome.runtime.sendMessage({ type: "STOP" });
testBtn.onclick = () => chrome.runtime.sendMessage({ type: "RUN_TEST_STEP" });
refreshBtn.onclick = renderSite;

speedRange.addEventListener("input", () => {
  const speedValue = speedRange.value;
  speedBadge.textContent = speedValue;
  settings.speed = Number(speedValue) as Speed;
});

async function renderSite() {
  const host = await getActiveTabHost();

  const site = resolveSite(host);

  $("siteName").textContent = site.name;
  $("hostText").textContent = host || "—";
  $("siteSubtitle").textContent = site.subtitle;

  ($("siteImage") as HTMLImageElement).src = chrome.runtime.getURL(site.img);
  $("siteImage").title = site.id;
}

renderSite();

// import { BotCtx, SiteHandler, SiteId } from "../types";

// export function normalizeHost(host: string): string {
//   const h = (host || "").toLowerCase().trim();
//   return h.startsWith("www.") ? h.slice(4) : h;
// }

// export function detectSite(hostname: string = document.location.host): SiteId {
//   const host = normalizeHost(hostname);

//   if (host === "hh.ru" || host.endsWith(".hh.ru")) return "hh";
//   if (host === "superjob.ru" || host.endsWith(".superjob.ru"))
//     return "superjob";

//   return "unknown";
// }

// export const handlers: Record<Exclude<SiteId, "unknown">, SiteHandler> = {
//   hh: {
//     name: "HeadHunter",
//     async run(ctx) {
//       ctx.log("HH: run()");
//       // TODO: steps
//     },
//     async stop(ctx) {
//       ctx.log("HH: stop()");
//     },
//   },

//   superjob: {
//     name: "SuperJob",
//     async run(ctx) {
//       ctx.log("SuperJob: run()");
//       // TODO: steps
//     },
//     async stop(ctx) {
//       ctx.log("SuperJob: stop()");
//     },
//   },
// };

// export async function dispatch(action: "RUN" | "STOP" | "TEST", ctx: BotCtx) {
//   const site = detectSite();
//   if (site === "unknown") {
//     ctx.log(`Unsupported host: ${document.location.host}`);
//     return;
//   }

//   const handler = handlers[site];
//   ctx.log(`Site: ${handler.name} (${site})`);

//   if (action === "RUN") return handler.run(ctx);
//   if (action === "STOP") return handler.stop?.(ctx);
//   if (action === "TEST") return handler.run(ctx);
// }
