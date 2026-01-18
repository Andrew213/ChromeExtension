export const HH = (settings: BotSettings) => {
  console.log("HH", settings);

  chrome.runtime.sendMessage({
    type: "HELLO",
  });

  let skiped = 0;
};
