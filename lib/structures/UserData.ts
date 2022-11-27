/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { Snowflake } from 'discord.js';
import { App } from '../App.js';
import { UserRemindersDataManager } from '../managers/UserRemindersDataManager.js';
import { Base } from './Base.js';

export class UserData extends Base {
  id: Snowflake;
  ephemeralResponses: boolean;
  autoLocale: boolean;
  locale?: string;

  constructor(client: App, data: UserData) {
    super(client);

    this.id = data.id;
    this.ephemeralResponses = data.ephemeralResponses;
    this.autoLocale = data.autoLocale;
    this.locale = data.locale;
  }

  get reminders() {
    return new UserRemindersDataManager(this);
  }

  set(data: UserDataSetOptions, { merge = true, setFromCache = false } = {}) {
    return this.client.database.users.set(this.id, data, { merge, setFromCache });
  }

  delete({ leaveCached = false } = {}) {
    return this.client.database.users.delete(this.id, { leaveCached });
  }

  _patch(data: any) {
    if ('ephemeralResponses' in data) this.ephemeralResponses = data.ephemeralResponses;
    if ('autoLocale' in data) this.autoLocale = data.autoLocale;
    if ('locale' in data) this.locale = data.locale;
    return data;
  }
}

export interface UserDataSetOptions {
  ephemeralResponses?: boolean;
  autoLocale?: boolean;
  locale?: string;
}
