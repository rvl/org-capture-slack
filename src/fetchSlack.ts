import axios from 'axios';
import { AxiosInstance } from 'axios';

import {tsToTime, CaptureMetadata, MessageInfo} from "./types";

export async function fetchMessageInfo(captureMetadata: CaptureMetadata, token: string): Promise<MessageInfo> {
  const client = axios.create({
    baseURL: 'https://slack.com/api/',
    headers: {'Authorization': 'Bearer ' + token }
  });

  const [msg, permalink, channel] = await Promise.all([
    fetchMessage(client, captureMetadata.channelId, captureMetadata.ts),
    fetchPermalink(client, captureMetadata.channelId, captureMetadata.ts),
    fetchChannelName(client, captureMetadata.channelId),
  ]);
  const username = await fetchUsername(client, msg.user);
  return {
    permalink,
    channel,
    content: msg.text,
    author: username,
    date: tsToTime(captureMetadata.ts),
  };
}

async function fetchPermalink(client: AxiosInstance, channel: string, ts: string): Promise<string> {
  const result = await client.get("chat.getPermalink", { params: {
    channel,
    message_ts: ts,
  } });
  return (result.data as any).permalink;
}

async function fetchChannelName(client: AxiosInstance, channel: string): Promise<string> {
  const result = await client.get("conversations.info", { params: { channel } });
  const info = (result.data as any).channel;
  return info.is_channel ? `#${info.name}` : "";
}

interface Message {
  type: "message";
  user: string;
  text: string;
  ts: string;
}

async function fetchMessage(client: AxiosInstance, channel: string, ts: string): Promise<Message> {
  const result = await client.get("conversations.history", {
    params: {
      channel,
      latest: ts,
      inclusive: true,
      limit: 1,
    }
  });

  return (result.data as any).messages[0];
}

async function fetchUsername(client: AxiosInstance, user: string): Promise<string> {
  const result = await client.get("users.info", { params: { user } });
  return (result.data as any).user.real_name;
}
