const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

  message.delete();
  
  if(!message.member.hasPermission("MANAGE_MESSAGES")) return errors.noPerms(message, "Gerenciar Mensagens");
  
  let botmessage = args.join(" ");
  
  message.channel.send(botmessage);
}

module.exports.help = {
  name: "say"
}
