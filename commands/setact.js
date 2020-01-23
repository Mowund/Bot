const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    if(!message.member.hasPermission("MANAGE_WEBHOOKS")) return errors.noPerms(message, "Gerenciar Webhooks");
    
        var actype = args[0].toUpperCase();
        var act = args.slice(1).join(" ");
    
    bot.user.setActivity(act, {
    type: actype
});
    
    message.channel.send(`Atividade setada para: \`${act}\``)
    
    if(actype === "STREAMING") {
        var acturl = args[1]
        act = args.slice(2).join(" ")
    
    bot.user.setActivity(act, {
    type: actype,
    url: acturl
});
}

}

module.exports.help = {
  name:"setact"
}
