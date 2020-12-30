const botconfig = require("../botconfig.json");
const Discord = require("discord.js");
let pr = (botconfig.prefix);

module.exports.run = async (bot, message, args) => {

let hEmbed = new Discord.MessageEmbed()
    .setColor("#0000ff")
    .setTitle("**Comandos**")
    .addField("Padrões", `${pr}botinfo\n${pr}help\n${pr}ping\n${pr}report\n${pr}serverinfo\n${pr}uptime`)
    .addField("Staff", `${pr}addrole\n${pr}ban\n${pr}clear\n${pr}kick\n${pr}prefix\n${pr}removerole\n${pr}say\n${pr}setact`);

    message.channel.send(hEmbed);

}

module.exports.help = {
  name: "help"
}
