const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let bicon = bot.user.displayAvatarURL;
    let botembed = new Discord.RichEmbed()
    .setDescription("Informações do Bot")
    .setColor("#15f153")
    .setThumbnail(bicon)
    .addField("Nome do Bot", bot.user.username, true)
    .addField("Versão do Bot", package.version, true)
    .addField("Criado em", bot.user.createdAt);

    message.channel.send(botembed);
}

module.exports.help = {
  name:"botinfo"
}
