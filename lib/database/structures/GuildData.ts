/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { Base, Client, Snowflake } from 'discord.js';

export class GuildData extends Base {
  id: Snowflake;
  language: string;
  log: { badDomains: boolean; channel: Snowflake };
  createdAt: Date;
  updatedAt: Date;

  constructor(client: Client, data: GuildData) {
    super(client);

    this.id = data.id;
    this.language = data.language;
    this.log = {
      badDomains: data.log.badDomains || false,
      channel: data.log.channel || null,
    };
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
