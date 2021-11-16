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
 * Sets the bot language for a guild
 * @returns {string} The language set
 * @param {Object} guild The guild's object
 * @param {string} language The language to set. Defaults to en-US
 */
module.exports.setLanguage = (guild, language) => {
  if (!guild) return botLanguage.default;
  return guilds
    .doc(guild.id)
    .set(
      {
        language: botLanguage.supported.includes(language) ? language : botLanguage.default,
      },
      { merge: true },
    )
    .catch(err => console.error('Something went wrong when setting a language:', err));
};

/**
 * Gets the bot language on a guild
 * @returns {string} The language of the bot on the server. Defaults to en-US
 * @param {Object} guild The guild's object
 */
module.exports.getLanguage = async guild => {
  if (!guild) return botLanguage.default;
  let doc = await guilds.doc(guild.id).get();
  if (!doc.exists) {
    doc = await guilds
      .doc(guild.id)
      .set(
        {
          language: botLanguage.supported.includes(guild.preferredLocale) ? guild.preferredLocale : botLanguage.default,
        },
        { merge: true },
      )
      .catch(err => console.error('Something went wrong when getting a language:', err));
    return doc.language;
  }
  return doc.data().language;
};
