/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import process from 'node:process';
import firebase from 'firebase-admin';
import { CachedManager, Client } from 'discord.js';
import { BaseDatabase } from './structures/BaseDatabase';
import { GuildData } from './structures/GuildData';
import { ReminderData } from './structures/ReminderData';
import { UserData } from './structures/UserData';
import { DatabaseGuildsManager } from './DatabaseGuildsManager';

export class DatabaseManager extends CachedManager<string, BaseDatabase, GuildData | ReminderData | UserData> {
  guilds: DatabaseGuildsManager;

  constructor(client: Client) {
    super(client, BaseDatabase);

    firebase.initializeApp({
      credential: firebase.credential.cert(JSON.parse(process.env.FIREBASE_TOKEN)),
    });

    this.guilds = new DatabaseGuildsManager(client);
  }
}
