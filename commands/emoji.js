const Discord = require("discord.js");
const client = new Discord.Client();
const emoji = require('../utils/emojis.js');

module.exports.run = (bot, message, args) => {
    var emj = emoji.name(args[0]);
    
    message.channel.send(emj);

}

module.exports.help = {
    name: "emoji"
}