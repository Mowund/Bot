const Discord = require("discord.js");
let pack = require("../package.json");

module.exports.run = async (bot, message, args) => {
    
    let botembed = new Discord.RichEmbed()
    .setTitle("**Informações do Bot**")
    .setColor("#15f153")
    .setThumbnail(bot.user.displayAvatarURL)
    .setDescription('[Servidor de Comunidade](https://discord.gg/f85rEGJ)')
    .addField("Nome do Bot", bot.user.username, true)
    .addField("Versão do Bot", pack.version, true);
  
    message.channel.send(botembed);
}

module.exports.help = {
  name:"botinfo"
}
