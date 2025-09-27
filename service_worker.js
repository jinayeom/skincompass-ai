// Runs when extension is first installed 

chrome.runtime.onInstalled.addListener(() => {
  console.log("SkinCompass AI installed");
});

// Configures side panel
chrome.sidePanel.setOptions({ path: "sidepanel/index.html", enabled: true });

// Opens side panel when extension icon clicked 
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (e) {
    console.warn("Could not open side panel", e);
  }
});

// Simple ping listener for testing 
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "PING") sendResponse({ ok: true, ts: Date.now() });
});