const { Client } = require('discord.js');
const path = require('path');
const fs = require('fs');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const token = process.env.token ?? require('./env.json').token;
require('colors');
require('log-timestamp');

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES'],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

const eventFiles = fs
  .readdirSync('./events')
  .filter((file) => file.endsWith('.js'));
const interactionFiles = fs
  .readdirSync('./interactions')
  .filter((file) => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);

  event.once
    ? client.once(event.name, (...args) => event.execute(client, ...args))
    : client.on(event.name, (...args) => event.execute(client, ...args));
}
for (const file of interactionFiles) {
  const itc = require(`./interactions/${file}`);
  client.ws.on(itc.name, (...args) => itc.execute(client, ...args));
}

client.on('ready', () => {
  client.user.setPresence({
    activities: [{ name: 'in development' }],
    status: 'dnd',
  });
  console.log('Bot iniciado.');
});

client.login(token).catch((err) => console.log(err));
