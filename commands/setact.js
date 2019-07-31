const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    if(!message.member.hasPermission("MANAGE_WEBHOOKS")) return errors.noPerms(message, "Gerenciar Webhooks");
    
    var actype = args[0].toUpperCase();
    var act = args[1];
    
    bot.user.setActivity(act, {type: actype});

}

module.exports.help = {
  name:"setact"
}
