// import { WebClient } from '@slack/web-api';

import { browser, Runtime, WebRequest } from "webextension-polyfill-ts";

const storage = browser.storage.local;

storage.remove("token");

let ports: Runtime.Port[] = [];

browser.runtime.onConnect.addListener(p => {
  const tabId = p.sender?.tab?.id;
  console.log(`grab token port connection tabId=${tabId}`, p);
  if (tabId !== undefined) {
    ports[tabId] = p;
    p.onDisconnect.addListener(() => delete ports[tabId]);
  }
});

// Get the auth token from the requests and pass it to the other process.
async function capture(details: WebRequest.OnBeforeRequestDetailsType): Promise<WebRequest.BlockingResponse>{
  const token = details?.requestBody?.formData?.token[0];
  // console.log(`Capture token=${token} url=${details.url}`, details);

  if (token) {
    await storage.set({ token });
  }

  if (details.url.match(/\/stars\.(add|remove)/)) {
    return { cancel: true };
  } else {
    return {};
  }
}

browser.webRequest.onBeforeRequest.addListener(capture, { urls: ["https://*.slack.com/api/*"] }, ["blocking", "requestBody"]);

browser.storage.onChanged.addListener(changes => {
  const token = changes.token?.newValue;
  if (token && changes.token.newValue !== changes.token.oldValue) {
    sendTokenMessage(token);
  }
});

async function sendTokenMessage(token: string) {
  // window.eval(`window.token = "${token};`);
  ports.forEach(p => {
    p.postMessage({ token });
  })
}
