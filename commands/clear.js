const Discord = require("discord.js");
const errors = require("../utils/errors.js");

module.exports.run = async (bot, message, args) => {

  if(!message.member.hasPermission("MANAGE_MESSAGES")) return errors.noPerms(message, "Gerenciar Mensagens");
  if(!args[0]) return errors.noMsgQuantity();
  message.delete();
  message.channel.bulkDelete(args[0]).then(() => {
    message.channel.send(`${args[0]} mensagens deletadas.`).then(msg => msg.delete(5000));
  });
}

module.exports.help = {
  name: "clear"
}
