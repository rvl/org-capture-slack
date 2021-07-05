import { WebClient } from '@slack/web-api';

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.remove(["token"]);
});

// This extension probably needs to be force-installed to use
// chrome.webRequest.
// https://developer.chrome.com/docs/extensions/reference/webRequest/
//
// The new API chrome.declarativeNetRequest doesn't let you see
// request content.
//
// Get the auth token from the requests and pass it to the other process.
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const token = details?.requestBody?.formData?.token[0];
    if (token) {
      chrome.storage.local.set({ token }, () => {
        console.log("Have token from API listener");
        sendTokenMessage(token);
      });
    }
    return {};
  },
  {urls: ["https://*.slack.com/api/*"]},
  [ "requestBody" ]
);

chrome.storage.onChanged.addListener(changes => {
  const token = changes.token?.newValue;
  if (token) {
    sendTokenMessage(token);
  }
});

function sendTokenMessage(token: string) {
  // const client = new WebClient(token);
  chrome.tabs.query({currentWindow: true, active: true}, tabs => {
    const tabId = tabs[0]?.id as number;
    if (tabId) {
      try {
        chrome.tabs.sendMessage(tabId, { token }, response => {
          console.log(`Response message: ${response?.msg}`);
        });
      } catch (err) {
        // Sometimes we get "Receiving end does not exist."
      }
    }
  });
}
