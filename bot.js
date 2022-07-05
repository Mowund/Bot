import process from 'node:process';
import { setInterval } from 'node:timers';
import { readdirSync } from 'node:fs';
import firebase from 'firebase-admin';
import i18n from 'i18n';
import { Client, Collection, User, Guild, RESTJSONErrorCodes, GatewayIntentBits, Partials } from 'discord.js';
import { getBotStaticCatalog } from 'mowund-i18n';
import { Chalk } from 'chalk';
import { debugMode, defaultLocale, defaultSettings, supportServer } from './defaults.js';
import { getURL, removeEmpty, testConditions } from './utils.js';
import 'log-timestamp';

firebase.initializeApp({
  credential: firebase.credential.cert(JSON.parse(process.env.FIREBASE)),
});
const chalk = new Chalk({ level: 3 }),
  client = new Client({
    allowedMentions: { parse: [] },
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildEmojisAndStickers,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  }),
  firestore = firebase.firestore();

client.commands = new Collection();
client.dbCache = { guilds: new Collection(), users: new Collection() };

i18n.configure({
  defaultLocale: defaultLocale,
  locales: getBotStaticCatalog(true),
  objectNotation: true,
  retryInDefaultLocale: true,
  staticCatalog: getBotStaticCatalog(),
});

process.on('uncaughtException', err => {
  if (err.code !== RESTJSONErrorCodes.UnknownInteraction) {
    console.error(err);
    process.exit();
  }
});

if (debugMode > 1) client.on('debug', console.log).on('warn', console.warn).rest.on('rateLimited', console.error);

client.on('ready', async () => {
  client.user.setPresence({
    activities: [{ name: 'in development' }],
    status: 'online',
  });

  client.splitedCmds = client.splitCmds(await client.application.commands.fetch());
  await client.updateMowundDescription();

  console.log(chalk.green('Bot started'));

  client.badDomains = await getURL('https://bad-domains.walshy.dev/domains.json');

  const updateWebData = async () => {
    client.rollouts = { data: await getURL('https://rollouts.advaith.workers.dev'), lastUpdated: Date.now() };
    if (debugMode > 1) console.log(chalk.green('Updated web data'));
  };
  await updateWebData();
  setInterval(() => updateWebData(), 300000);

  setInterval(async () => {
    const reminders = await client.dbFind(
      '/reminders',
      [[{ field: 'timestamp', operator: '<=', target: Date.now() }]],
      {
        cacheReference: { collection: 'users', options: ['id'] },
        findAndSet: 'delete',
      },
    );
    reminders.forEach(reminder => client.emit('reminderFound', reminder[0]));
  }, 5000);

  try {
    const interactionFiles = readdirSync('./interactions').filter(file => file.endsWith('.js'));
    for (const file of interactionFiles) {
      const event = await import(`./interactions/${file}`);
      client.commands.set(file.match(/.+?(?=\.js)/g)?.[0], event);
    }
    console.log(chalk.green('Successfully set application commands to collection'));
  } catch (err) {
    console.error(chalk.red('An error occured while setting application commands to collection:\n'), err);
  }
});

(async function () {
  try {
    const eventFiles = readdirSync('./events').filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
      const event = await import(`./events/${file}`);
      if (event.once) client.once(event.eventName, (...args) => event.execute({ chalk, client, i18n }, ...args));
      else client.on(event.eventName, (...args) => event.execute({ chalk, client, firebase, i18n }, ...args));
    }
  } catch (err) {
    console.error(err);
  }
})();

client.updateMowundDescription = () =>
  client.shard.broadcastEval(
    async (c, { serverId }) =>
      c.guilds.cache.get(serverId)?.edit({
        description: `Mowund is a multi-purpose bot with ${c.splitedCmds.size} commands in ${(
          await c.shard.fetchClientValues('guilds.cache.size')
        ).reduce((acc, a) => acc + a, 0)} servers.`,
      }),
    { context: { serverId: supportServer.id } },
  );

