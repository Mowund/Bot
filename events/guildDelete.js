const { debugMode } = require('../botdefaults');
const db = require('../database');
require('colors');

module.exports = {
  name: 'guildDelete',
  async execute(client, guild) {
    db.guilds.doc(guild.id).delete();
    if (debugMode)
      console.log(
        'Left '.red + guild.name.blue + ' ('.gray + guild.id.blue + ')'.gray
      );
  },
};
