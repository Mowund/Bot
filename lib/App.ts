/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import process from 'node:process';
import { Buffer } from 'node:buffer';
import { Octokit } from '@octokit/core';
import {
  ApplicationCommandData,
  ChatInputApplicationCommandData,
  Client,
  ClientOptions,
  Collection,
  Guild,
  Snowflake,
  User,
} from 'discord.js';
import firebase, { firestore } from 'firebase-admin';
import i18n from 'i18n';
import { Chalk, ChalkInstance } from 'chalk';
import { defaultLocale, defaultSettings, supportServer } from '../src/defaults.js';
import { removeEmpty, SearchOptions, testConditions } from '../src/utils.js';
import { Command } from './util/Command.js';
import { DatabaseManager } from './database/DatabaseManager.js';

export class App extends Client {
  badDomains: Array<string>;
  chalk: ChalkInstance;
  commands: Collection<string, Command>;
  database: DatabaseManager;
  dbCache: { guilds: Collection<string, any>; users: Collection<string, any> };
  experiments: { data: Experiment[]; lastUpdated: number };
  firestore: firestore.Firestore;
  i18n: any;
  octokit: Octokit;
  private otherLocales: string[];
  splitedCmds: Collection<string, ApplicationCommandData>;

  constructor(options: ClientOptions) {
    super(options);

    firebase.initializeApp({
      credential: firebase.credential.cert(JSON.parse(process.env.FIREBASE_TOKEN)),
    });

    this.chalk = new Chalk({ level: 3 });
    this.commands = new Collection();
    this.database = new DatabaseManager(this);
    this.dbCache = { guilds: new Collection(), users: new Collection() };
    this.firestore = firebase.firestore();
    this.i18n = i18n;
    this.splitedCmds = new Collection();
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

  /** Splits subcommands and groups as if they were also commands, used for counting
   * @deprecated A new function for counting commands is coming soon
   */
  splitCmds = (commands: Collection<string, ApplicationCommandData>) => {
    for (const cmd of commands) {
      let i = 0;
      if ((cmd[1] as ChatInputApplicationCommandData).options) {
        for (let opt of (cmd[1] as ChatInputApplicationCommandData).options) {
          if (opt.type === 1) {
            commands.delete(cmd[0]);
            // @ts-expect-error: Temporary solution
            commands.set(`${cmd[0]} ${i++}`, opt);
          } else if (opt.type === 2) {
            for (opt of opt.options) {
              if (opt.type === 1) {
                commands.delete(cmd[0]);
                // @ts-expect-error: Temporary solution
                commands.set(`${cmd[0]} ${i++}`, opt);
              }
            }
          }
        }
      }
    }
    return commands;
  };

  /** Updates Mowund support server description */
  updateMowundDescription = () =>
    this.shard.broadcastEval(
      async (c: this, { serverId }) =>
        c.guilds.cache.get(serverId)?.edit({
          description: `Mowund is a multi-purpose bot with ${c.splitedCmds.size} commands in ${(
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
