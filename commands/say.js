const Discord = require('discord.js');
const errors = require('../utils/errors.js');

module.exports = {
  name: 'say',
  category: 'Utils',
  description: 'Reproduz uma mensagem.',
  callback: async ({ message, args, client }) => {
    message.delete();

    let guild = client.guilds.cache.get(args[0]);
    var bmsg = args.join(' ');
    var cPos = 0;

    if (guild) {
      var channel = guild.channels.cache.get(
        args[1].replace(/[\\<>@#&!]/g, '')
      );
      var member = guild.members.cache.get(message.author.id);
      bmsg = args.slice(2).join(' ');
      cPos = 2;

      if (!member.hasPermission('MANAGE_MESSAGES'))
        return errors.noPerms(
          message,
          'Gerenciar mensagens no servidor especificado'
        );
    } else if (
      message.guild.channels.cache.get(args[0].replace(/[\\<>@#&!]/g, ''))
    ) {
      var channel = message.guild.channels.cache.find(
        (c) => c.id === args[0].replace(/[\\<>@#&!]/g, '')
      );
      bmsg = args.slice(1).join(' ');
      cPos = 1;
    }

    if (!message.member.hasPermission('MANAGE_MESSAGES'))
      return errors.noPerms(message, 'Gerenciar mensagens neste servidor');

    if (args[cPos] === '/tts') {
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
        .then((msg) => msg.delete({ timeout: 5000 }));

    if (channel) {
      channel.send(bmsg, { tts: tts });
    } else {
      message.channel.send(bmsg, { tts: tts });
    }
  },
};
