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

export class App extends Client {
  badDomains: Array<string>;
  chalk: ChalkInstance;
  commands: Collection<string, Command>;
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
   * Gets the settings of a database's document
   * @deprecated A new function for this is coming soon
   * @returns The collection's settings
   * @param collection The collection
   * @param options The function's options
   */
  dbGet = async (
    collection: string | Guild | User,
    options: {
      /** Whether to search for data from only the cache or the database (Default: Both, first search on the cache then, if not found, on the database)*/
      searchOnly?: 'both' | 'cache' | 'database';
      /** Get further subcollection*/
      subCollections?: string[][];
    } = {},
  ) => {
    options.searchOnly ??= 'both';
    if (!collection) return;
    try {
      const lastSub = options.subCollections?.[options.subCollections.length - 1];
      let dbCache,
        dbColl,
        collectionId = (collection as Guild | User).id,
        isGroup = false;

      if (collection instanceof Guild) {
        dbColl = 'guilds';
      } else if (collection instanceof User) {
        dbColl = 'users';
      } else {
        const splitColl = collection.split('/');
        collectionId = splitColl[1];
        dbColl = splitColl[0];
        isGroup = true;
      }

      let cacheStts = (dbCache = this.dbCache[dbColl])?.get((collection as Guild | User).id),
        db = (
          isGroup
            ? (await this.firestore.collectionGroup(dbColl).where('id', '==', collectionId).get()).docs[0]
            : this.firestore.collection(dbColl).doc(collectionId)
        ) as
          | firestore.QueryDocumentSnapshot<firestore.DocumentData>
          | firestore.DocumentReference<firestore.DocumentData>
          | firestore.CollectionReference<firestore.DocumentData>;

      options.subCollections?.forEach(e => {
        cacheStts = cacheStts?.get?.(e[0]);
        db = (db as firestore.DocumentReference<firestore.DocumentData>).collection(e[0]);
        if (e[1]) {
          db = db?.doc(e[1]);
          if (!lastSub[1]) cacheStts = cacheStts?.get?.(e[1]);
        }
      });

      if (cacheStts?.map) cacheStts = cacheStts.map(v => v);

      let settings = options.searchOnly !== 'database' && cacheStts;

      if (!settings && options.searchOnly !== 'cache') {
        let doc = isGroup ? db : await db.get(null);

        if (lastSub && !lastSub?.[1]) doc = doc.docs;
        if (
          !lastSub &&
          (!doc.exists || (isGroup && !(db as firestore.QueryDocumentSnapshot<firestore.DocumentData>).exists))
        ) {
          if (options.subCollections) options.subCollections[options.subCollections.length - 1][1] = collectionId;
          return this.dbSet(
            collection,
            {},
            {
              setFromCache: true,
              subCollections: options.subCollections,
            },
          );
        }
        settings = Array.isArray(doc) ? doc.map(e => e.data()) : doc.data();
      }

      if (!lastSub?.[1]) {
        cacheStts = removeEmpty({ ...(cacheStts || defaultSettings[dbColl]), ...settings });

        if (options.subCollections) {
          const sttsColl = new Collection<string, Collection<string, any>>();
          let nestedStts = sttsColl;

          options.subCollections.forEach((e, i) => {
            nestedStts = (nestedStts.first() || nestedStts)
              .set(
                e[0],
                e[1]
                  ? new Collection().set(e[1], i === --options.subCollections.length ? cacheStts : new Collection())
                  : cacheStts,
              )
              .first();
          });

          dbCache.set(collectionId, sttsColl);
        } else {
          dbCache.set(collectionId, cacheStts);
        }
      }

      return settings;
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Gets the settings of a database's document
   * @deprecated A new function for this is coming soon
   * @returns The collection's settings
   * @param collection Which collection to search through.
   * @param search Search for documents matching conditions
   * @param options The function's options
   */
  dbFind = async (
    collection: string,
    search: SearchOptions[][],
    options: {
      /** Define where to search for the cache */
      cacheReference?: {
        /** The main collection for the cache */
        collection: string;
        /** The options to destructure */
        options: string[];
      };
      /** Define new settings after the document is found. Changes 'searchOnly' option to 'both', searching for and setting data from the cache first, then, if not found, from the database */
      findAndSet?: 'delete' | typeof defaultSettings;
      /** Whether to merge the new settings with the old (or default, if setFromCache is enabled) ones (Default: True) */
      merge?: boolean;
      /** Whether to search for data from only the cache or the database (Default: Database) */
      searchOnly?: 'both' | 'cache' | 'database';
      /** Whether to define using the settings saved in the cache (Default: False) */
      setFromCache?: boolean;
    } = {},
  ) => {
    if (!collection) return;
    try {
      const isGroup = collection.startsWith('/');
      let db:
          | firestore.CollectionGroup<firestore.DocumentData>
          | firestore.CollectionReference<firestore.DocumentData>
          | firestore.Query<firestore.DocumentData>,
        dbQ: firestore.CollectionGroup<firestore.DocumentData> | firestore.CollectionReference<firestore.DocumentData>;
      options.merge ??= true;
      options.searchOnly ??= options.findAndSet ? 'both' : 'database';

      if (isGroup) {
        collection = collection.split('/')[1];
        dbQ = db = this.firestore.collectionGroup(collection);
      } else {
        dbQ = db = this.firestore.collection(collection);
      }

      let dbCache = this.dbCache[options.cacheReference?.collection ?? collection];

      const cSettings = defaultSettings[collection],
        settings = new Collection(),
        fSet = async (x, y) => {
          if (options.cacheReference) {
            if (dbCache.size) {
              dbCache = dbCache
                .find(a => {
                  a = a?.get?.(collection)?.find?.(c => {
                    options.cacheReference.options.forEach(d => (c = [d]));
                    return c === isGroup ? x.id : x;
                  });
                  return a;
                })
                ?.get(collection);
            }
          }

          if (y === 'delete') {
            dbCache?.delete?.(isGroup ? x.id : x);
            await (isGroup
              ? x.ref.delete()
              : (db as firestore.CollectionReference<firestore.DocumentData>).doc(x).delete());
          } else {
            if (options.merge && options.setFromCache) y = { ...cSettings, ...(dbCache.get(isGroup ? x.id : x) || y) };
            y = removeEmpty(y);
            dbCache.set(isGroup ? x.id : x, y);
            await (isGroup
              ? x.ref.set(y, { merge: options.merge })
              : (db as firestore.CollectionReference<firestore.DocumentData>).doc(x).set(y, { merge: options.merge }));
          }
          return y;
        },
        dbCacheFiltered = dbCache.filter(o => testConditions(search, o));

      if (options.searchOnly !== 'database') {
        for (const [k, v] of dbCacheFiltered) {
          if (options.findAndSet) settings.set(k, [v, await fSet(k, options.findAndSet)]);
          else settings.set(k, v);
        }
      }

      if (!dbCacheFiltered.length && options.searchOnly !== 'cache') {
        for (const x of search) {
          x.forEach(y => (db = dbQ.where(y.field, y.operator, y.target)));

          for (const z of (await dbQ.get()).docs) {
            if (options.findAndSet) settings.set(z.id, [z.data(), await fSet(isGroup ? z : z.id, options.findAndSet)]);
            else settings.set(z.id, z.data());
          }
        }
      }

      return settings;
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Update the settings of a database's document
   * @deprecated A new function for this is coming soon
   * @returns The new collection's settings
   * @param collection The collection
   * @param settings The settings to define
   * @param options The function's options
   */
  dbSet = async (
    collection: string | Guild | User,
    settings: Record<string, any> = {},
    options: {
      /** Whether to merge the new settings with the old (or default, if setFromCache is enabled) ones (Default: True)*/
      merge?: boolean;
      /** Whether to define using the settings saved in the cache (Default: False)*/
      setFromCache?: boolean;
      /** Set further subcollection*/
      subCollections?: string[][];
    } = {},
  ) => {
    if (!collection) return;
    try {
      const lastSub = options.subCollections?.[options.subCollections.length - 1];
      let dbCache,
        dbColl,
        collectionId = (collection as Guild | User).id,
        isGroup = false;

      options.merge ??= true;

      if (collection instanceof Guild) {
        dbColl = 'guilds';
      } else if (collection instanceof User) {
        dbColl = 'users';
      } else {
        const splitColl = collection.split('/');
        collectionId = splitColl[1];
        dbColl = splitColl[0];
        isGroup = true;
      }

      let cacheStts = (dbCache = this.dbCache[dbColl])?.get((collection as Guild | User).id),
        db = (
          isGroup
            ? (await this.firestore.collectionGroup(dbColl).where('id', '==', collectionId).get()).docs[0]
            : this.firestore.collection(dbColl).doc(collectionId)
        ) as
          | firestore.QueryDocumentSnapshot<firestore.DocumentData>
          | firestore.DocumentReference<firestore.DocumentData>
          | firestore.CollectionReference<firestore.DocumentData>;

      options.subCollections?.forEach(e => {
        cacheStts = cacheStts?.get?.(e[0]);
        db = (db as firestore.DocumentReference<firestore.DocumentData>).collection(e[0]);
        if (e[1]) {
          db = db?.doc(e[1]);
          if (!lastSub[1]) cacheStts = cacheStts?.get?.(e[1]);
        }
      });
      console.log(1, cacheStts);

      if (cacheStts?.map) cacheStts = cacheStts.map(v => v);

      cacheStts ||= { ...defaultSettings[dbColl], ...(isGroup ? db : await db.get(null))?.data() };
      cacheStts = removeEmpty({ ...cacheStts, ...settings });

      if (options.merge && options.setFromCache) settings = cacheStts;
      else settings = removeEmpty(settings);

      if (options.subCollections) {
        if (!lastSub?.[1]) {
          const sttsColl = new Collection<string, Collection<string, any>>();
          let nestedStts = sttsColl;

          options.subCollections.forEach((e, i) => {
            nestedStts = (nestedStts.first() || nestedStts)
              .set(
                e[0],
                e[1]
                  ? new Collection().set(e[1], i === --options.subCollections.length ? cacheStts : new Collection())
                  : cacheStts,
              )
              .first();
          });
          dbCache.set(collectionId, sttsColl);
        }
      } else {
        dbCache.set(collectionId, cacheStts);
      }

      await (db as firestore.DocumentReference<firestore.DocumentData>).set(settings, { merge: options.merge });

      console.log(5, settings);
      return settings;
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Deletes the settings of a database's document
   * @deprecated A new function for this is coming soon
   * @returns {Object} The collection's settings saved on the cache
   * @param {string | Guild | User} collection The collection
   * @param {Object} options The function's options
   * @param {boolean} [options.deleteFromCache] Whether to also delete the settings saved on the cache
   * @param {Array.<string[]>} [options.subCollections] Delete further subcollection
   */
  dbDelete = async (
    collection: string | Guild | User,
    options: { deleteFromCache?: boolean; subCollections?: string[][] } = {},
  ) => {
    if (!collection) return;
    try {
      const settings = await this.dbGet(collection);

      let dbColl,
        collectionId = (collection as Guild | User).id,
        isGroup = false;

      options.deleteFromCache ??= false;

      if (collection instanceof Guild) {
        dbColl = 'guilds';
      } else if (collection instanceof User) {
        dbColl = 'users';
      } else {
        const splitColl = collection.split('/');
        collectionId = splitColl[1];
        dbColl = splitColl[0];
        isGroup = true;
      }

      const dbCache = this.dbCache[dbColl];

      let db = (
        isGroup
          ? (await this.firestore.collectionGroup(dbColl).where('id', '==', collectionId).get()).docs[0]
          : this.firestore.collection(dbColl).doc(collectionId)
      ) as
        | firestore.QueryDocumentSnapshot<firestore.DocumentData>
        | firestore.DocumentReference<firestore.DocumentData>
        | firestore.CollectionReference<firestore.DocumentData>;

      options.subCollections?.forEach(arr => {
        db = (db as firestore.DocumentReference<firestore.DocumentData>).collection(arr[0]);
        if (arr[1]) db = db.doc(arr[1]);
      });

      if (options.deleteFromCache) dbCache.delete(collectionId);
      await (db as firestore.DocumentReference<firestore.DocumentData>).delete();

      return settings;
    } catch (err) {
      console.error(err);
    }
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
