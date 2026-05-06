const COVER_KEY = "jobagent.coverLetter";

export const isExtension =
  typeof chrome !== "undefined" && Boolean(chrome.runtime?.id);

export async function getActiveTabHost() {
  if (!isExtension) return "hh.ru";

  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  const urlStr = tab?.url || "";

  try {
    return urlStr ? new URL(urlStr).host : "";
  } catch {
    return "";
  }
}

export async function getStoredCoverLetter() {
  if (!isExtension) return localStorage.getItem(COVER_KEY) || "";

  const data = await chrome.storage.local.get(COVER_KEY);
  const saved = data[COVER_KEY];
  return typeof saved === "string" ? saved : "";
}

export async function setStoredCoverLetter(value: string) {
  if (!isExtension) {
    localStorage.setItem(COVER_KEY, value);
    return;
  }

  await chrome.storage.local.set({ [COVER_KEY]: value });
}

export async function sendMessageToActiveTab(message: unknown) {
  if (!isExtension) {
    console.log("[JobAgent dev] sendMessage", message);
    return;
  }

  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  if (!tab.id) return;

  try {
    await chrome.tabs.sendMessage(tab.id, message);
  } catch (error) {
    console.error("[JobAgent] failed to send tab message", error);
  }
}

export function getRuntimeUrl(path: string) {
  if (!path) return "";
  if (!isExtension) return path;
  return chrome.runtime.getURL(path.replace(/^\/+/, ""));
}
