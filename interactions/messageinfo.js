const Discord = require('discord.js');
const { Util } = require('discord.js');
const utils = require('../utils/utils.js');

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
      if (interaction.data.resolved) {
        var message = utils.search(interaction.data.resolved.messages);
        if (command == 'messageinfo') {
          var content = message.content;
          return utils.iCP(
            client,
            0,
            interaction,
            ['Essa mensagem continha', content],
            1,
            0,
            1
          );
        }
      }
    }
  },
};
