const Discord = require('discord.js');
const utils = require('../utils/utils.js');
require('colors');
require('log-timestamp');

module.exports = {
  name: 'INTERACTION_CREATE',
  async execute(client, interaction) {
    function getTS(path, values) {
      return utils.getTSE(interaction.guild_id, path, values);
    }
    var guildI = client.guilds.cache.get(interaction.guild_id);
    if (guildI) {
      var uI = guildI.members.cache.get(interaction.member.user.id);
      var uIF = await client.users.fetch(interaction.member.user.id);
    }

    if (interaction.data.name) {
      var command = interaction.data.name.toLowerCase();
      var args = interaction.data.options;

      if (command == 'kill') {
        if (!guildI)
          return utils.iCP(
            client,
            0,
            interaction,
            [0, await getTS('GENERIC_NO_DM')],
            1,
            0,
            1
          );

        var kUser = uIF.username;

        if (args) {
          var kUserID = args.find((arg) => arg.name == 'user').value;
          uI = guildI.members.cache.get(kUserID);
          uIF = await client.users.fetch(uI.id);
          kUser = uIF.username;
        }

        utils.iCP(
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
  },
};
