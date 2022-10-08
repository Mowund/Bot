/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { Base, Client, Snowflake } from 'discord.js';

export class UserData extends Base {
  id: Snowflake;
  locale: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(client: Client, data: UserData) {
    super(client);

    this.id = data.id;
    this.locale = data.locale;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
