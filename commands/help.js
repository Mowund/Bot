const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
let pr = (botconfig.prefix);

module.exports.run = async (bot, message, args) => {

let hEmbed = new Discord.RichEmbed()
    .setColor("#0000ff")
    .setTitle("**Comandos**")
    .addField("Padrões", `${pr}`)
    .addField("Staff", `${pr}`);

    message.channel.send(hEmbed);

}

module.exports.help = {
  name: "help"
}
