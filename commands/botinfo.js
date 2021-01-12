const Discord = require('discord.js');
let pack = require('../package.json');

module.exports = {
  name: 'botinfo',
  category: 'Utils',
  description: 'Exibe informações do bot.',
  callback: async ({ message, args, client }) => {
    if (message.channel.type === 'dm') return;

    let clientembed = new Discord.MessageEmbed()
      .setTitle('**Informações do Bot**')
      .setColor('00ff55')
      .setThumbnail(client.user.displayAvatarURL())
      .addField('Nome do Bot', client.user.username)
      .addField('Versão do Bot', pack.version, true)
      .addField('Data de Criação', client.user.createdAt)
      .addField(
        'Servidores',
        `O bot está em atualmente **${client.guilds.cache.size}** servidores.`,
        true
      )
      .addField(
        'Convites',
        '[Servidor de Comunidade](https://discord.gg/f85rEGJ)\nBot privado, não é possível convidá-lo.'
      );

    message.channel.send(clientembed);
  },
};
