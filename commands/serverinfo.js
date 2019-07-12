const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let sicon = message.guild.iconURL;
    let serverembed = new Discord.RichEmbed()
    .setDescription("Informações do Servidor")
    .setColor("#15f153")
    .setThumbnail(sicon)
    .addField("Nome do Servidor", message.guild.name)
    .addField("Criado em", message.guild.createdAt)
    .addField("Você entrou em", message.member.joinedAt)
    .addField("Total de Membros", message.guild.memberCount);

    message.channel.send(serverembed);
}

module.exports.help = {
  name:"serverinfo"
}
