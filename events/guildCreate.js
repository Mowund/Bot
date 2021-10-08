const { debugMode } = require('../botdefaults');
const db = require('../database');
require('colors');

module.exports = {
  name: 'guildCreate',
  async execute(client, guild) {
    db.setLanguage(guild.id, guild.preferredLocale);
    if (debugMode)
      console.log(
        'Joined '.green +
          guild.name.blue +
          ' ('.gray +
          guild.id.blue +
          ') - '.gray +
          guild.preferredLocale.blue
      );
  },
};
