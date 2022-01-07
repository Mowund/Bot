'use strict';

const URL = require('url'),
  axios = require('axios'),
  { MessageEmbed, Util } = require('discord.js'),
  tc = require('tinycolor2'),
  { emojis } = require('./defaults.js');

/**
 * @returns {Object} Remove keys with empty values from an object
 * @param {Object} obj The object to filter the values
 * @param {Object} options The function's options
 * @param {boolean} [options.recursion=true] Whether to also recursively filter nested objects (Default: True)
 */
const removeEmpty = (obj, options = {}) =>
  Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => v != null)
      .map(([k, v]) => [k, v === ((options.recursion ?? true) && Object(v)) ? removeEmpty(v) : v]),
  );
module.exports = { removeEmpty };

module.exports.toUTS = (time = Date.now(), style = 'R') =>
  `<t:${new Date(time).getTime().toString().slice(0, -3)}:${style}>`;

module.exports.getURL = (url, required = false) => axios.get(url).catch(err => (required ? console.error(err) : null));

module.exports.checkURL = url =>
  axios
    .get(url)
    .then(r => r.status === 200)
    .catch(() => false);

/**
 * Search for an embed field with its name and return its value
 * @returns {string} The value of the field
 * @param {Object} embed The embed that will be used to search for its fields
 * @param {string} fieldName The name of the field that will be searched for
 */
module.exports.getFieldValue = (embed, fieldName) =>
  embed?.fields?.find(({ name }) => name === fieldName || name.includes(fieldName))?.value ?? null;

/**
 * Search for a parameter and get the first value associated to it
 * @returns {string} The first value associated to the parameter
 * @param {Object} embed The object of the embed the parameter will be searched for
 * @param {string} param The parameter that will be used to search for its value
 */
module.exports.getParam = (embed, param) => new URLSearchParams(embed?.footer?.iconURL).get(param);

/**
 * Differences in months two dates
 * @returns {number} How much months between the two dates
 * @param {Date} dateFrom The first date
 * @param {Date} dateTo The second date (Default: Current date)
 */
module.exports.monthDiff = (dateFrom, dateTo = new Date()) =>
  dateTo.getMonth() - dateFrom.getMonth() + 12 * (dateTo.getFullYear() - dateFrom.getFullYear());

/**
 * Truncates a string with ellipsis
 * @returns {string} The string truncated with ellipsis
 * @param {string} input The string to truncate
 * @param {number} limit The limit of characters to be displayed until truncated (Default: 1020)
 */
module.exports.truncate = (input, limit = 1020) => (input.length > limit ? `${input.substring(0, limit)}...` : input);

/**
 * @returns {string} The mapped collections
 * @param {Collection} collections The collections to map
 * @param {Object} options The function's options
 * @param {string} [options.mapValue] Map something else instead of the mention
 * @param {number} [options.maxValues=40] The maximum amount of mapped collections to return (Default: 40)
 */
module.exports.collMap = (collections, options = { maxValues: 40 }) => {
  const cM = Util.discordSort(collections)
    .map(c => (options.mapValue ? `\`${c[options.mapValue]}\`` : `${c}`))
    .reverse();
  let tCM = cM;
  if (tCM.length > options.maxValues) (tCM = tCM.slice(0, options.maxValues)).push(`\`+${cM.length - tCM.length}\``);

  return tCM.join(', ');
};

/**
 * @returns {string} Simplify a string by normalizing and lowercasing it
 * @param {string} string The string to simplify
 */
module.exports.smp = string =>
  string
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/**
 * @returns {string} The bot invite
 * @param {number} id The bot id
 */
module.exports.botInvite = id =>
  `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=536870911991&scope=bot%20applications.commands`;

/**
 * Converts a flag to an emoji
 * @returns {string} The emoji
 * @param {string} flag The user flag
 */
