const Discord = require("discord.js");
const errors = require("../utils/errors.js");

module.exports.run = async (bot, message, args) => {

  message.delete();
  let botmessage = args.join(" ");
  message.channel.send(botmessage);
}

module.exports.help = {
  name: "say"
}
