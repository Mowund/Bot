'use strict';

const fs = require('node:fs'),
  admin = require('firebase-admin'),
  i18n = require('i18n'),
  { Client, Collection, Intents, Constants, User, Guild } = require('discord.js'),
  { botLanguage, guildSettings, userSettings } = require('./defaults'),
  { getURL, removeEmpty } = require('./utils');
require('colors');

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE)),
});

const client = new Client({
    allowedMentions: { parse: [] },
    intents: [
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  }),
  firestore = admin.firestore(),
  dbGuilds = firestore.collection('guilds'),
  dbUsers = firestore.collection('users'),
  staticCatalog = {};

client.commands = new Collection();
client.dbCache = { guilds: new Collection(), users: new Collection() };
botLanguage.supported.forEach(l => (staticCatalog[l] = require(`mowund-i18n/locale/${l}/bot.json`)));

i18n.configure({
  locales: botLanguage.supported,
  defaultLocale: botLanguage.default,
  retryInDefaultLocale: true,
  staticCatalog,
  objectNotation: true,
});

process.on('uncaughtException', err => {
  if (err.code === Constants.APIErrors.UNKNOWN_INTERACTION) return null;
});

client.on('ready', async () => {
  client.user.setPresence({
    activities: [{ name: 'in development' }],
    status: 'online',
  });
  console.log('Bot started'.green);
  try {
    const interactionFiles = fs.readdirSync('./interactions').filter(file => file.endsWith('.js'));

    for (const file of interactionFiles) {
      const event = require(`./interactions/${file}`);
      client.commands.set(file.match(/.+?(?=\.js)/g)?.[0], event);
    }
    console.log('Successfully set application commands to collection'.green);
  } catch (err) {
    console.error('An error occured while setting application commands to collection:\n'.red, err);
  }
  client.badDomains = (await getURL('https://bad-domains.walshy.dev/domains.json'))?.data;
});

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  try {
    const event = require(`./events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, i18n, ...args));
    } else {
      client.on(event.name, (...args) => event.execute(client, i18n, ...args));
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Update the settings of a database's document
 * @returns {Object} The new collection's settings
 * @param {Guild | User} collection The guild or user collection
 * @param {guildSettings | userSettings} settings The settings to define
 * @param {Object} options The function's options
 * @param {boolean} [options.merge=true] Whether to merge the new settings with the old (or default, if setFromCache is enabled) ones (Default: True)
 * @param {boolean} [options.setFromCache=false] Whether to define using the settings saved in the cache (Default: False)
 */
client.dbSet = async (collection, settings = {}, options = {}) => {
  try {
    let db, dbCache, cSettings;
    options.merge ??= true;
    if (collection instanceof Guild) {
      db = dbGuilds;
      dbCache = client.dbCache.guilds;
      cSettings = guildSettings;
    } else if (collection instanceof User) {
      db = dbUsers;
      dbCache = client.dbCache.users;
      cSettings = userSettings;
    } else {
      throw new Error(collection ? 'Not an instance of guild or user collection' : 'No collection defined');
    }

    if (options.merge && options.setFromCache) {
      settings = { ...cSettings, ...(dbCache.get(collection.id) || settings) };
    }
    settings = removeEmpty(settings);

    dbCache.set(collection.id, settings);
    await db.doc(collection.id).set(settings, { merge: options.merge });
    return settings;
  } catch (err) {
    console.error(err);
  }
};

/**
 * Gets the settings of a database's document
 * @returns {Object} The collection's settings
 * @param {Guild | User} collection The guild or user collection
 * @param {"cache" | "database"} searchOnly Whether to search for data from only the cache or the database (Default: Both, first search on the cache then, if not found, on the database)
 */
client.dbGet = async (collection, searchOnly) => {
  try {
    let db, dbCache;
    if (collection instanceof Guild) {
      db = dbGuilds;
      dbCache = client.dbCache.guilds;
    } else if (collection instanceof User) {
      db = dbUsers;
      dbCache = client.dbCache.users;
    } else {
      throw new Error(collection ? 'Not an instance of guild or user collection' : 'No collection defined');
    }

    let stts = searchOnly !== 'database' ? dbCache.get(collection.id) : null;
    if (!stts && searchOnly !== 'cache') {
      const doc = await db.doc(collection.id).get();
      if (!doc.exists) {
        return client.dbSet(
          collection,
          collection instanceof Guild
            ? {
                language: botLanguage.supported.includes(collection.preferredLocale)
                  ? collection.preferredLocale
                  : botLanguage.default,
              }
            : {},
          { setFromClient: true },
        );
      }
      stts = doc.data();
      dbCache.set(collection.id, doc.data());
    }
    return stts;
  } catch (err) {
    console.error(err);
  }
};

/**
 * Deletes the settings of a database's document
 * @returns {Object} The collection's settings saved on the cache
 * @param {Guild | User} collection The guild or user collection
 * @param {boolean} deleteFromClient Whether to also delete the settings saved on the cache
 */
client.dbDelete = async (collection, deleteFromClient = false) => {
  try {
    const stts = client.dbGet(collection, false);
    let db;
    if (collection instanceof Guild) {
      db = dbGuilds;
      if (deleteFromClient) client.dbCache.guilds.delete(collection.id);
    } else if (collection instanceof User) {
      db = dbUsers;
      if (deleteFromClient) client.dbCache.users.delete(collection.id);
    } else {
      throw new Error(collection ? 'Not an instance of guild or user collection' : 'No collection defined');
    }

    await db.doc(collection.id).delete();
    return stts;
  } catch (err) {
    console.error(err);
  }
};

client.login(process.env.TOKEN);
