'use strict';

const db = require('../database'),
  { debugMode } = require('../defaults');
require('colors');

module.exports = {
  name: 'guildDelete',
  async execute(client, guild) {
    await db.guilds.doc(guild.id).delete();
    if (debugMode) {
      console.log('Left '.red + guild.name.blue + ' ('.gray + guild.id.blue + ')'.gray);
    }
  },
};
