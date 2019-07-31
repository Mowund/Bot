const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    if(!message.member.hasPermission("ADMINISTRATOR")) return errors.noPerms(message, "Administrador");
    
    var type = args[0]
    var act = args[1]
    
    bot.user.setActivity(act, type);

}

module.exports.help = {
  name:"setstatus"
}
