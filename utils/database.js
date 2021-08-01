const Discord = require('discord.js');
const Sequelize = require('sequelize');
const messages = require('../messages.json');

const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  // SQLite only
  storage: 'database.sqlite',
});

const GuildSettings = sequelize.define('guild_settings', {
  id: {
    type: Sequelize.STRING,
    defaultValue: 'global',
    primaryKey: true,
    unique: true,
  },
  language: { type: Sequelize.STRING, defaultValue: 'en-us' },
  //username: Sequelize.STRING,
  //usage_count: {
  //  type: Sequelize.INTEGER,
  //  defaultValue: 0,
  //  allowNull: false,
  //},
});

GuildSettings.sync();

/*
// Color command allowed channels
function getColorChannels(guild) {
  return index.getDB(guild, 'color-allowed-channels', 'none');
}
module.exports.getColorChannels = (guild) => getColorChannels(guild);

function setColorChannels(guild, channelID) {
  index.setDB(guild, 'color-allowed-channels', channelID);
}
module.exports.setColorChannels = (guild, channelID) =>
  setColorChannels(guild, channelID);
  */

// Guild language

async function setLanguage(guild, language) {
  guild = !guild ? 'global' : guild;
  try {
    // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
    const guildSettings = await GuildSettings.create({
      id: guild,
      language: language,
    });
    return console.log(
      `Language ${guildSettings.language} added to ${guildSettings}`
    );
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      const affectedRows = await GuildSettings.update(
        { language: language },
        { where: { id: guild } }
      );
      return console.log(
        `${affectedRows.id} language set to: ${affectedRows.language}.`
      );
    }
    return console.log('Something went wrong with setting a language.');
  }
}
module.exports.setLanguage = async (guild, language) =>
  await setLanguage(guild, language);

async function getLanguage(guild) {
  guild = !guild ? 'global' : guild;
  try {
    // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
    const guildSettings = await GuildSettings.create({
      id: guild,
    });
    return console.log(
      `Language ${guildSettings.language} added to ${guildSettings}`
    );
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      guildSettings = await GuildSettings.findOne({
        where: { id: guild },
      });

      return guildSettings.language;
    }
    return console.log('Something went wrong with getting a language.');
  }
}
module.exports.getLanguage = async (guild) => await getLanguage(guild);

module.exports.getString = async (guild, messageId, args) => {
  const language = await getLanguage(guild);

  const translations = messages[messageId];
  if (!translations) {
    console.error(`Unknown message for "${messageId}"`);
    return 'Unknown message. Please report this to **Smidul#9855**.';
  }

  var result = translations[language];

  args = !args ? [] : args;

  for (const key of Object.keys(args)) {
    const expression = new RegExp(`{${key}}`, 'g');
    result = result.replace(expression, args[key]);
  }
  return result;
};

module.exports.getEmbedString = async (guild, embedId, itemId, args) => {
  const language = await getLanguage(guild);

  const items = messages[embedId];
  if (!items) {
    console.error(
      `Could not find the correct item to send for "${embedId}" -> "${itemId}"`
    );
    return 'Could not find the correct message to send. Please report this to the bot developer.';
  }

  const translations = items[itemId];
  if (!translations) {
    console.error(
      `Could not find the correct message to send for "${embedId}"`
    );
    return 'Could not find the correct message to send. Please report this to the bot developer.';
  }

  let result = translations[language];

  args = !args ? [] : args;

  for (const key of Object.keys(args)) {
    const expression = new RegExp(`{${key}}`, 'g');
    result = result.replace(expression, args[key]);
  }

  return result;
};
