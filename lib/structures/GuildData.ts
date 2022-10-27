/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { Base, Client, Snowflake } from 'discord.js';

export class GuildData extends Base {
  id: Snowflake;
  language?: string;
  log?: { badDomains?: boolean; channel?: Snowflake };

  constructor(client: Client, data: GuildData) {
    super(client);

    this.id = data.id;
    this.language = data.language;
    this.log = {
      badDomains: data.log?.badDomains || false,
      channel: data.log?.channel || null,
    };
  }

  patch(data: any) {
    if ('language' in data) this.language = data.language;
    if ('log' in data) this.log = data.log;
    return data;
  }
}

export interface GuildDataSetOptions {
  language?: string;
  log?: { badDomains?: boolean; channel?: Snowflake };
}
