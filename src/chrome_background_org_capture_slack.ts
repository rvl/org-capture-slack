import { browser } from "webextension-polyfill-ts";

import {doCapture, defaultCaptureTemplate} from "./orgProtocol";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ captureTemplate: defaultCaptureTemplate });
  console.log(`Default capture template is %c${defaultCaptureTemplate}`, 'background: #222; color: #bada55');
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.remove(["captureMetadata"]);
});

// This extension probably needs to be force-installed to use
// chrome.webRequest.
// https://developer.chrome.com/docs/extensions/reference/webRequest/
//
// The new API chrome.declarativeNetRequest doesn't let you see
// request content.

// Block stars.add and stars.remove.
// Get the auth token from the requests and pass it to the other process.
chrome.webRequest.onBeforeRequest.addListener(
  () =>{ return { cancel: true }; },
  {urls: ["https://*.slack.com/api/stars.*"]},
  [ "blocking" ]
);

browser.storage.onChanged.addListener(async changes => {
  if (changes.captureMetadata?.newValue || changes.token?.newValue) {
    const { captureTemplate } = await browser.storage.sync.get("captureTemplate");

    const { captureMetadata, token } = await browser.storage.local.get(["token", "captureMetadata"]);

    if (captureMetadata && token) {
      browser.storage.local.remove("captureMetadata");
      const url = await doCapture(captureMetadata, token, captureTemplate);
      chrome.tabs.query({currentWindow: true, active: true}, tabs => {
        chrome.tabs.update(tabs[0].id as number, { url });
      });
    }
  }
});
