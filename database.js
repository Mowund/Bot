'use strict';

const admin = require('firebase-admin'),
  { botLanguage } = require('./defaults');

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE)),
});

const db = admin.firestore(),
  guilds = db.collection('guilds'),
  users = db.collection('users');

module.exports = {
  guilds: guilds,
  users: users,
};

/**
 * Update the settings of a guild
 * @returns {Object} The new guild settings
 * @param {Object} guild The guild's object
 * @param {Object} options The options to set
 * @param {string} options.language The guild's language
 * @param {boolean} options.logBadDomains Whether to log messages containing bad domains
 * @param {string} options.logChannel The id of the channel used to send log messages from the bot
 * @param {boolean} merge Whether to merge the new settings with the old ones (Default: True)
 */
const guildSet = (guild, options = {}, merge = true) =>
  guilds
    .doc(guild.id)
    .set(options, { merge: merge })
    .catch(err => console.error('Something went wrong when setting guild settings:', err));
module.exports.guildSet = guildSet;

/**
 * Gets the bot settings on a guild
 * @returns {Object} The guild's settings
 * @param {Object} guild The guild's object
 */
module.exports.guildGet = async guild => {
  const doc = await guilds
    .doc(guild.id)
    .get()
    .catch(err => console.error('Something went wrong when getting guild settings:', err));
  if (!doc.exists) {
    return guildSet(guild, {
      language: botLanguage.supported.includes(guild.preferredLocale) ? guild.preferredLocale : botLanguage.default,
    });
  }
  return doc.data();
};
