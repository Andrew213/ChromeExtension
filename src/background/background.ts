console.log("   BACKGROUND");

chrome.runtime.onMessage.addListener((message) => {
  console.log("LISTEN");
});
