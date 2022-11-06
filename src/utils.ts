import { URL } from 'node:url';
import {
  ButtonStyle,
  discordSort,
  ActionRowBuilder,
  Collection,
  Embed,
  Snowflake,
  UserFlags,
  TimestampStyles,
  TimestampStylesString,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ActionRow,
  MessageActionRowComponent,
  ButtonComponent,
  SelectMenuComponent,
  MessageActionRowComponentBuilder,
} from 'discord.js';
import { firestore } from 'firebase-admin';
import { emojis } from './defaults.js';

export const isValidImage = (contentType: string) => ['image/jpeg', 'image/png', 'image/gif'].includes(contentType);

/**
 * @returns Array of action rows with their components disabled (Note: Already updates the array defined)
 * @param rows Array of action rows that will get their components disabled
 * @param options The function's options
 * @param options.defaultValues Array of objects with component custom ids with a respective default value
 * @param options.disableLinkButtons Whether to disable link buttons (Default: False)
 * @param options.disabledComponents Array of component custom ids that will get disabled
 * @param options.enabledComponents Array of component custom ids that will get enabled (Is prioritized | Default: None of component
 * @param options.defaultValues.customId The component's custom id
 * @param options.defaultValues.value The component's default value
 */
export const disableComponents = (
  rows: ActionRow<MessageActionRowComponent>[],
  options: {
    disableLinkButtons?: boolean;
    enabledComponents?: string[];
    disabledComponents?: string[];
    defaultValues?: { customId: string; value: string }[];
  } = {},
) => {
  const rowsBuilder = rows.map(row => ActionRowBuilder.from(row) as ActionRowBuilder<MessageActionRowComponentBuilder>);
  rows?.forEach((row, rI) => {
    row.components?.forEach((c, cI) => {
      if (!options.disableLinkButtons && (c as ButtonComponent).style !== ButtonStyle.Link) {
        (rowsBuilder[rI].components[cI] as ButtonBuilder).setDisabled(
          !options.enabledComponents?.includes(c.customId) &&
            (options.disabledComponents?.length ? options.disabledComponents.includes(c.customId) : true),
        );

        options.defaultValues?.forEach(
          v =>
            c.customId === v.customId &&
            (c as SelectMenuComponent).options.forEach(
              (o, oI) =>
                o.value === v.value &&
                (rowsBuilder[rI].components[cI].data as StringSelectMenuBuilder).options?.[oI].setDefault(true),
            ),
        );
      }
    });
  });
  return rowsBuilder;
};

export const testConditions = (search: SearchOptions[][], destructure: { [x: string]: any }) => {
  if (!Array.isArray(search)) return false;

  const comparators = {
      '!=': (a: any, b: any) => a !== b,
      '<': (a: any, b: any) => a < b,
      '<=': (a: any, b: any) => a <= b,
      '==': (a: any, b: any) => a === b,
      '>': (a: any, b: any) => a > b,
      '>=': (a: any, b: any) => a >= b,
      'array-contains': (a: any[], b: any) => a.includes(b),
      'array-contains-any': (a: any, b: any[]) => b.some((c: any) => a.includes(c)),
      in: (a: any, b: any) => b.includes(a),
      'not-in': (a: any, b: any) => !b.includes(a),
    },
    test = (obj: SearchOptions) =>
      comparators[destructure?.[obj.operator] ?? obj.operator]?.(destructure?.[obj.field] ?? obj.field, obj.target);

  return search.some(x => x.every(y => test(y)));
};

export interface SearchOptions {
  /** The condition's left operand */
  field: any;
  /** The condition's operator */
  operator: firestore.WhereFilterOp;
  /** The condition's right operand */
  target: any;
}

export const decreaseSizeCDN = async (url: string, options: { initialSize?: number; maxSize?: number } = {}) => {
  const { initialSize, maxSize } = options,
    fileSize = (await fetchURL(url))?.data.length;

  let sizes = [4096, 2048, 1024, 600, 512, 300, 256, 128, 96, 64, 56, 32, 16],
    otherFileSize = fileSize;

  if (initialSize) sizes = sizes.filter(i => i < initialSize);
  while (maxSize ? maxSize < otherFileSize : fileSize === otherFileSize) {
    url = `${url.split('?')[0]}?size=${sizes.shift()}`;
    otherFileSize = (await fetchURL(url))?.data.length;
  }
  return url;
};

/**
 * @returns Remove keys with empty values from an object
 * @param object The object to filter the values
 * @param options The function's options
 * @param options.recursion Whether to also recursively filter nested objects (Default: True)
 * @param options.removeFalsy Whether to remove all falsy values (Default: False)
 * @param options.removeNull Whether to remove null values (Default: False)
 */
