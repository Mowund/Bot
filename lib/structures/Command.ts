/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { ApplicationCommandData, BaseInteraction, ColorResolvable, EmbedBuilder } from 'discord.js';
import { App, EmbedBuilderOptions } from '../App.js';
import { GuildData } from './GuildData.js';
import { UserData } from './UserData.js';

export class Command {
  structure: ApplicationCommandData[];
  options?: CommandOptions;

  constructor(structure: ApplicationCommandData[], options?: CommandOptions) {
    this.structure = structure;
    this.options = options;
  }

  async run(args: CommandArgs, interaction: BaseInteraction): Promise<any> {}
}

export interface CommandOptions {
  guildOnly?: string[];
}

export interface CommandArgs {
  client: App;
  /**
   * Configure a predefined embed
   * @returns A predefined embed
   * @param options The function's options
   * @param options.addParams Adds extra parameters to the embed's footer image url
   * @param options.footer Sets the default footer type (Default: Interacted)
   * @param options.title Change the title but still including the type's emoji
   * @param options.type The type of the embed
   */
  embed(options?: Omit<EmbedBuilderOptions, 'member' | 'user'>): EmbedBuilder;
  isEphemeral: boolean;
  guildSettings: GuildData | undefined;
  localize: (phrase: string, replace?: Record<string, any>) => string;
  userSettings: UserData | undefined;
}
