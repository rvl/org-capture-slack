import {CaptureMetadata, MessageInfo} from "./types";
import { fetchMessageInfo } from "./fetchSlack";

//////////////////////////////////////////////////////////////////////

export const defaultCaptureTemplate = "lm";

export function makeMessageURL(meta: CaptureMetadata): string {
  // example:
  // https://rvl-test.slack.com/archives/CLEHCKMQW/p1616409584000200
  // {button: "save", channelId: "CLEHCKMQW", ts: "1616409584.000200", messageContainerType: "message-pane"}
  const msg = "p" + meta.uiState.ts.replace(".", "");
  return `${location.protocol}//${location.hostname}/archives/${meta.id}/${msg}`;
}

export function orgProtocolURI(params: { [key: string]: string }): string {
  const scheme = "org-protocol://";
  const method = "capture";
  const query = Object.keys(params).map(key => {
    const value = params[key];
    return value ? (key + "=" + encodeURIComponent(value)) : ""
  }).filter(p => !!p).join("&");
  return scheme + method + "?" + query;
}

export async function doCapture(captureMetadata: CaptureMetadata, token: string, template: string): Promise<string> {
  console.log("captureMetadata", captureMetadata);
  console.log("token", token);

  const msg = await fetchMessageInfo(captureMetadata, token);
  // const msg = { permalink: makeMessageURL(captureMetadata), content: "", author: "" }
  console.log("Message info", msg);

  const uri = getCaptureURI(msg, template);
  console.log("URI: " + uri);
  return uri;
}

export function getCaptureURI(msg: MessageInfo, template: string): string {
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
