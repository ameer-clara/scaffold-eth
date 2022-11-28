/* eslint-disable no-undef */

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("sender:", sender.tab);

  if (message.open) {
    // create new window and load in the extension page
    await chrome.windows.create({
      url: chrome.runtime.getURL("index.html"),
      type: "popup",
      width: 400,
      height: 200,
      left: 800,
      top: 100,
    });
  }
  sendResponse({ data: "success" });
});
