const Discord = require('discord.js');
const errors = require('../utils/errors.js');

module.exports = {
  name: 'removerole',
  category: 'Utils',
  description: 'Remove o cargo de um membro.',
  callback: async ({ message, args, client }) => {
    if (message.channel.type === 'dm') return;

    if (!message.member.hasPermission('MANAGE_ROLES'))
      return errors.noPerms(message, 'Gerenciar Cargos');
    if (args[0] == 'help') {
      message.reply(`Uso: ${args[0]}removerole <usuário> <cargo>`);
      return;
    }
    let rMember =
      message.guild.member(message.mentions.users.first()) ||
      message.guild.members.get(args[0]);
    if (!rMember)
      return message.reply('Não foi possível encontrar este usuário.');
    let role = args.join(' ').slice(22);
    if (!role) return message.reply('Especifique um cargo!');
    let gRole = message.guild.roles.find(`name`, role);
    if (!gRole) return message.reply('Não foi possível encontrar este.');

    if (!rMember.roles.has(gRole.id))
      return message.reply(`${rMember} já tem este cargo.`);
    await rMember.roles.remove(gRole.id);

    try {
      await rMember.send(`Você perdeu o cargo ${gRole.name}.`);
    } catch (e) {
      message.channel.send(`<@${rMember.id}> perdeu o cargo ${gRole.name}.`);
    }
  },
};
