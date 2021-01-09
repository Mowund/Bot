const Discord = require('discord.js');
const errors = require('../utils/errors.js');

module.exports = {
  name: 'clear',
  aliases: ['purge', 'prune'],
  category: 'Utils',
  description: 'Limpa as mensagens no chat.',
  expectedArgs: '(quantidade)',
  minArgs: 1,
  callback: async ({ message, args, client }) => {
    if (message.channel.type === 'dm') return;

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
      return errors.noPerms(message, 'Gerenciar Mensagens');
    if (!args[0])
      return message.delete().then(errors.noMsgQuantity(message.channel));

    message.channel.bulkDelete(msgt).then(() => {
      message.channel
        .send(msgq)
        .then((msg) => {
          msg.delete({ timeout: 5000 });
        })
        .catch(console.error);
    });
  },
};
