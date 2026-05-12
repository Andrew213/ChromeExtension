import type { SiteId } from "../utils";
import { ContentMessageType } from "@/messages";

const COVER_KEY = "jobagent.coverLetter";

export const isExtension =
  typeof chrome !== "undefined" && Boolean(chrome.runtime?.id);

export type AgentHealth = {
  ok: true;
  site: SiteId;
  ready: boolean;
  href: string;
  capabilities: {
    start: boolean;
    stop: boolean;
    testStep: boolean;
  };
};

function isPageTab(tab?: chrome.tabs.Tab): tab is chrome.tabs.Tab {
  if (!tab?.id || !tab.url) return false;

  try {
    const url = new URL(tab.url);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function queryActivePageTab(queryInfo: chrome.tabs.QueryInfo) {
  const tabs = await chrome.tabs.query(queryInfo);
  return tabs.find(isPageTab);
}

async function getActivePageTab() {
  const currentWindowTab = await queryActivePageTab({
    active: true,
    currentWindow: true,
  });

  if (currentWindowTab) return currentWindowTab;

  const lastFocusedWindowTab = await queryActivePageTab({
    active: true,
    lastFocusedWindow: true,
  });

  if (lastFocusedWindowTab) return lastFocusedWindowTab;

  const windows = await chrome.windows.getAll({
    populate: true,
    windowTypes: ["normal"],
  });

  const activeTabs = windows
    .flatMap((window) => window.tabs ?? [])
    .filter((tab) => tab.active);

  return activeTabs.find(isPageTab);
}

export async function getActiveTabHost() {
  if (!isExtension) return "hh.ru";

  const tab = await getActivePageTab();

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

export async function sendMessageToActiveTab<T = unknown>(
  message: unknown,
  options: { silent?: boolean } = {},
): Promise<T | undefined> {
  if (!isExtension) {
    console.log("[JobAgent dev] sendMessage", message);
    return undefined;
  }

  const tab = await getActivePageTab();

  if (!tab?.id) return undefined;

  try {
    return await new Promise<T | undefined>((resolve) => {
      chrome.tabs.sendMessage(tab.id!, message, (response: T | undefined) => {
        const error = chrome.runtime.lastError;

        if (error) {
          if (!options.silent) {
            console.warn(
              "[JobAgent] failed to send tab message:",
              error.message,
            );
          }
          resolve(undefined);
          return;
        }

        resolve(response);
      });
    });
  } catch (error) {
    if (!options.silent) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("[JobAgent] failed to send tab message:", message);
    }
    return undefined;
  }
}

export async function pingActiveTabAgent(): Promise<AgentHealth | undefined> {
  if (!isExtension) {
    return {
      ok: true,
      site: "hh",
      ready: true,
      href: "https://hh.ru",
      capabilities: {
        start: true,
        stop: true,
        testStep: true,
      },
    } satisfies AgentHealth;
  }

  return sendMessageToActiveTab<AgentHealth>(
    { type: ContentMessageType.Ping },
    { silent: true },
  );
}

export function getRuntimeUrl(path: string) {
  if (!path) return "";
  if (!isExtension) return path;
  return chrome.runtime.getURL(path.replace(/^\/+/, ""));
}
