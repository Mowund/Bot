'use strict';

const fs = require('node:fs'),
  db = require('../database'),
  { debugMode } = require('../defaults');
require('colors');

module.exports = {
  name: 'messageCreate',
  execute(client, i18n, message) {
    // TODO
    if (message.author.bot || message.guild.id !== '420007989261500418') return;
    fs.readFile('./assets/bad_domains.txt', async (err, f) => {
      if (err) return console.error(err);
      const badDomains = f
          .toString()
          .split('\n')
          .filter(n => n),
        scamReportTimeout = 15000;

      if (badDomains.some(w => message.content.includes(w))) {
        if (!message.author.lastScamTimestamp || Date.now() - message.author.lastScamTimestamp > scamReportTimeout) {
          const guildSettings = await db.guildGet(message.guild);

          if (guildSettings.logChannel) {
            const logChannel = await message.guild.channels.cache.get(guildSettings.logChannel);

            logChannel.send(`Bad word: ${message.content}`);
          }
          if (debugMode) {
            console.log('Bad word detected: '.gray + message.content.red);
          }
        }
        message.author.lastScamTimestamp = message.createdTimestamp;
      } else if (Date.now() - message.author.lastScamTimestamp > scamReportTimeout) {
        delete message.author.lastScamTimestamp;
      }
    });
  },
};
