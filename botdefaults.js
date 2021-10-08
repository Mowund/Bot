var emjs = {
  balance: '<:balance:895795305663045663>',
  bot: '<:bot:895804869334687745>',
  verifiedBot:
    '<:verifiedbot1:895804869598908426><:verifiedbot2:895804869586325524>',
};
module.exports = {
  botColor: '6622aa',
  botOwners: ['204761318434144256', '205130563424616450'],
  supportServer: 'https://discord.gg/f85rEGJ',
  defaultLanguage: 'en-US',
  supportedLanguages: ['en-US', 'pt-BR', 'es-ES'],
  emojis: emjs,
  /**
   * Whether event logs are activated
   */
  debugMode: false,
};

/**
 * @return {string} The bot invite
 * @param {number} id The bot id
 */
module.exports.botInvite = (id) => {
  return (
    'https://discord.com/api/oauth2/authorize?client_id=' +
    id +
    '&permissions=536870911991&scope=bot%20applications.commands'
  );
};

/**
 * Converts an user flag to an emoji
 * @return {string} The emoji
 * @param {string} flag The user flag
 */
module.exports.flagEmoji = (flag) => {
  switch (flag) {
    case 'DISCORD_EMPLOYEE':
      return;
    case 'PARTNERED_SERVER_OWNER':
      return;
    case 'HYPESQUAD_EVENTS':
      return;
    case 'BUGHUNTER_LEVEL_1':
      return;
    case 'HOUSE_BRAVERY':
      return;
    case 'HOUSE_BRILLIANCE':
      return;
    case 'HOUSE_BALANCE':
      return emjs.balance;
    case 'EARLY_SUPPORTER':
      return;
    case 'TEAM_USER':
      return;
    case 'BUGHUNTER_LEVEL_2':
      return;
    case 'VERIFIED_BOT':
      return emjs.verifiedBot;
    case 'EARLY_VERIFIED_BOT_DEVELOPER':
      return;
    case 'DISCORD_CERTIFIED_MODERATOR':
      return;
  }
};
