import { SJ } from "./bords/superjob";
import { getActiveTabHost, resolveSite, SITES } from "./utils";

const $ = (id: string) => document.getElementById(id)!;

const speedRange = $("speedRange") as HTMLInputElement;
const speedBadge = $("speedBadge") as HTMLLabelElement;
const startBtn = $("startBtn") as HTMLButtonElement;
const stopBtn = $("stopBtn") as HTMLButtonElement;
const testBtn = $("testBtn") as HTMLButtonElement;
const refreshBtn = $("refreshBtn") as HTMLButtonElement;
const responseLetter = $("coverLetter") as HTMLTextAreaElement;
const coverLetterCount = document.getElementById(
  "coverLetterCount",
) as HTMLSpanElement | null;

const settings: BotSettings = { speed: Number(speedRange.value) as Speed };

export const COVER_KEY = "jobagent.coverLetter";

function updateCoverCounter() {
  if (!coverLetterCount) return;
  coverLetterCount.textContent = String(responseLetter.value.length);
}

chrome.storage.local.get(COVER_KEY, (data) => {
  const saved = data[COVER_KEY];
  if (typeof saved === "string") {
    responseLetter.value = saved;
    updateCoverCounter();
  } else {
    updateCoverCounter();
  }
});

startBtn.onclick = async () => {
  const host = await getActiveTabHost();

  const site = resolveSite(host);

  if (site.id !== SITES.unknown) {
    let funcToRun: (settings: BotSettings) => void;

    if (site.id === SITES.hh) {
      // funcToRun = HH;
    }

    if (site.id === SITES.sj) {
      funcToRun = SJ;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const [tab] = tabs;

      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: "START_HH",
          settings: { speed: 3, responseLetter: responseLetter?.value || "" },
        });
        // chrome.scripting.executeScript({
        //   target: { tabId: tab.id },
        //   func: funcToRun,
        //   args: [settings],
        // });
      }
    });
  }
};

stopBtn.onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const [tab] = tabs;

    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: "STOP_HH",
      });
    }
  });
};

testBtn.onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const [tab] = tabs;

    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: "TEST_STEP",
        settings: { speed: 3, responseLetter: responseLetter?.value || "" },
      });
    }
  });
};
refreshBtn.onclick = renderSite;

let saveTimer: number | undefined;

responseLetter.addEventListener("input", () => {
  updateCoverCounter();

  if (saveTimer) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    chrome.storage.local.set({ [COVER_KEY]: responseLetter.value });
  }, 200);
});

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
