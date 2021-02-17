const Discord = require('discord.js');
const errors = require('../utils/errors.js');

module.exports = {
  name: 'ban',
  category: 'Utils',
  description: 'Bane um membro.',
  callback: async ({ message, args, client }) => {
    if (message.channel.type === 'dm') return;

    message.delete();
    if (!message.member.hasPermission('BAN_MEMBERS'))
      return errors.noPerms(message, 'Banir Membros');
    if (args[0] == 'help') {
      message.reply('Uso: `!ban <usuário> <motivo>`');
      return;
    }
    let bUser = message.guild.member(
      message.mentions.users.first() || message.guild.members.cache.get(args[0])
    );
    if (!bUser) return errors.cantfindUser(message.channel);
    if (bUser.id === client.user.id) return errors.clientuser(message);
    let bReason = args.join(' ').slice(22);
    if (!bReason) return errors.noReason(message.channel);
    if (bUser.hasPermission('MANAGE_MESSAGES'))
      return errors.equalPerms(message, bUser, 'Gerenciar Mensagens');

    let banEmbed = new Discord.MessageEmbed()
      .setColor('#bc0000')
      .addField('Usuário Banido', `${bUser} com o ID ${bUser.id}`)
      .addField(
        'Banido por',
        `<@${message.author.id}> com o ID ${message.author.id}`
      )
      .addField('Banido em', message.channel)
      .addField('Hora', message.createdAt)
      .addField('Motivo', bReason);

    let incidentchannel = message.guild.channels.cache.find(
      `name`,
      'incidentes'
    );
    if (!incidentchannel)
      return message.channel.send(
        'Não foi possível encontrar um canal de incidentes.'
      );

    message.guild.member(bUser).ban(bReason);
    incidentchannel.send(banEmbed);
  },
};
