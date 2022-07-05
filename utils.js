import { URL, parse } from 'node:url';
import { ButtonStyle, EmbedBuilder, discordSort } from 'discord.js';
import tc from 'tinycolor2';
import { emojis } from './defaults.js';

export const isValidImage = contentType => ['image/jpeg', 'image/png', 'image/gif'].includes(contentType);

/**
 * @returns {Object[]} Array of action rows with their components disabled (Note: Already updates the array defined)
 * @param {Object[]} rows Array of action rows that will get their components disabled
 * @param {Object} options The function's options
 * @param {object[]} [options.defaultValues] Array of objects with component custom ids with a respective default value
 * @param {string[]} [options.disableLinkButtons=false] Whether to disable link buttons (Default: False)
 * @param {string[]} [options.disabledComponents] Array of component custom ids that will get disabled
 * @param {string[]} [options.enabledComponents] Array of component custom ids that will get enabled (Is prioritized | Default: None of components)
 * @param {string} [options.defaultValues.customId] The component's custom id
 * @param {string} [options.defaultValues.value] The component's default value
 */
export const disableComponents = (rows, options = {}) => {
  rows?.forEach((row, rI) => {
    row.components?.forEach((c, cI) => {
      if (!options.disableLinkButtons && c.style !== ButtonStyle.Link) {
        rows[rI].components[cI].data.disabled =
          !options.enabledComponents?.includes(c.customId) &&
          ((options.disabledComponents?.length && options.disabledComponents.includes(c.customId)) || true);

        options.defaultValues?.forEach(
          v =>
            c.customId === v.customId &&
            c.options.forEach(
              (o, oI) => o.value === v.value && (rows[rI].components[cI].data.options[oI].default = true),
            ),
        );
      }
    });
  });
  return rows;
};

export const testConditions = (search, destructure) => {
  if (!Array.isArray(search)) return false;

  const comparators = {
      '!=': (a, b) => a !== b,
      '<': (a, b) => a < b,
      '<=': (a, b) => a <= b,
      '==': (a, b) => a === b,
      '>': (a, b) => a > b,
      '>=': (a, b) => a >= b,
      'array-contains': (a, b) => a.includes(b),
      'array-contains-any': (a, b) => b.some(c => a.includes(c)),
      in: (a, b) => b.includes(a),
      'not-in': (a, b) => !b.includes(a),
    },
    test = obj =>
      comparators[destructure?.[obj.operator] ?? obj.operator]?.(destructure?.[obj.field] ?? obj.field, obj.target);

  return search.some(x => (Array.isArray(x) ? x.every(y => test(y)) : test(x)));
};

export const decreaseSizeCDN = async (url, options = {}) => {
  const { initialSize, maxSize } = options,
    fileSize = (await getURL(url))?.data.length;

  let sizes = [4096, 2048, 1024, 600, 512, 300, 256, 128, 96, 64, 56, 32, 16],
    otherFileSize = fileSize;

  if (initialSize) sizes = sizes.filter(i => i < initialSize);
  while (maxSize ? maxSize < otherFileSize : fileSize === otherFileSize) {
    url = `${url.split('?')[0]}?size=${sizes.shift()}`;
    otherFileSize = (await getURL(url))?.data.length;
  }
  return url;
};

/**
 * @returns {Object} Remove keys with empty values from an object
 * @param {Object} obj The object to filter the values
 * @param {Object} options The function's options
 * @param {boolean} [options.recursion=true] Whether to also recursively filter nested objects (Default: True)
 * @param {boolean} [options.removeFalsy=false] Whether to remove all falsy values (Default: False)
 */
export const removeEmpty = (obj, options = {}) =>
  Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => (options.removeFalsy ? !!v : v != null))
      .map(([k, v]) => [k, v === ((options.recursion ?? true) && Object(v)) ? removeEmpty(v) : v]),
  );

export const toUTS = (time = Date.now(), style = 'R') =>
  `<t:${new Date(time).getTime().toString().slice(0, -3)}:${style}>`;

export const getURL = async (input, init) => {
  const res = await fetch(input, init);
  if (res.ok) return res.json();
};

/**
 * Search for an embed field with its name and return its value
 * @returns {string} The value of the field
 * @param {Object} embed The embed that will be used to search for its fields
 * @param {string} fieldName The name of the field that will be searched for
 */
export const getFieldValue = (embed, fieldName) =>
  embed?.fields?.find(({ name }) => name === fieldName || name.includes(fieldName))?.value ?? null;

/**
 * Adds new parameters to a URL
 * @returns {URL} The new URL
 * @param {URL} url The URL used to add new parameters
 * @param {Object} params The parameters to be added
 */
export const addSearchParams = (url, params = {}) =>
  Object.keys(params).length
    ? new URL(
        `${url.origin}${url.pathname}?${new URLSearchParams([
          ...Array.from(url.searchParams.entries()),
          ...Object.entries(params),
        ])}`,
      )
    : url;

