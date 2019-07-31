const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    if(!message.member.hasPermission("MANAGE_WEBHOOKS")) return errors.noPerms(message, "Gerenciar Webhooks");
    
        var actype = args[0].toUpperCase();
        var act = args.slice(1).join(" ");
    
    bot.user.setActivity(act, {type: actype});
    message.channel.send("Feito")
    
    if(args[0] === "streaming")
        var acturl = args[1]
        act = args.slice(2).join(" ")
    
    client.user.setActivity(act, {type: actype, url: acturl});

}

module.exports.help = {
  name:"setact"
}
