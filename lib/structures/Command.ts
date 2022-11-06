/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { ApplicationCommandData, BaseInteraction, ColorResolvable, EmbedBuilder } from 'discord.js';
import { App } from '../App';

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
  embed(options?: {
    addParams?: Record<string, string>;
    color?: ColorResolvable;
    footer?: 'interacted' | 'requested' | 'none';
    timestamp?: number;
    title?: string;
    type?: 'error' | 'success' | 'warning' | 'wip';
  }): EmbedBuilder;
}
