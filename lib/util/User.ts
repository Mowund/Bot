/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import { User } from 'discord.js';

export interface AppUser extends User {
  lastScamTimestamp?: number;
}
