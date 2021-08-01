const Discord = require('discord.js');
const errors = require('../utils/errors.js');
const utils = require('../utils/utils.js');
const pack = require('../package.json');

module.exports = {
  name: 'botinfo',
  category: 'Utils',
  description: 'Exibe informações do bot.',
  callback: async ({ message, client, instance }) => {
    if (!message.guild) return errors.disDM(message.channel);

    var { guild } = message;

    function getTS(path, values) {
      return utils.getTSE(instance, guild, path, values);
    }

    let clientembed = new Discord.MessageEmbed()
      .setTitle(getTS('BOTINFO_TITLE'))
      .setColor('00ff55')
      .setThumbnail(client.user.avatarURL())
      .addField(getTS('BOTINFO_NAME_FIELD'), client.user.username)
      .addField(getTS('BOTINFO_VERSION_FIELD'), pack.version, true)
      .addField(
        getTS('BOTINFO_CREATION_FIELD'),
        utils.toUTS(client.user.createdAt)
      )
      .addField(
        getTS('BOTINFO_SERVERS_FIELD'),
        getTS('BOTINFO_SERVERS_FIELD_DESC', {
          SERVERS: client.guilds.cache.size,
        }),
        true
      )
      .addField(
        getTS('BOTINFO_INVITES_FIELD'),
        getTS('BOTINFO_INVITES_FIELD_DESC', {
          INVITE: 'https://discord.gg/f85rEGJ',
        })
      )
      .setTimestamp(Date.now());

    message.channel.send(clientembed);
  },
};

module.exports.config = {
  loadDBFirst: true,
};
