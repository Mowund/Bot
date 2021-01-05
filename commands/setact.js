const Discord = require('discord.js');

module.exports = {
  name: 'setact',
  category: 'Utils',
  description: 'Define um status do bot.',
  callback: async ({ message, args, client }) => {
    if (!message.member.hasPermission('MANAGE_WEBHOOKS'))
      return errors.noPerms(message, 'Gerenciar Webhooks');

    var actype = args[0].toUpperCase();
    var act = args.slice(1).join(' ');

    client.user.setActivity(act, {
      type: actype,
    });

    message.channel.send(`Atividade setada para: \`${actype} ${act}\``);

    if (actype === 'STREAMING') {
      var acturl = args[1];
      act = args.slice(2).join(' ');

      client.user.setActivity(act, {
        type: actype,
        url: acturl,
      });
    }

    if (actype === 'CUSTOM') {
      var acturl = args[1];
      act = args.slice(2).join(' ');

      client.user.setActivity(act, {
        type: actype,
      });
    }
  },
};
