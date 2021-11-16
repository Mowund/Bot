'use strict';

const { Client, Collection, Intents, Constants } = require('discord.js');
const client = new Client({
  allowedMentions: { parse: [] },
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});
client.commands = new Collection();
const i18n = require('i18n'),
  // eslint-disable-next-line import/order
  fs = require('node:fs'),
  { botLanguage } = require('./defaults');
require('colors');

const staticCatalog = {};
botLanguage.supported.forEach(l => (staticCatalog[l] = require(`mowund-i18n/locale/${l}/bot.json`)));
i18n.configure({
  locales: botLanguage.supported,
  defaultLocale: botLanguage.default,
  staticCatalog,
  objectNotation: true,
});

process.on('uncaughtException', err => {
  if (err.code !== Constants.APIErrors.UNKNOWN_INTERACTION) console.error(err);
});
client.on('ready', () => {
  client.user.setPresence({
    activities: [{ name: 'in development' }],
    status: 'dnd',
  });
  console.log('Bot started.'.green);

  try {
    const interactionFiles = fs.readdirSync('./interactions').filter(file => file.endsWith('.js'));

    for (const file of interactionFiles) {
      const event = require(`./interactions/${file}`);
      client.commands.set(file.match(/.+?(?=\.js)/g)?.[0], event);
    }
    console.log('Successfully set application commands to collection.'.green);
  } catch (err) {
    console.error('An error occured while setting application commands to collection:\n'.red, err);
  }
});

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(client, i18n, ...args));
  } else {
    client.on(event.name, (...args) => event.execute(client, i18n, ...args));
  }
}

client.login(process.env.TOKEN);
