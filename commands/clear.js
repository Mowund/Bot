const Discord = require('discord.js');
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });
const errors = require('../utils/errors.js');

module.exports = {
  name: 'clear',
  aliases: ['purge', 'prune'],
  category: 'Utils',
  description: 'Limpa as mensagens no chat.',
  expectedArgs: '(quantidade)',
  callback: async ({ message, args, instance }) => {
    if (message.channel.type == 'dm') return errors.disDM(message.channel);

    var { guild } = message;

    function getTS(path, values) {
      return utils.getTSE(instance, guild, path, values);
    }

    var msgc = parseInt(args[0]);
    var msgt = Math.floor(msgc + 1);

    if (msgc === 0) {
      var msgq = 'Impossível deletar 0 mensagens.';
    } else if (msgc === 1) {
      msgq = `1 mensagem deletada.`;
    } else {
      msgq = `${msgc} mensagens deletadas.`;
    }

    if (!message.member.hasPermission('MANAGE_MESSAGES'))
      return errors.noPerms(message, getTS(['PERMS', 'MANAGE_MESSAGES']));
    if (!args[0])
      return message.delete().then(errors.noMsgQuantity(message.channel));

    message.channel.bulkDelete(msgt).then(() => {
      message.channel
        .send(msgq)
        .then((msg) => {
          client.setTimeout(() => msg.delete(), 3000);
        })
        .catch(console.error);
    });
  },
};
