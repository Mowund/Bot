const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    if(!message.member.hasPermission("ADMINISTRATOR")) return errors.noPerms(message, "Administrador");
    
    var actype = args[0].toUpperCase();
    var act = args[1];
    
    bot.user.setActivity(act, {type: actype});

}

module.exports.help = {
  name:"setact"
}
