const Discord = require("discord.js");
let pack = require("../package.json");

module.exports.run = async (bot, message, args) => {
    let bicon = bot.user.displayAvatarURL;
    let botembed = new Discord.RichEmbed()
    .setDescription("Informações do Bot")
    .setColor("#15f153")
    .setThumbnail(bicon)
    .addField("Nome do Bot", bot.user.username, true)
    .addField("Versão do Bot", pack.version, true)
    .addField("Criado em", bot.user.createdAt)
    .addField("Shards", bot.shard.fetchClientValues);

    message.channel.send(botembed);
}

module.exports.help = {
  name:"botinfo"
}
