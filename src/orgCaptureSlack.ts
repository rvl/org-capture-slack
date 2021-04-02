import {CaptureMetadata, MessageInfo} from "./types";
import { fetchMessageInfo } from "./fetchSlack";

const captureTemplate = "lm"

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ captureTemplate });
  console.log(`Default capture template is %c${captureTemplate}`, 'background: #222; color: #bada55');
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

// chrome.storage.onChanged.addListener((changes, namespace) => {
//   for (var key in changes) {
//     var storageChange = changes[key];
//     console.log('Storage key "%s" in namespace "%s" changed. ' +
//                 'Old value was "%s", new value is "%s".',
//                 key,
//                 namespace,
//                 storageChange.oldValue,
//                 storageChange.newValue);
//   }
// });

chrome.storage.onChanged.addListener(changes => {
  if (changes.captureMetadata?.newValue || changes.token?.newValue) {
    const cfg = ["token", "captureMetadata", "captureTemplate"];
    chrome.storage.local.get(cfg, async items => {
      if (await doCapture(items.captureMetadata, items.token, items.captureTemplate)) {
        chrome.storage.local.remove("captureMetadata");
      }
    });
  }
});

//////////////////////////////////////////////////////////////////////

function makeMessageURL(meta: CaptureMetadata): string {
  // example:
  // https://rvl-test.slack.com/archives/CLEHCKMQW/p1616409584000200
  // {button: "save", channelId: "CLEHCKMQW", ts: "1616409584.000200", messageContainerType: "message-pane"}
  const msg = "p" + meta.ts.replace(".", "");
  return `${location.protocol}//${location.hostname}/archives/${meta.channelId}/${msg}`;
}

function orgProtocolURI(params: { [key: string]: string }): string {
  const scheme = "org-protocol://";
  const method = "capture";
  const query = Object.keys(params).map(key => {
    const value = params[key];
    return value ? (key + "=" + encodeURIComponent(value)) : ""
  }).filter(p => !!p).join("&");
  return scheme + method + "?" + query;
}

async function doCapture(captureMetadata?: CaptureMetadata, token?: string, template?: string): Promise<boolean> {
  if (captureMetadata && token) {
    console.log("captureMetadata", captureMetadata);
    console.log("token", token);

    const msg = await fetchMessageInfo(captureMetadata, token);
    // const msg = { permalink: makeMessageURL(captureMetadata), content: "", author: "" }
    console.log("Message info", msg);

    const uri = getCaptureURI(msg, template || captureTemplate);
    console.log("URI: " + uri);
    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
      chrome.tabs.update(tabs[0].id as number, {url: uri});
    });
    return true;
  }
  return false;
}

function getCaptureURI(msg: MessageInfo, template: string): string {
  const day = (new Intl.DateTimeFormat('en-GB', { weekday: 'short' })).format(msg.date);
  const time = msg.date.toISOString().replace(/:[0-9]+\..*/, "").replace("T", ` ${day} `);
  const title = msg.author + (msg.channel ? ` in ${msg.channel}` : "");

  // https://orgmode.org/manual/The-capture-protocol.html#The-capture-protocol
  return orgProtocolURI({
    url: msg.permalink,
    template,
    title,
    body: `${title} at [${time}]\n${msg.content}`
  });
}
