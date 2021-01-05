const Discord = require('discord.js');
let pack = require('../package.json');

module.exports = {
  name: 'botinfo',
  category: 'Utils',
  description: 'Exibe informações do bot.',
  callback: async ({ message, args, client }) => {
    let clientembed = new Discord.MessageEmbed()
      .setTitle('**Informações do client**')
      .setColor('#00ff55')
      .setThumbnail(client.user.displayAvatarURL())
      .addField('Nome do client', client.user.username)
      .addField('Versão do client', pack.version, true)
      .addField(
        'Servidores',
        `O client está em atualmente **${client.guilds.cache.size}** servidores.`
      )
      .addField(
        'Convites',
        '[Servidor de Comunidade](https://discord.gg/f85rEGJ)\nclient privado, não é possível convidá-lo.'
      );

    message.channel.send(clientembed);
  },
};
