import axios from 'axios';
import { AxiosInstance } from 'axios';

import {CaptureMetadata, MessageInfo} from "./types";

export async function fetchMessageInfo(captureMetadata: CaptureMetadata, token: string): Promise<MessageInfo> {
  const client = axios.create({
    baseURL: 'https://slack.com/api/',
    headers: {'Authorization': 'Bearer ' + token }
  });

  const [msg, permalink] = await Promise.all([
    fetchMessage(client, captureMetadata.channelId, captureMetadata.ts),
    fetchPermalink(client, captureMetadata.channelId, captureMetadata.ts)
  ]);
  const username = await fetchUsername(client, msg.user);
  return { permalink, content: msg.text, author: username };
}
async function fetchPermalink(client: AxiosInstance, channel: string, ts: string): Promise<string> {
  const result = await client.get("chat.getPermalink", { params: {
    channel,
    message_ts: ts,
  } });
  return (result.data as any).permalink;
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
