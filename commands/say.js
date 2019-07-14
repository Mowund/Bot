const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

  message.delete();
  
  args = args.shift();
  
    let chat = bot.channels.find(x => x.id === args[0]);
    if(chat) {
        chat.send(args.shift().join(" "));
    } else {
    message.channel.send(args.join(" "));
    }
}

module.exports.help = {
  name: "say"
}
