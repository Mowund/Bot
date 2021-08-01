const Discord = require('discord.js');
const utils = require('../utils/utils.js');

module.exports = {
  name: 'serverinfo',
  category: 'Utils',
  description: 'Exibe informações do servidor.',
  callback: async ({ message, args, client }) => {
    if (!message.guild) return;

    let serverembed = new Discord.MessageEmbed()
      .setDescription('Informações do Servidor')
      .setColor('15f153')
      .setThumbnail(message.guild.iconURL())
      .addField('Nome do Servidor', message.guild.name)
      .addField('Criado em', utils.toUTS(message.guild.createdAt))
      .addField('Você entrou em', utils.toUTS(message.member.joinedAt))
      .addField('Total de Membros', message.guild.memberCount);

    message.channel.send(serverembed);
  },
};
