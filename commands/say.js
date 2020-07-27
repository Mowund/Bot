const Discord = require("discord.js");
const errors = require("../utils/errors.js");

module.exports.run = async (bot, message, args) => {

  message.delete();

  if(!message.member.hasPermission("MANAGE_MESSAGES")) return errors.noPerms(message, "Gerenciar Mensagens");

  if (message.guild.channels.get(args[0])) {
    var channel = message.guild.channels.find(c => c.id === args[0] && c.type === 'text')
  }

  if(args[0] === "/tts") {
    if(message.member.hasPermission("SEND_TTS_MESSAGES")) { 
      var tts = ("true");
      var bmsg = args.slice(1).join(" ");
    } else {
      errors.noPerms(message, "Enviar Mensagens em TTS")
    };
  } else {
    tts = ("false");
    bmsg = args.join(``);
  };
  
  if (channel) {
    channel.send(bmsg, {tts: tts});
  } else {
    message.channel.send(bmsg, {tts: tts});
  }

}

module.exports.help = {
  name: "say"
}
