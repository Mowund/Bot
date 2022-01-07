'use strict';

const { debugMode } = require('../defaults');
require('colors');

module.exports = {
  name: 'messageCreate',
  async execute(client, i18n, message) {
    // TODO
    if (message.author.bot || message.guild.id !== '420007989261500418') return;

    const scamReportTimeout = 15000;
    if (client.badDomains.some(w => message.content.includes(w))) {
      if (!message.author.lastScamTimestamp || Date.now() - message.author.lastScamTimestamp > scamReportTimeout) {
        const guildSettings = await client.dbGet(message.guild);

        if (guildSettings.log.badDomains && guildSettings.log.channel) {
          const logChannel = await message.guild.channels.cache.get(guildSettings.logChannel);

          logChannel.send(`Bad word: ${message.content}`);
          if (debugMode) {
            console.log('Bad word detected: '.gray + message.content.red);
          }
        }
      }
      message.author.lastScamTimestamp = message.createdTimestamp;
    } else if (Date.now() - message.author.lastScamTimestamp > scamReportTimeout) {
      delete message.author.lastScamTimestamp;
    }
  },
};
