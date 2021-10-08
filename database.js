const admin = require('firebase-admin');
const messages = require('./messages.json');
const { defaultLanguage, supportedLanguages } = require('./botdefaults');

var env;
try {
  env = require('./env.json');
} catch {
  env = process.env;
}

const serviceAccount = env.FIREBASE;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const guilds = db.collection('guilds');
const users = db.collection('users');

module.exports = {
  guilds: guilds,
  users: users,
};

/**
 * Sets the bot language for a guild
 * @param {(object|string)} guild The guild's object or id. Defaults to global
 * @param {string} language The language to set. Defaults to en-US
 */
async function setLanguage(guild, language) {
  guild = guild?.id ?? guild ?? 'global';
  language = supportedLanguages.includes(language) ? language : defaultLanguage;
  return await guilds
    .doc(guild)
    .set(
      {
        language: language,
      },
      { merge: true }
    )
    .catch((e) =>
      console.error('Something went wrong when setting a language:', e)
    );
}
module.exports.setLanguage = setLanguage;

/**
 * Gets the bot language on a guild
 * @param {(object|string)} guild The guild's object or id. Defaults to global
 * @return {string} The language of the bot on the server
 */
async function getLanguage(guild) {
  guild = guild?.id ?? guild ?? 'global';
  var doc = await guilds.doc(guild).get();
  if (!doc.exists) {
    doc = await guilds
      .doc(guild)
      .set(
        {
          language: defaultLanguage,
        },
        { merge: true }
      )
      .catch((e) =>
        console.error('Something went wrong when getting a language:', e)
      );
    return doc.language;
  }
  return doc.data().language;
}
module.exports.getLanguage = getLanguage;

/**
 * Gets the translated string
 * @param {string} language The language to translate to
 * @param {(string|string[])} message The message that will get translated
 * @param {object} [options] Defines the options
 * @param {object} [options.stringKeys] Defines the values for the keys on the string
 * @param {boolean} [options.returnLanguage] Returns the defined language instead
 * @return {string} The translated string
 */
module.exports.getString = (language, message, options = {}) => {
  if (options['returnLanguage'] === true) return language;

  let translate = messages;

  while (message.constructor === Array && message.length) {
    const shifted = message.shift();
    translate = translate[shifted];
  }

  if (!translate) throw new Error('Could not find the correct message');

  let result = translate[language] ?? translate[defaultLanguage];

  if ('stringKeys' in options) {
    for (const k in options['stringKeys']) {
      const exp = new RegExp(`{${k}}`, 'g');
      result = result.replace(exp, options['stringKeys'][k]);
    }
  }

  return result;
};
