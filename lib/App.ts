/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import process from 'node:process';
import { Buffer } from 'node:buffer';
import { Octokit } from '@octokit/core';
import {
  ApplicationCommand,
  ApplicationCommandData,
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ApplicationCommandType,
  ChatInputApplicationCommandData,
  Client,
  ClientOptions,
  Collection,
  Snowflake,
} from 'discord.js';
import firebase, { firestore } from 'firebase-admin';
import i18n from 'i18n';
import { Chalk, ChalkInstance } from 'chalk';
import { defaultLocale, supportServer } from '../src/defaults.js';
import { Command } from './structures/Command.js';
import { DatabaseManager } from './managers/DatabaseManager.js';

export class App extends Client {
  badDomains: Array<string>;
  chalk: ChalkInstance;
  commands: Collection<string, Command>;
  globalCommandCount: { chatInput: number; message: number; sum: { all: number; contextMenu: number }; user: number };
  database: DatabaseManager;
  experiments: { data: Experiment[]; lastUpdated: number };
  firestore: firestore.Firestore;
  i18n: any;
  octokit: Octokit;
  private otherLocales: string[];

  constructor(options: ClientOptions) {
    super(options);

    firebase.initializeApp({
      credential: firebase.credential.cert(JSON.parse(process.env.FIREBASE_TOKEN)),
    });

    this.chalk = new Chalk({ level: 3 });
    this.commands = new Collection();
    this.database = new DatabaseManager(this);
    this.firestore = firebase.firestore();
    this.i18n = i18n;
  }

  async login(token?: string) {
    this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    i18n.configure({
      defaultLocale: defaultLocale,
      locales: await this.getBotStaticCatalog(true),
      objectNotation: true,
      retryInDefaultLocale: true,
      staticCatalog: await this.getBotStaticCatalog(),
    });

    this.otherLocales = i18n.getLocales().filter((l: string) => l !== defaultLocale);

    return super.login(token);
  }

  autoLocalize = (object: Record<string, any>, key: string) => {
    object[`${key}Localizations`] ??= {};

    for (const locale of this.otherLocales) {
      i18n.setLocale(locale);
      object[`${key}Localizations`][locale] = i18n.__(object[key]);
    }

    i18n.setLocale(defaultLocale);
    object[key] = i18n.__(object[key]);
  };

  autoLocalizeCommand = (data: Record<string, any>) => {
    if ('name' in data) this.autoLocalize(data, 'name');
    if ('description' in data) this.autoLocalize(data, 'description');
    if ('options' in data) for (const opt of data.options) this.autoLocalizeCommand(opt);
    if ('choices' in data) for (const ch of data.choices) this.autoLocalizeCommand(ch);
  };

  countCommands = (commands: Collection<string, ApplicationCommandData>) => {
    const chatInput = commands
        .filter(c => c.type === ApplicationCommandType.ChatInput)
        .reduce(
          (acc1, value1: ChatInputApplicationCommandData) =>
            acc1 +
            (value1.options?.reduce(
              (acc2, value2) =>
                acc2 +
                (value2.type === ApplicationCommandOptionType.SubcommandGroup
                  ? value2.options.reduce(acc3 => ++acc3, 0)
                  : value2.type === ApplicationCommandOptionType.Subcommand
                  ? 1
                  : 0),
              0,
            ) || 1),
          0,
        ),
      message = commands.filter(c => c.type === ApplicationCommandType.Message).size,
      user = commands.filter(c => c.type === ApplicationCommandType.User).size,
      contextMenu = message + user;

    return {
      chatInput,
      message,
      sum: {
        all: contextMenu + chatInput,
        contextMenu,
      },
      user,
    };
  };

  /**
   * @returns The bot static catalog or supported languages
   * @param supportedLanguages Whether to return the supported languages instead of static catalog
   */
  async getBotStaticCatalog(supportedLanguages = false) {
    const folders = (
      await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: 'Mowund',
        path: 'locales',
        repo: 'i18n',
      })
    ).data as { name: string; path: string }[];

    let list;
    if (supportedLanguages) {
      list = [];
      for (const folder of folders) list.push(folder.name);
    } else {
      list = {};
      for (const folder of folders) {
        list[folder.name] = JSON.parse(
          Buffer.from(
            (
              (await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: 'Mowund',
                path: `${folder.path}/bot.json`,
                repo: 'i18n',
              })) as { data: { content: string } }
            ).data.content,
            'base64',
          ).toString(),
        );
      }
    }

    return list;
  }

  /** Updates Mowund support server description */
  updateMowundDescription = () =>
    this.shard.broadcastEval(
      async (c: this, { serverId }) =>
        c.guilds.cache.get(serverId)?.edit({
          description: `Mowund is a multi-purpose bot with ${c.globalCommandCount.sum.all} commands in ${(
            (await c.shard.fetchClientValues('guilds.cache.size')) as number[]
          ).reduce((acc, a) => acc + a, 0)} servers.`,
        }),
      { context: { serverId: supportServer.id } },
    );
}

export interface Experiment {
  hash: number;
  created_at: number;
  updated_at: number;
  buckets: {
    bucket: number;
    title: string;
    description: string | null;
  }[];
  id: string;
  title: string;
  type: 'guild' | 'user';
  in_client: boolean;
}

export interface ExperimentRollout {
  created_at: number;
  hash: number;
  overrides: Record<Snowflake, number>[];
  populations: {
    buckets: {
      bucket: number;
      positions: {
        end: number;
        start: number;
      }[];
    }[];
    filters: {
      features?: string[];
      type: 'guild_features' | 'guild_id_range' | 'guild_ids' | 'member_count_range';
      max?: number | null | string;
      min?: number | string;
      ids?: Array<number | string>;
    }[];
  }[];
  revision: number;
  updated_at: number;
}
