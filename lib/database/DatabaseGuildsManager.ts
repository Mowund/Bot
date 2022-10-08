/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import process from 'node:process';
import firebase from 'firebase-admin';
import {
  Base,
  CachedManager,
  Client,
  Collection,
  DataResolver,
  DiscordjsErrorCodes,
  DiscordjsTypeError,
  Routes,
} from 'discord.js';
import { GuildData } from './structures/GuildData';
import { DatabaseManager } from './DatabaseManager';

export class DatabaseGuildsManager extends DatabaseManager {
  constructor(client: Client) {
    super(client);
  }
}
