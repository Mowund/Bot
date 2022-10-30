/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { Message } from 'discord.js';
import { AppUser } from './User';

export interface AppMessage extends Message {
  author: AppUser;
}
