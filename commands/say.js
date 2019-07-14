const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

  message.delete();
  
  args = args.shift();
  
  let args0 = args[0]
  
    let chat = bot.channels.find(x => x.id === args0);
    if(chat) {
        chat.send(args.shift().join(" "));
    } else {
    message.channel.send(args.join(" "));
    }
}

module.exports.help = {
  name: "say"
}
