const Discord = require('discord.js');
const utils = require('../../utils/utils.js');
require('colors');
require('log-timestamp');

module.exports = async (client, instance) => {
  client.ws.on('INTERACTION_CREATE', async (interaction) => {
    if (interaction.data.name) {
      var command = interaction.data.name.toLowerCase();
      var args = interaction.data.options;

      var guildI = client.guilds.cache.get(interaction.guild_id);
      var uI = guildI.members.cache.get(interaction.member.user.id);
      var uIF = await client.users.fetch(uI.id);

      if (command == 'kill') {
        var kUser = uIF.username;

        if (args) {
          var kUserID = args.find((arg) => arg.name == 'user').value;
          uI = guildI.members.cache.get(kUserID);
          uIF = await client.users.fetch(uI.id);
          kUser = uIF.username;
        }

        utils.iCP(
          instance,
          client,
          0,
          interaction,
          [`**${kUser}**`, 'Caiu para fora do mundo.'],
          0,
          0,
          1
        );
      }
    }
  });
};

module.exports.config = {
  displayName: 'Kill Interaction',
  dbName: 'KillI',
  loadDBFirst: true,
};
