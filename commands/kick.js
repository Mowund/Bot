const Discord = require('discord.js');
const errors = require('../utils/errors.js');

module.exports = {
  name: 'kick',
  category: 'Utils',
  description: 'Expulsa um membro.',
  callback: async ({ message, args, client }) => {
    if (message.channel.type === 'dm') return;

    if (!message.member.hasPermission('KICK_MEMBERS'))
      return errors.noPerms(message, 'Expulsar Membros');
    if (args[0] == 'help') {
      message.reply('Uso: !kick <usuário> <motivo>');
      return;
    }
    let kUser = message.guild.member(
      message.mentions.users.first() || message.guild.members.cache.get(args[0])
    );
    if (!kUser) return errors.cantfindUser(message.channel);
    let kReason = args.join(' ').slice(22);
    if (kUser.hasPermission('MANAGE_MESSAGES'))
      return errors.equalPerms(message, kUser, 'Gerenciar Mensagens');

    let kickEmbed = new Discord.MessageEmbed()
      .setColor('#e56b00')
      .addField('Usuário Expulsado', `${kUser} com o ID ${kUser.id}`)
      .addField(
        'Expulsado Por',
        `<@${message.author.id}> com o ID ${message.author.id}`
      )
      .addField('Expulsado em', message.channel)
      .addField('Hora', message.createdAt)
      .addField('Motivo', kReason);

    let kickChannel = message.guild.channels.cache.find(`name`, 'incidentes');
    if (!kickChannel)
      return message.channel.send(
        'Não foi possível encontrar um canal de incidentes.'
      );

    message.guild.member(kUser).kick(kReason);
    kickChannel.send(kickEmbed);
  },
};
