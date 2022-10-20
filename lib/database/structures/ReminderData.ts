/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { Base, Client, Snowflake } from 'discord.js';

export class ReminderData extends Base {
  id: Snowflake;
  channelId: Snowflake;
  content: string;
  isRecursive?: boolean;
  timestamp: number;
  userId: Snowflake;

  constructor(client: Client, data: ReminderData) {
    super(client);

    this.id = data.id;
    this.channelId = data.channelId;
    this.content = data.content;
    this.isRecursive = data.isRecursive;
    this.timestamp = data.timestamp;
    this.userId = data.userId;
  }

  patch(data: any) {
    if ('channelId' in data) this.channelId = data.channelId;
    if ('content' in data) this.content = data.content;
    if ('isRecursive' in data) this.isRecursive = data.isRecursive;
    if ('timestamp' in data) this.timestamp = data.timestamp;
    if ('userId' in data) this.userId = data.userId;
    return data;
  }
}

export interface ReminderDataSetOptions {
  channelId?: Snowflake;
  content?: string;
  isRecursive?: boolean;
  timestamp?: number;
  userId?: Snowflake;
}
