import { Snowflake } from 'discord.js';

export class Guilds {
  id: Snowflake;
  language: string;
  log: { badDomains: boolean; channel: Snowflake };
  createdAt: Date;
  updatedAt: Date;

  constructor(params: Guilds) {
    this.id = params.id;
    this.language = params.language;
    this.log = {
      badDomains: params.log.badDomains || false,
      channel: params.log.channel || null,
    };
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}

export class Users {
  id: Snowflake;
  locale: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: Users) {
    this.id = params.id;
    this.locale = params.locale;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}

export class Reminders {
  id: Snowflake;
  channelId: Snowflake;
  content: string;
  isRecursive: boolean;
  timestamp: Date;
  userId: Snowflake;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: Reminders) {
    this.id = params.id;
    this.channelId = params.channelId;
    this.content = params.content;
    this.isRecursive = params.isRecursive;
    this.timestamp = params.timestamp;
    this.userId = params.userId;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}
