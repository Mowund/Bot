'use strict';

const { debugMode } = require('../defaults');
require('colors');

module.exports = {
  name: 'guildCreate',
  async execute(client, i18n, guild) {
    const settings = await client.dbSet(guild, { language: guild.preferredLocale }, { setFromClient: true });
    if (debugMode) {
      console.log('Joined '.green + guild.name.blue + ' ('.gray + guild.id.blue + '):'.gray);
      console.log(settings);
    }
  },
};
