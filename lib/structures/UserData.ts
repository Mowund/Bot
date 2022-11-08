/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { Base, Client, Collection, Snowflake } from 'discord.js';
import { ReminderData } from './ReminderData.js';

export class UserData extends Base {
  id: Snowflake;
  ephemeralResponses: boolean;
  autoLocale: boolean;
  locale?: string;
  reminders?: Collection<string, ReminderData>;

  constructor(client: Client, data: UserData) {
    super(client);

    this.id = data.id;
    this.ephemeralResponses = data.ephemeralResponses || true;
    this.autoLocale = data.autoLocale || true;
    this.locale = data.locale;
    this.reminders = data.reminders;
  }

  patch(data: any) {
    if ('ephemeralResponses' in data) this.ephemeralResponses = data.ephemeralResponses;
    if ('autoLocale' in data) this.autoLocale = data.autoLocale;
    if ('locale' in data) this.locale = data.locale;
    if ('reminders' in data) this.reminders = data.reminders;
    return data;
  }
}

export interface UserDataSetOptions {
  ephemeralResponses?: boolean;
  autoLocale?: boolean;
  locale?: string;
}
