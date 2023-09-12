// {button: "save", channelId: "CLEHCKMQW", ts: "1616409584.000200", messageContainerType: "message-pane"}
// {id: "CLEHCKMQW", params: { messageContainerType: "Channel" }, uiState: { ts: "1689705262.534379", button: "later" }
export interface CaptureMetadata {
  id: string;
  uiState: {
    ts: string;
  };
}

export interface MessageInfo {
  permalink: string;
  // threadContent: string;
  content: string;
  author: string;
  date: Date;
  channel: string;
}

export function tsToTime(ts: string): Date {
  return new Date(parseInt(ts.split(".", 1)[0], 10) * 1000);
}

/* Browser extension message passing */
export type Msg = TokenMsg | CaptureMetadataMsg | OrgProtocolMsg;

export interface TokenMsg {
  token: string;
}

export interface CaptureMetadataMsg {
  captureMetadata: CaptureMetadata;
}

export interface OrgProtocolMsg {
  uri: string;
}