client.splitCmds = collection => {
  for (const cmd of collection) {
    let i = 0;
    for (let opt of cmd[1].options) {
      if (opt.type === 1) {
        collection.delete(cmd[0]);
        collection.set(`${cmd[0]} ${i++}`, opt);
      } else if (opt.type === 2) {
        for (opt of opt.options) {
          if (opt.type === 1) {
            collection.delete(cmd[0]);
            collection.set(`${cmd[0]} ${i++}`, opt);
          }
        }
      }
    }
  }
  return collection;
};

/**
 * Gets the settings of a database's document
 * @returns {Object} The collection's settings
 * @param {string | Guild | User} collection The collection
 * @param {Object} options The function's options
 * @param {'both' | 'cache' | 'database'} [options.searchOnly] Whether to search for data from only the cache or the database (Default: Both, first search on the cache then, if not found, on the database)
 * @param {Array.<string[]>} [options.subCollections] Get further subcollection
 */
client.dbGet = async (collection, options = { searchOnly: 'both' }) => {
  if (!collection) return;
  try {
    const lastSub = options.subCollections?.[options.subCollections.length - 1];
    let dbCache,
      dbColl,
      collectionId = collection.id,
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

    let cacheStts = (dbCache = client.dbCache[dbColl])?.get(collection.id),
      db = isGroup
        ? (await firestore.collectionGroup(dbColl).where('id', '==', collectionId).get()).docs[0]
        : firestore.collection(dbColl).doc(collectionId);

    options.subCollections?.forEach(e => {
      cacheStts = cacheStts?.get?.(e[0]);
      db = db.collection(e[0]);
      if (e[1]) {
        db = db?.doc(e[1]);
        if (!lastSub[1]) cacheStts = cacheStts?.get?.(e[1]);
      }
    });

    if (cacheStts?.map) cacheStts = cacheStts.map(v => v);

    let settings = options.searchOnly !== 'database' && cacheStts;

    if (!settings && options.searchOnly !== 'cache') {
      let doc = isGroup ? db : await db.get();

      if (lastSub && !lastSub?.[1]) doc = doc.docs;
      if (!lastSub && (!doc.exists || (isGroup && !db.exists))) {
        if (options.subCollections) options.subCollections[options.subCollections.length - 1][1] = collectionId;
        return client.dbSet(
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
        const sttsColl = new Collection();
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
 * @returns {Object} The collection's settings
 * @param {string} collection Which collection to search through.
 * @param {Object[]} search Search for documents matching conditions
 * @param {string} search.field The condition's left operand
 * @param {string} search.operator The condition's operator
 * @param {string} search.target The condition's right operand
 * @param {Object} options The function's options
 * @param {Object} [options.cacheReference] Define where to search for the cache
 * @param {string} options.cacheReference.collection The main collection for the cache
 * @param {string[]} options.cacheReference.options The options to destructure
 * @param {'delete' | defaultSettings} [options.findAndSet] Define new settings after the document is found. Changes 'searchOnly' option to 'both', searching for and setting data from the cache first, then, if not found, from the database
 * @param {boolean} [options.merge=true] Whether to merge the new settings with the old (or default, if setFromCache is enabled) ones (Default: True)
 * @param {'both' | 'cache' | 'database'} [options.searchOnly] Whether to search for data from only the cache or the database (Default: Database)
 * @param {boolean} [options.setFromCache=false] Whether to define using the settings saved in the cache (Default: False)
 */
client.dbFind = async (collection, search, options = {}) => {
  if (!collection) return;

  try {
    const isGroup = collection.startsWith('/');
    let db, dbQ;
    options.merge ??= true;
    options.searchOnly ??= options.findAndSet ? 'both' : 'database';

    if (isGroup) {
      collection = collection.split('/')[1];
      dbQ = db = firestore.collectionGroup(collection);
    } else {
      dbQ = db = firestore.collection(collection);
    }

    let dbCache = client.dbCache[options.cacheReference?.collection ?? collection];

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
          await (isGroup ? x.ref.delete() : db.doc(x).delete());
        } else {
          if (options.merge && options.setFromCache) y = { ...cSettings, ...(dbCache.get(isGroup ? x.id : x) || y) };
          y = removeEmpty(y);
          dbCache.set(isGroup ? x.id : x, y);
          await (isGroup ? x.ref.set(y, { merge: options.merge }) : db.doc(x).set(y, { merge: options.merge }));
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
        if (Array.isArray(x)) x.forEach(y => (dbQ = dbQ.where(y.field, y.operator, y.target)));
        else dbQ = dbQ.where(x.field, x.operator, x.target);

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
 * @returns {Object} The new collection's settings
 * @param {string | Guild | User} collection The collection
 * @param {settings} settings The settings to define
 * @param {Object} options The function's options
 * @param {boolean} [options.merge=true] Whether to merge the new settings with the old (or default, if setFromCache is enabled) ones (Default: True)
 * @param {boolean} [options.setFromCache=false] Whether to define using the settings saved in the cache (Default: False)
 * @param {Array.<string[]>} [options.subCollections] Set further subcollection
 */
client.dbSet = async (collection, settings = {}, options = {}) => {
  if (!collection) return;
  try {
    const lastSub = options.subCollections?.[options.subCollections.length - 1];
    let dbCache,
      dbColl,
      collectionId = collection.id,
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

    let cacheStts = (dbCache = client.dbCache[dbColl])?.get(collection.id),
      db = isGroup
        ? (await firestore.collectionGroup(dbColl).where('id', '==', collectionId).get()).docs[0]
        : firestore.collection(dbColl).doc(collectionId);

    options.subCollections?.forEach(e => {
      cacheStts = cacheStts?.get?.(e[0]);
      db = db.collection(e[0]);
      if (e[1]) {
        db = db?.doc(e[1]);
        if (!lastSub[1]) cacheStts = cacheStts?.get?.(e[1]);
      }
    });
    console.log(1, cacheStts);

    if (cacheStts?.map) cacheStts = cacheStts.map(v => v);
    // kkkkk boa sorte
    // issai é pra
    // sla como explicar

    console.log(2, cacheStts);
    cacheStts ||= { ...defaultSettings[dbColl], ...(isGroup ? db : await db.get())?.data() };
    console.log(3, cacheStts);
    // QUE
    cacheStts = removeEmpty({ ...cacheStts, ...settings });
    // a
    console.log(4, cacheStts);

    if (options.merge && options.setFromCache) settings = cacheStts;
    else settings = removeEmpty(settings);

    if (options.subCollections) {
      if (!lastSub?.[1]) {
        const sttsColl = new Collection();
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

    await db.set(settings, { merge: options.merge });

    console.log(5, settings);
    return settings;
  } catch (err) {
    console.error(err);
  }
};

/**
 * Deletes the settings of a database's document
 * @returns {Object} The collection's settings saved on the cache
 * @param {string | Guild | User} collection The collection
 * @param {Object} options The function's options
 * @param {boolean} [options.deleteFromCache] Whether to also delete the settings saved on the cache
 * @param {Array.<string[]>} [options.subCollections] Delete further subcollection
 */
client.dbDelete = async (collection, options = {}) => {
  if (!collection) return;
  try {
    const settings = await client.dbGet(collection, false);

    let dbColl,
      collectionId = collection.id,
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

    const dbCache = client.dbCache[dbColl];

    let db = isGroup
      ? (await firestore.collectionGroup(dbColl).where('id', '==', collectionId).get()).docs[0]
      : firestore.collection(dbColl).doc(collectionId);

    options.subCollections?.forEach(arr => {
      db = db.collection(arr[0]);
      if (arr[1]) db = db.doc(arr[1]);
    });

    if (options.deleteFromCache) dbCache.delete(collectionId);
    await db.delete();

    return settings;
  } catch (err) {
    console.error(err);
  }
};

client.login(process.env.TOKEN);
