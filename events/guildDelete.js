'use strict';

const { debugMode } = require('../defaults');
require('colors');

module.exports = {
  name: 'guildDelete',
  async execute(client, i18n, guild) {
    const settings = await client.dbDelete(guild);
    if (debugMode) {
      console.log('Left '.red + guild.name.blue + ' ('.gray + guild.id.blue + '):'.gray);
      console.log(settings);
    }
  },
};
