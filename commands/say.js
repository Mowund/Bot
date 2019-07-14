const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

  message.delete();
  
  args = args.shift();
  
    let chat = client.channels.find("id", args[0]);
    if(chat) {
        chat.send(args.shift().join(" "));
    } else {
    let botmessage = args.join(" ");
  message.channel.send(botmessage);
    }
}

module.exports.help = {
  name: "say"
}
