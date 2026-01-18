import { HH } from "../bords/headhunter";
import { SJ } from "../bords/superjob";
import { getActiveTabHost, resolveSite, SITES } from "../utils";

const $ = (id: string) => document.getElementById(id)!;

const speedRange = $("speedRange") as HTMLInputElement;
const speedBadge = $("speedBadge") as HTMLLabelElement;
const startBtn = $("startBtn") as HTMLButtonElement;
const stopBtn = $("stopBtn") as HTMLButtonElement;
const testBtn = $("testBtn") as HTMLButtonElement;
const refreshBtn = $("refreshBtn") as HTMLButtonElement;

const settings: BotSettings = { speed: Number(speedRange.value) as Speed };

startBtn.onclick = async () => {
  const host = await getActiveTabHost();

  const site = resolveSite(host);

  if (site.id !== SITES.unknown) {
    let funcToRun: (settings: BotSettings) => void;

    if (site.id === SITES.hh) {
      funcToRun = HH;
    }

    if (site.id === SITES.sj) {
      funcToRun = SJ;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const [tab] = tabs;

      if (tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: funcToRun,
          args: [settings],
        });
      }
    });
  }
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log({ message });
});
