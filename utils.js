'use strict';

const urlR = require('url'),
  { MessageEmbed, Util } = require('discord.js'),
  tc = require('tinycolor2');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const db = require('./database.js'),
  { emojis } = require('./defaults.js');

const xhr = new XMLHttpRequest();

/**
 * @returns {string} The mapped collections
 * @param {Collection} collections The collections to map
 * @param {number} [maxValues=40] The maximum amount of mapped collections to return. Defaults to 40
 */
module.exports.collMap = (collections, maxValues = 40) => {
  const cM = Util.discordSort(collections)
    .map(c => `${c}`)
    .reverse();
  let tCM = cM;
  if (tCM.length > maxValues) (tCM = tCM.slice(0, maxValues)).push(`\`+${cM.length - tCM.length}\``);

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
  const getTS = (message, options) => db.getString(interaction.guild, message, options);

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
    .setImage(`https://dummyimage.com/300x100/${diB}/${diL}&${diEV[0]}&text=+${urlR.parse(diT).path}`)
    .setFooter(footer, eU.avatarURL())
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

module.exports.toUTS = (time = Date.now(), style = 'R') =>
  `<t:${new Date(time).getTime().toString().slice(0, -3)}:${style}>`;

module.exports.checkImage = url =>
  new Promise(resolve => {
    xhr.open('GET', url, true);
    xhr.send();
    xhr.onload = function onload() {
      if (xhr.status === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
  });
