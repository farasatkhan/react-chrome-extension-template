chrome.runtime.onMessage.addListener((data) => {
  const { event, prefs } = data;

  switch (event) {
    case "submit":
      setChromeCookies(prefs);
      break;
  }
});

// Inject content script only on ChatGPT pages
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.url?.startsWith("chrome://")) return undefined;
  if (!tab.url?.includes("chatgpt.com")) return undefined;

  console.log("Injecting content script into ChatGPT page");

  const { status } = changeInfo;
  if (status === "complete") {
    chrome.scripting.executeScript({
      files: ["contentScript.js"],
      target: { tabId: tab.id },
    });
  }
});

chrome.runtime.onInstalled.addListener((response) => {
  const { reason } = response;
});

const setChromeCookies = (data) => {
  chrome.storage.local.set(data);
};

// Get Current Website URL
export const getCurrentWebsiteURL = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  const url = new URL(tab.url);
  const origin = url.origin; // "https://tailwindcss.com"
  const hostname = url.hostname; // "tailwindcss.com"
  console.log(hostname);
};
