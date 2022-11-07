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
  ColorResolvable,
  Colors,
  EmbedBuilder,
  GuildMember,
  Snowflake,
  User,
} from 'discord.js';
import firebase, { firestore } from 'firebase-admin';
import i18n, { GlobalCatalog, I18n, LocaleCatalog } from 'i18n';
import { Chalk, ChalkInstance } from 'chalk';
import { defaultLocale, emojis, imgOpts, supportServer } from '../src/defaults.js';
import { addSearchParams } from '../src/utils.js';
import { Command } from './structures/Command.js';
import { DatabaseManager } from './managers/DatabaseManager.js';

export class App extends Client {
  badDomains: Array<string>;
  chalk: ChalkInstance;
  commands: Collection<string, Command>;
  database: DatabaseManager;
  experiments: { data: Experiment[]; lastUpdated: number };
  firestore: firestore.Firestore;
  globalCommandCount: { chatInput: number; message: number; sum: { all: number; contextMenu: number }; user: number };
  i18n: I18n;
  octokit: Octokit;
  private nonDefaultLocales: string[];

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
    await this.updateLocalizations();
    return super.login(token);
  }

  localize = (phraseOrOptions: string | i18n.TranslateOptions, replace?: Record<string, any>) =>
    replace ? i18n.__mf(phraseOrOptions, replace) : i18n.__(phraseOrOptions);

  localizeObject(object: Record<string, any>, key: string) {
    object[`${key}Localizations`] ??= {};

    for (const locale of this.nonDefaultLocales)
      object[`${key}Localizations`][locale] = this.localize({ locale, phrase: object[key] });

    object[key] = this.localize({ locale: defaultLocale, phrase: object[key] });
  }

  localizeCommand(data: Record<string, any>) {
    if ('name' in data) this.localizeObject(data, 'name');
    if ('description' in data) this.localizeObject(data, 'description');
    if ('options' in data) for (const opt of data.options) this.localizeCommand(opt);
    if ('choices' in data) for (const ch of data.choices) this.localizeCommand(ch);
  }

  async updateLocalizations() {
    const folders = (
        await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: 'Mowund',
          path: 'locales',
          repo: 'i18n',
        })
      ).data as { name: string; path: string }[],
      locales: string[] = [],
      staticCatalog: GlobalCatalog = {};

    for (const folder of folders) {
      locales.push(folder.name);
      staticCatalog[folder.name] = JSON.parse(
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

    this.nonDefaultLocales = locales.filter((l: string) => l !== defaultLocale);

    i18n.configure({
      defaultLocale: defaultLocale,
      locales: locales,
      objectNotation: true,
      retryInDefaultLocale: true,
      staticCatalog: staticCatalog,
    });
  }

  countCommands(commands: Collection<string, ApplicationCommandData>) {
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
  }

  embedBuilder(options: EmbedBuilderOptions) {
    const emb = new EmbedBuilder().setTimestamp(options.timestamp ?? Date.now());

    if (options.footer !== 'none') {
      emb.setFooter({
        iconURL: addSearchParams(new URL((options.member ?? options.user).displayAvatarURL(imgOpts)), options.addParams)
          .href,
        text: options.localizer(`GENERIC.${options.footer === 'interacted' ? 'INTERACTED_BY' : 'REQUESTED_BY'}`, {
          userName: options.member?.displayName ?? options.user.username,
        }),
      });
    }

    switch (options.type) {
      case 'error':
        return emb.setColor(Colors.Red).setTitle(`❌ ${options.title || options.localizer('GENERIC.ERROR')}`);
      case 'loading':
        return emb
          .setColor(Colors.Blurple)
          .setTitle(`${emojis.loading} ${options.title || options.localizer('GENERIC.LOADING')}`);
      case 'success':
        return emb.setColor(Colors.Green).setTitle(`✅ ${options.title || options.localizer('GENERIC.SUCCESS')}`);
      case 'warning':
        return emb.setColor(Colors.Yellow).setTitle(`⚠️ ${options.title || options.localizer('GENERIC.WARNING')}`);
      case 'wip':
        return emb
          .setColor(Colors.Orange)
          .setTitle(`🔨 ${options.title || options.localizer('GENERIC.WIP')}`)
          .setDescription(options.localizer('GENERIC.WIP_COMMAND'));
      default:
        return (options.title ? emb.setTitle(options.title) : emb).setColor(options.color ?? null);
    }
  }

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

    let list: any;
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
  updateMowundDescription() {
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
}

export interface EmbedBuilderOptions {
  addParams?: Record<string, string>;
  color?: ColorResolvable;
  footer?: 'interacted' | 'requested' | 'none';
  localizer?: (phrase: string, replace?: Record<string, any>) => string;
  member?: GuildMember;
  timestamp?: number;
  title?: string;
  type?: 'error' | 'loading' | 'success' | 'warning' | 'wip';
  user: User;
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
