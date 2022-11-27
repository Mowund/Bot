/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { Base, CachedManager, Snowflake } from 'discord.js';
import { App } from '../App.js';
import { GuildsDataManager } from './GuildsDataManager.js';
import { RemindersDataManager } from './RemindersDataManager.js';
import { UsersDataManager } from './UsersDataManager.js';

export class DatabaseManager extends CachedManager<Snowflake, Base, Base> {
  declare client: App;
  guilds: GuildsDataManager;
  reminders: RemindersDataManager;
  users: UsersDataManager;

  constructor(client: App) {
    super(client, Base);

    this.guilds = new GuildsDataManager(client);
    this.reminders = new RemindersDataManager(client);
    this.users = new UsersDataManager(client);
  }
}
