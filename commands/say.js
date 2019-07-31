const Discord = require("discord.js");
const errors = require("../utils/errors.js");

module.exports.run = async (bot, message, args) => {

  message.delete();
  
  if(!message.member.hasPermission("MANAGE_MESSAGES")) return errors.noPerms(message, "Gerenciar Mensagens");
  
  if(args[0] === "/tts") {
  if(message.member.hasPermission("SEND_TTS_MESSAGES")) { 
  var tts = ("true");
  var bmsg = args.slice(1).join(" ");
  } return  errors.noPerms(message, "Enviar Mensagens em TTS");
  } else {
  tts = ("false");
  bmsg = args.join(" ");
  };
  
  
  message.channel.send(bmsg, {tts: tts});
}

module.exports.help = {
  name: "say"
}
