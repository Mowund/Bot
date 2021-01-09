const Discord = require('discord.js');
const botconfig = require('../botconfig.json');
const errors = require('../utils/errors.js');

module.exports = {
  name: 'report',
  category: 'Utils',
  description: 'Reporta um membro.',
  callback: async ({ message, args, client }) => {
    if (message.channel.type === 'dm') return;

    message.delete();
    if (args[0] == 'help') {
      message.reply('Uso: !report <usuário> <motivo>');
      return;
    }
    let rUser = message.guild.member(
      message.mentions.users.first() || message.guild.members.get(args[0])
    );
    if (!rUser) return errors.cantfindUser(message.channel);
    let rreason = args.join(' ').slice(22);
    if (!rreason) return errors.noReason(message.channel);

    let reportEmbed = new Discord.MessageEmbed()
      .setColor('#ff6a00')
      .addField('Usuário Reportado', `${rUser} com o ID: ${rUser.id}`)
      .addField(
        'Reportado Por',
        `${message.author} com o ID: ${message.author.id}`
      )
      .addField('Canal', message.channel)
      .addField('Tempo', message.createdAt)
      .addField('Motivo', rreason);

    let reportschannel = message.guild.channels.cache.find(`name`, 'reportes');
    if (!reportschannel)
      return message.channel.send(
        'Não foi possível encontrar um canal de reporte.'
      );
    reportschannel.send(reportEmbed);
  },
};