/**
 * Differences in months two dates
 * @returns {number} How much months between the two dates
 * @param {Date} dateFrom The first date
 * @param {Date} dateTo The second date (Default: Current date)
 */
export const monthDiff = (dateFrom, dateTo = new Date()) =>
  dateTo.getMonth() - dateFrom.getMonth() + 12 * (dateTo.getFullYear() - dateFrom.getFullYear());

/**
 * Truncates a string with ellipsis
 * @returns {string} The string truncated with ellipsis
 * @param {string} input The string to truncate
 * @param {number} limit The limit of characters to be displayed until truncated (Default: 1020)
 */
export const truncate = (input, limit = 1020) => (input.length > limit ? `${input.substring(0, limit - 3)}...` : input);

/**
 * @returns {string} The mapped collections
 * @param {Collection} collections The collections to map
 * @param {Object} options The function's options
 * @param {string} [options.mapValue] Map something else instead of the mention
 * @param {number} [options.maxValues=40] The maximum amount of mapped collections to return (Default: 40)
 */
export const collMap = (collections, options = { maxValues: 40 }) => {
  const cM = discordSort(collections)
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
export const smp = string =>
  string
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/**
 * @returns {string} The bot invite
 * @param {number} id The bot id
 */
export const botInvite = id =>
  `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=1644971949559&scope=bot%20applications.commands`;

/**
 * Converts an user flag to an emoji
 * @returns {string} The emoji
 * @param {string} flag The user flag
 */
export const userFlagToEmoji = flag => {
  switch (flag) {
    case 'Staff':
      return emojis.discordEmployee;
    case 'Partner':
      return emojis.partneredServerOwner;
    case 'Hypesquad':
      return emojis.hypeSquadEvents;
    case 'HypeSquadOnlineHouse1':
      return emojis.bravery;
    case 'HypeSquadOnlineHouse2':
      return emojis.brilliance;
    case 'HypeSquadOnlineHouse3':
      return emojis.balance;
    case 'BugHunterLevel1':
      return emojis.bugHunterLvl1;
    case 'BugHunterLevel2':
      return emojis.bugHunterLvl2;
    case 'PremiumEarlySupporter':
      return emojis.earlySupporter;
    case 'VerifiedDeveloper':
      return emojis.earlyVerifiedBotDeveloper;
    case 'TeamPseudoUser':
      return emojis.teamUser;
    case 'CertifiedModerator':
      return emojis.certifiedMod;
    case 'BotHTTPInteractions':
      return emojis.commands;
  }
};

export const msToTime = ms => {
  const days = Math.floor(ms / 86400000),
    hours = Math.floor((ms % 86400000) / 3600000),
    minutes = Math.floor((ms % 3600000) / 60000),
    secs = Math.floor((ms % 60000) / 1000),
    miliSecs = Math.floor(ms % 1000);

  let str = '';
  if (days) str += `${days}d `;
  if (hours) str += `${hours}h `;
  if (minutes) str += `${minutes}m `;
  if (secs) str += `${secs}s `;
  if (miliSecs) str += `${miliSecs}ms`;

  return str.trim() || '0s';
};

export const search = (object, key) => {
  let value;
  for (key in object) value = object[key];

  return value;
};

export const searchKey = (object, value) => Object.keys(object).find(key => object[key] === value);

export const msgEdit = async (chan, id, medit) => {
  try {
    const message = await chan.messages.fetch(id);
    await message.edit(medit);
  } catch (err) {
    console.error(err);
  }
};

// Remove when color command is done
export const diEmb = (
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
    if (!diB || diB === 1) diB = eC.replace('000000', '000001');

    ciCE = diB.replace('ffffff', 'fffffe');

    if (!diL || diL === 1) {
      diL = '000000';
      if (tc(eC).isDark()) diL = 'ffffff';
    }
    if (!diT || diT === 1) diT = eC;
  }
  diT ||= getTS(['COLOR', 'INVALID_IMG']);

  if (!diEV || diEV === 1) {
    if (eMsg === 2) msg = msg.message;

    const embIURL = new URL(msg.embeds[0].image.url).pathname.split(/[/&]/);
    diEV = [embIURL[4]];
  }

  title ??= getTS(['COLOR', 'INVALID']);

  footer = getTS(['GENERIC', footer ? 'INTERACTED_BY' : 'REQUESTED_BY'], {
    USER: eU.username,
  });

  let emb = new EmbedBuilder()
    .setColor(ciCE)
    .setTitle(title)
    .setImage(`https://dummyimage.com/300x100/${diB}/${diL}&${diEV[0]}&text=+${parse(diT).path}`)
    .setFooter({ iconURL: eU.avatarURL(), name: footer })
    .setTimestamp(Date.now());

  if (description && description !== 0) emb = emb().setDescription(description);

  if (!eMsg || eMsg === 2) return emb;

  if (eMsg === 1) return msg.channel.send(emb);

  return eMsg.edit(emb);
};
