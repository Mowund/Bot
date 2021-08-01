const Discord = require('discord.js');
const utils = require('../utils/utils.js');
const database = require('../utils/database.js');

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

      if (command == 'language') {
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

        var lang = args;

        utils.iCP(client, 6, interaction);
        if (lang) {
          lang = lang.find((arg) => arg.name == 'language').value;
          database.setLanguage(guildI.id, lang);

          var emb = new Discord.MessageEmbed()
            .setColor('00ff00')
            .setTitle(await getTS(['LANGUAGE', 'CHANGED']))
            .setDescription(
              await getTS(['LANGUAGE', 'CHANGED_TO'], { LANG: lang })
            )
            .setTimestamp(Date.now())
            .setFooter(
              await getTS('GENERIC_REQUESTED_BY', {
                USER: uIF.username,
              }),
              uIF.avatarURL()
            );
          utils.iCP(client, 7, interaction, 0, 1, 0, emb);
        } else {
          lang = await database.getLanguage(guildI.id);

          var emb = new Discord.MessageEmbed()
            .setColor('00ff00')
            .setTitle(await getTS(['LANGUAGE', 'CURRENT']))
            .setDescription(
              await getTS(['LANGUAGE', 'CURRENT_IS'], { LANG: lang })
            )
            .setTimestamp(Date.now())
            .setFooter(
              await getTS('GENERIC_REQUESTED_BY', {
                USER: uIF.username,
              }),
              uIF.avatarURL()
            );
          utils.iCP(client, 7, interaction, 0, 1, 0, emb);
        }
      }
    }
  },
};