export const removeEmpty = (
  object: Record<string, any>,
  options: { removeFalsy?: boolean; removeNull?: boolean; recursion?: boolean } = {},
) =>
  Object.fromEntries(
    Object.entries(object)
      .filter(([, v]) => (!options.removeNull && v === null) || (options.removeFalsy ? !!v : v != null))
      .map(([k, v]) => [k, v === ((options.recursion ?? true) && Object(v)) ? removeEmpty(v) : v]),
  );

export const toUTS = (time = Date.now(), style: TimestampStylesString = TimestampStyles.RelativeTime) =>
  `<t:${new Date(time).getTime().toString().slice(0, -3)}:${style}>`;

export const fetchURL = async (input: RequestInfo, init?: RequestInit) => {
  try {
    const res = await fetch(input, init);
    if (res.ok) return res.json();
  } catch (e) {
    return null;
  }
};

/**
 * Search for an embed field with its name and return its value
 * @returns {string} The value of the field
 * @param {Object} embed The embed that will be used to search for its fields
 * @param {string} fieldName The name of the field that will be searched for
 */
export const getFieldValue = (embed: Embed, fieldName: string): string =>
  embed?.fields?.find(({ name }) => name === fieldName || name.includes(fieldName))?.value ?? null;

/**
 * Adds new parameters to a URL
 * @returns The new URL
 * @param url The URL used to add new parameters
 * @param params The parameters to be added
 */
export const addSearchParams = (url: URL, params: Record<string, string> = {}) =>
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
 * @returns How much months between the two dates
 * @param dateFrom The first date
 * @param dateTo The second date (Default: Current date)
 */
export const monthDiff = (dateFrom: Date, dateTo = new Date()) =>
  dateTo.getMonth() - dateFrom.getMonth() + 12 * (dateTo.getFullYear() - dateFrom.getFullYear());

/**
 * Truncates a string with ellipsis
 * @returns The string truncated with ellipsis
 * @param input The string to truncate
 * @param limit The limit of characters to be displayed until truncated (Default: 1024)
 */
export const truncate = (input: string, limit = 1024) =>
  input?.length > limit ? `${input.substring(0, limit - 3)}...` : input;

/**
 * @returns The mapped collections
 * @param collections The collections to map
 * @param options The function's options
 * @param options.mapValue Map something else instead of the mention
 * @param options.maxValues The maximum amount of mapped collections to return (Default: 40)
 */
export const collMap = (
  collections: Collection<string, any>,
  options: { mapValue?: string; maxValues?: number } = {},
) => {
  const cM = discordSort(collections)
    .map(c => (options.mapValue ? `\`${c[options.mapValue]}\`` : `${c}`))
    .reverse();
  let tCM = cM;
  if (tCM.length > options.maxValues) (tCM = tCM.slice(0, options.maxValues)).push(`\`+${cM.length - tCM.length}\``);

  return tCM.join(', ');
};

/**
 * @returns Simplify a string by normalizing and lowercasing it
 * @param string The string to simplify
 */
export const simplify = (string: string) =>
  string
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/**
 * @returns The bot invite
 * @param id The bot id
 */
export const botInvite = (id: Snowflake) =>
  `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=1644971949559&scope=bot%20applications.commands`;

/**
 * Converts an user flag to an emoji
 * @returns The emoji
 * @param flag The user flag
 */
export const userFlagToEmoji = (flag: keyof typeof UserFlags) => {
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

export const msToTime = (ms: number) => {
  const years = Math.floor(ms / 31536000000),
    days = Math.floor((ms % 31536000000) / 86400000),
    hours = Math.floor((ms % 86400000) / 3600000),
    minutes = Math.floor((ms % 3600000) / 60000),
    secs = Math.floor((ms % 60000) / 1000),
    miliSecs = Math.floor(ms % 1000);

  let str = '';
  if (years) str += `${years}y `;
  if (days) str += `${days}d `;
  if (hours) str += `${hours}h `;
  if (minutes) str += `${minutes}m `;
  if (secs) str += `${secs}s `;
  if (miliSecs) str += `${miliSecs}ms`;

  return str.trim() || '0s';
};

export const search = <O extends Record<any, any>>(object: O, key: keyof typeof object) => {
  let value: typeof object[typeof key];
  for (key in object) value = object[key];

  return value;
};

export const searchKey = <O extends Record<any, any>>(object: O, value: typeof object[keyof typeof object]) =>
  Object.keys(object).find(key => object[key] === value);
