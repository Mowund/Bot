/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { Base, Client, Snowflake } from 'discord.js';
import { Guilds } from '../Collections';

export class ReminderData extends Base {
  id: Snowflake;
  channelId: Snowflake;
  content: string;
  isRecursive: boolean;
  timestamp: Date;
  userId: Snowflake;
  createdAt: Date;
  updatedAt: Date;

  constructor(client: Client, data: ReminderData) {
    super(client);

    this.id = data.id;
    this.channelId = data.channelId;
    this.content = data.content;
    this.isRecursive = data.isRecursive;
    this.timestamp = data.timestamp;
    this.userId = data.userId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
