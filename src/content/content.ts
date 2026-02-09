import { createJobAgent } from "../api/jobAgent";
import { tickHH } from "../bords/headhunter";

console.log("[JobAgent] content loaded", location.href);

declare global {
  interface Window {
    __jobAgent?: ReturnType<typeof createJobAgent>;
  }
}

chrome.runtime.onMessage.addListener((message) => {
  console.log("LISTEN", message);
  if (message?.type === "START_HH") {
    if (!window.__jobAgent) {
      window.__jobAgent = createJobAgent({ site: "hh", tickImpl: tickHH });
    }
    window.__jobAgent.start(message.settings);
  }
});