module.exports.flagToEmoji = flag => {
  switch (flag) {
    case 'DISCORD_EMPLOYEE':
      return emojis.discordEmployee;
    case 'PARTNERED_SERVER_OWNER':
      return emojis.partneredServerOwner;
    case 'HYPESQUAD_EVENTS':
      return emojis.hypeSquadEvents;
    case 'HOUSE_BALANCE':
      return emojis.balance;
    case 'HOUSE_BRAVERY':
      return emojis.bravery;
    case 'HOUSE_BRILLIANCE':
      return emojis.brilliance;
    case 'BUGHUNTER_LEVEL_1':
      return emojis.bugHunterLvl1;
    case 'BUGHUNTER_LEVEL_2':
      return emojis.bugHunterLvl2;
    case 'EARLY_SUPPORTER':
      return emojis.earlySupporter;
    case 'EARLY_VERIFIED_BOT_DEVELOPER':
      return emojis.earlyVerifiedBotDeveloper;
    case 'TEAM_USER':
      return emojis.teamUser;
    case 'DISCORD_CERTIFIED_MODERATOR':
      return emojis.certifiedMod;
    case 'BOT_HTTP_INTERACTIONS':
      return emojis.httpInteractions;
  }
};

module.exports.msToTime = ms => {
  const days = Math.floor(ms / 86400000),
    hours = Math.floor((ms % 86400000) / 3600000),
    minutes = Math.floor((ms % 3600000) / 60000),
    sec = Math.floor((ms % 60000) / 1000);

  let str = '';
  if (days) str += `${days}d `;
  if (hours) str += `${hours}h `;
  if (minutes) str += `${minutes}m `;
  if (sec) str += `${sec}s`;

  return str ?? '`0s`';
};

module.exports.search = (object, key) => {
  let value;
  for (key in object) {
    value = object[key];
  }

  return value;
};

module.exports.searchKey = (object, value) => Object.keys(object).find(key => object[key] === value);

module.exports.msgEdit = async (chan, id, medit) => {
  try {
    const message = await chan.messages.fetch(id);
    await message.edit(medit);
  } catch (err) {
    console.error(err);
  }
};

// Remove when color command is done
module.exports.diEmb = (
  client,
  eMsg,
  interaction,
  msg,
  eU,
  diEV,
  eC,
  title,
  footer,
  description,
  diT,
  diB = '000000',
  diL = 'ffffff',
) => {
  const getTS = () => null;

  let ciCE = '000000';

  if (eC && eC !== 0) {
    if (!diB || diB === 1) {
      diB = eC.replace('000000', '000001');
    }

    ciCE = diB.replace('ffffff', 'fffffe');

    if (!diL || diL === 1) {
      diL = '000000';
      if (tc(eC).isDark()) {
        diL = 'ffffff';
      }
    }
    if (!diT || diT === 1) {
      diT = eC;
    }
  }
  diT ||= getTS(['COLOR', 'INVALID_IMG']);

  if (!diEV || diEV === 1) {
    if (eMsg === 2) {
      msg = msg.message;
    }
    const embIURL = new URL(msg.embeds[0].image.url).pathname.split(/[/&]/);
    diEV = [embIURL[4]];
  }

  title ??= getTS(['COLOR', 'INVALID']);

  footer = getTS(['GENERIC', footer ? 'INTERACTED_BY' : 'REQUESTED_BY'], {
    USER: eU.username,
  });

  let emb = new MessageEmbed()
    .setColor(ciCE)
    .setTitle(title)
    .setImage(`https://dummyimage.com/300x100/${diB}/${diL}&${diEV[0]}&text=+${URL.parse(diT).path}`)
    .setFooter({ name: footer, iconURL: eU.avatarURL() })
    .setTimestamp(Date.now());

  if (description && description !== 0) {
    emb = emb().setDescription(description);
  }

  if (!eMsg || eMsg === 2) {
    return emb;
  }
  if (eMsg === 1) {
    return msg.channel.send(emb);
  }
  return eMsg.edit(emb);
};
