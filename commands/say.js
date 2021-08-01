const Discord = require('discord.js');
const errors = require('../utils/errors.js');

module.exports = {
  name: 'say',
  category: 'Utils',
  description: 'Reproduz uma mensagem.',
  expectedArgs: '[channel] (message)',
  minArgs: 1,
  callback: async ({ message, args, client }) => {
    if (!message.guild) return;

    message.delete();

    var bmsg = args.join(' ');
    var cPos = 0;

    var channel = client.channels.cache.find(
      (c) => c.id == args[0].replace(/[\\<>@#&!]/g, '')
    );
    bmsg = args.slice(1).join(' ');
    cPos = 1;

    if (!message.member.hasPermission('MANAGE_MESSAGES'))
      return errors.noPerms(message, 'Gerenciar mensagens neste servidor');

    if (args[cPos] == '/tts') {
      var tts = true;
      bmsg = args.slice(cPos + 1).join(' ');

      if (guild) {
        if (!member.hasPermission('SEND_TTS_MESSAGES'))
          return errors.noPerms(
            message,
            'Enviar mensagens em TTS no servidor especificado'
          );
      }

      if (!message.member.hasPermission('SEND_TTS_MESSAGES'))
        return errors.noPerms(
          message,
          'Enviar mensagens em TTS neste servidor'
        );
    } else {
      tts = false;
    }

    if (!bmsg)
      return message
        .reply('especifique uma mensagem.')
        .then((msg) => client.setTimeout(() => msg.delete(), 3000));

    if (channel) {
      channel.send(bmsg, { tts: tts });
    } else {
      message.channel.send(bmsg, { tts: tts });
    }
  },
};
