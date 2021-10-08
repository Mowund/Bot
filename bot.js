const { Client, Collection, Intents } = require('discord.js');
const client = new Client({
  allowedMentions: { parse: [] },
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});
client.commands = new Collection();
const fs = require('node:fs');
require('colors');

var env;
try {
  env = require('./env.json');
} catch {
  env = process.env;
}

client.on('ready', async () => {
  client.user.setPresence({
    activities: [{ name: 'in development' }],
    status: 'dnd',
  });
  console.log('Bot started.'.green);

  try {
    const interactionFiles = fs
      .readdirSync('./interactions')
      .filter((file) => file.endsWith('.js'));

    for (const file of interactionFiles) {
      const event = require('./interactions/' + file);
      client.commands.set(file.match(/.+?(?=\.js)/g).toString(), event);
    }
    console.log('Successfully set application commands to collection.'.green);
  } catch (err) {
    console.error(
      'An error occured while setting application commands to collection:\n'
        .red,
      err
    );
  }
});

// Events
const eventFiles = fs
  .readdirSync('./events')
  .filter((file) => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);

  event.once
    ? client.once(event.name, (...args) => event.execute(client, ...args))
    : client.on(event.name, (...args) => event.execute(client, ...args));
}
const oldInteractionFiles = fs
  .readdirSync('./interactions_old')
  .filter((file) => file.endsWith('.js'));
for (const file of oldInteractionFiles) {
  const itc = require(`./interactions_old/${file}`);
  client.ws.on(itc.name, (...args) => itc.execute(client, ...args));
}

client.login(env.TOKEN);
