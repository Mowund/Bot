const Discord = require('discord.js');
const errors = require('../utils/errors.js');

module.exports.run = async (bot, message, args) => {

  message.delete();

  if(!message.member.hasPermission('MANAGE_MESSAGES')) return errors.noPerms(message, 'Gerenciar Mensagens');

  let guild = bot.guilds.cache.get(args[0]);
  var bmsg = args.join(' ');
  var cPos = 0;

  if(guild) {
    var channel = guild.channels.cache.get(args[1]);
    bmsg = args.slice(2).join(' ');
    cPos = 2;

  } else if(message.guild.channels.cache.get(args[0])) {
    var channel = message.guild.channels.cache.find(c => c.id === args[0])
    bmsg = args.slice(1).join(' ');
    cPos = 1;
  }

  if(args[cPos] === '/tts') {
    if(message.member.hasPermission('SEND_TTS_MESSAGES')) { 
      var tts = true;
      bmsg = args.slice(cPos + 1).join(' ');
    } else {
      errors.noPerms(message, 'Enviar Mensagens em TTS')
    };

  } else {
    tts = false;
  };

  if(!bmsg) return message.reply('especifique uma mensagem.').then((msg) => msg.delete({timeout: 5000}));
  
  
  if(channel) {
    channel.send(bmsg, {tts: tts});
  } else {
    message.channel.send(bmsg, {tts: tts});
  }

}

module.exports.help = {
  name: 'say'
}
