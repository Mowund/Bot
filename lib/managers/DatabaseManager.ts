/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { Base, CachedManager, Snowflake } from 'discord.js';
import { App } from '../App.js';
import { DatabaseGuildsManager } from './DatabaseGuildsManager.js';
import { DatabaseRemindersManager } from './DatabaseRemindersManager.js';
import { DatabaseUsersManager } from './DatabaseUsersManager.js';

export class DatabaseManager extends CachedManager<Snowflake, Base, Base> {
  declare client: App;
  guilds: DatabaseGuildsManager;
  reminders: DatabaseRemindersManager;
  users: DatabaseUsersManager;

  constructor(client: App) {
    super(client, Base);

    this.guilds = new DatabaseGuildsManager(client);
    this.reminders = new DatabaseRemindersManager(client);
    this.users = new DatabaseUsersManager(client);
  }
}
