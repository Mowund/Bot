const Discord = require("discord.js");
const botconfig = require("../botconfig.json");
const red = botconfig.red;
const green = botconfig.green;
const orange = botconfig.orange;
const errors = require("../utils/errors.js");

module.exports.run = async (bot, message, args) => {
    message.delete();
    if(args[0] == "help"){
      message.reply("Uso: !report <usuário> <motivo>");
      return;
    }
    let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!rUser) return errors.cantfindUser(message.channel);
    let rreason = args.join(" ").slice(22);
    if(!rreason) return errors.noReason(message.channel);

    let reportEmbed = new Discord.RichEmbed()
    .setDescription("Reporte")
    .setColor(orange)
    .addField("Usuário Reportado", `${rUser} com o ID: ${rUser.id}`)
    .addField("Reportado Por", `${message.author} com o ID: ${message.author.id}`)
    .addField("Canal", message.channel)
    .addField("Tempo", message.createdAt)
    .addField("Motivo", rreason);

    let reportschannel = message.guild.channels.find(`name`, "reports");
    if(!reportschannel) return message.channel.send("Não foi possível encontrar um canal de reporte.");
    reportschannel.send(reportEmbed);

}

module.exports.help = {
  name: "report"
}
