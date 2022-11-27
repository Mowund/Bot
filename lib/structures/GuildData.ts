/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { Snowflake } from 'discord.js';
import { App } from '../App.js';
import { Base } from './Base.js';

export class GuildData extends Base {
  id: Snowflake;
  allowNonEphemeral?: { channelIds?: Snowflake[]; roleIds?: Snowflake[] };

  constructor(client: App, data: GuildData) {
    super(client);

    this.id = data.id;
    this.allowNonEphemeral = {
      channelIds: data.allowNonEphemeral?.channelIds && Object.values(data.allowNonEphemeral.channelIds),
      roleIds: data.allowNonEphemeral?.roleIds && Object.values(data.allowNonEphemeral.roleIds),
    };
  }

  set(data: GuildDataSetOptions, { merge = true, setFromCache = false } = {}) {
    return this.client.database.guilds.set(this.id, data, { merge, setFromCache });
  }

  delete({ leaveCached = false } = {}) {
    return this.client.database.guilds.delete(this.id, { leaveCached });
  }

  _patch(data: any) {
    if ('allowNonEphemeral' in data) {
      this.allowNonEphemeral = {
        channelIds: Object.values(data.allowNonEphemeral?.channelIds),
        roleIds: Object.values(data.allowNonEphemeral?.roleIds),
      };
    }
    return data;
  }
}

export interface GuildDataSetOptions {
  allowNonEphemeral?: { channelIds?: Snowflake[]; roleIds?: Snowflake[] };
}
