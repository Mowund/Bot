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
      GatewayIntentBits.GuildEmojisAndStickers,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  }),
  firestore = firebase.firestore(),
  { Timestamp } = firebase.firestore,
  dbGuilds = firestore.collection('guilds'),
  dbUsers = firestore.collection('users');

client.commands = new Collection();
client.dbCache = { guilds: new Collection(), reminders: new Collection(), users: new Collection() };

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

  /* setInterval(
    async () =>
      console.log(
        await client.dbFind('/reminders', [[{ field: 'time', operator: '<=', target: Timestamp.now() }]], {
          findAndSet: {},
        }),
      ),
    10000,
  );*/

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

  client.badDomains = (await getURL('https://bad-domains.walshy.dev/domains.json'))?.data;
});

(async function () {
  try {
    const eventFiles = readdirSync('./events').filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
      const event = await import(`./events/${file}`);
      if (event.once)
        client.once(event.eventName, (...args) => event.execute({ chalk, client, firebase, i18n }, ...args));
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
 * @param {Guild | User} collection The guild or user collection
 * @param {Object} options The function's options
 * @param {'both' | 'cache' | 'database'} options.searchOnly Whether to search for data from only the cache or the database (Default: Both, first search on the cache then, if not found, on the database)
 */
client.dbGet = async (collection, options = { searchOnly: 'both' }) => {
  if (!collection) return;
  try {
    let db, dbCache;
    if (collection instanceof Guild) {
      db = dbGuilds;
      dbCache = client.dbCache.guilds;
    } else if (collection instanceof User) {
      db = dbUsers;
      dbCache = client.dbCache.users;
    } else {
      throw new TypeError('Not an instance of guild or user collection');
    }

    let stts = options.searchOnly !== 'database' ? dbCache.get(collection.id) : null;
    if (!stts && options.searchOnly !== 'cache') {
      const doc = await db.doc(collection.id).get();
      if (!doc.exists) return client.dbSet(collection, {}, { setFromCache: true });
      stts = doc.data();
      dbCache.set(collection.id, doc.data());
    }
    return stts;
  } catch (err) {
    console.error(err);
  }
};

/**
 * Gets the settings of a database's document
 * @returns {Object} The collection's settings
 * @param {string} collection Which collection to search through
 * @param {Object[]} search Search for documents matching conditions
 * @param {string} search.field The condition's left operand
 * @param {string} search.operator The condition's operator
 * @param {string} search.target The condition's right operand
 * @param {Object} options The function's options
 * @param {'delete' | defaultSettings} options.findAndSet Define new settings after the document is found. Changes 'searchOnly' option to 'both', searching for and setting data from the cache first, then, if not found, from the database
 * @param {boolean} [options.merge=true] Whether to merge the new settings with the old (or default, if setFromCache is enabled) ones (Default: True)
 * @param {'both' | 'cache' | 'database'} options.searchOnly Whether to search for data from only the cache or the database (Default: Database)
 * @param {boolean} [options.setFromCache=false] Whether to define using the settings saved in the cache (Default: False)
 */
client.dbFind = async (collection, search, options = {}) => {
  if (!collection) return;

  try {
    const isSub = collection.startsWith('/');
    let db, dbQ;
    options.merge ??= true;
    options.searchOnly ??= options.findAndSet ? 'both' : 'database';

    if (isSub) collection = collection.split('/')[1];
    dbQ = db = isSub ? firestore.collectionGroup(collection) : firestore.collection(collection);

    const dbCache = client.dbCache[collection],
      cSettings = defaultSettings[collection],
      stts = new Collection(),
      fSet = async (x, y) => {
        if (y === 'delete') {
          // TODO
        } else {
          if (options.merge && options.setFromCache) y = { ...cSettings, ...(dbCache.get(x) || y) };
          y = removeEmpty(y);
          console.log(x, y);
          dbCache.set(x, y);
          await db.doc(x).set(y, { merge: options.merge });
        }
        return y;
      };

    if (options.searchOnly !== 'database') {
      console.log(collection, dbCache);
      for (const [k, v] of dbCache.filter(o => testConditions(search, o))) {
        if (options.findAndSet) stts.set(k, [v, await fSet(k, options.findAndSet)]);
        else stts.set(k, v);
      }
    }

    if (options.searchOnly !== 'cache') {
      for (const x of search) {
        if (Array.isArray(x)) x.forEach(y => (dbQ = dbQ.where(y.field, y.operator, y.target)));
        else dbQ = dbQ.where(x.field, x.operator, x.target);

        for (const z of (await dbQ.get()).docs) {
          if (options.findAndSet) stts.set(z.id, [z.data(), await fSet(z.id, options.findAndSet)]);
          else stts.set(z.id, z.data());
        }
      }
    }

    return stts;
  } catch (err) {
    console.error(err);
  }
};

/**
 * Update the settings of a database's document
 * @returns {Object} The new collection's settings
 * @param {Guild | User} collection The guild or user collection
 * @param {settings} settings The settings to define
 * @param {Object} options The function's options
 * @param {boolean} [options.merge=true] Whether to merge the new settings with the old (or default, if setFromCache is enabled) ones (Default: True)
 * @param {boolean} [options.setFromCache=false] Whether to define using the settings saved in the cache (Default: False)
 */
client.dbSet = async (collection, settings = {}, options = {}) => {
  if (!collection) return;
  try {
    let db, dbCache, cSettings;
    options.merge ??= true;

    if (collection instanceof Guild) {
      db = dbGuilds;
      dbCache = client.dbCache.guilds;
      cSettings = defaultSettings.guilds;
    } else if (collection instanceof User) {
      db = dbUsers;
      dbCache = client.dbCache.users;
      cSettings = defaultSettings.users;
    } else {
      throw new TypeError('Not an instance of guild or user collection');
    }

    if (options.merge && options.setFromCache) settings = { ...cSettings, ...(dbCache.get(collection.id) || settings) };
    settings = removeEmpty(settings);

    dbCache.set(collection.id, settings);
    await db.doc(collection.id).set(settings, { merge: options.merge });
    return settings;
  } catch (err) {
    console.error(err);
  }
};

/**
 * Deletes the settings of a database's document
 * @returns {Object} The collection's settings saved on the cache
 * @param {Guild | User} collection The guild or user collection
 * @param {boolean} deleteFromCache Whether to also delete the settings saved on the cache
 */
client.dbDelete = async (collection, deleteFromCache = false) => {
  if (!collection) return;
  try {
    const stts = client.dbGet(collection, false);
    let db;
    if (collection instanceof Guild) {
      db = dbGuilds;
      if (deleteFromCache) client.dbCache.guilds.delete(collection.id);
    } else if (collection instanceof User) {
      db = dbUsers;
      if (deleteFromCache) client.dbCache.users.delete(collection.id);
    } else {
      throw new TypeError('Not an instance of guild or user collection');
    }

    await db.doc(collection.id).delete();
    return stts;
  } catch (err) {
    console.error(err);
  }
};

client.login(process.env.TOKEN);
