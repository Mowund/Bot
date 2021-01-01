const Discord = require("discord.js");
const errors = require("../utils/errors.js");
const emojis = require('../utils/emojis.js');

module.exports.run = async (bot, message, args) => {
    
    var guild = message.guild;
    var channel = args[0];
    var id = args[1];
    var reaction = args[2];

    var chan = message.guild.channels.cache.find(c => c.id === channel);

    if(!chan) {
        channel = message.channel.id;
        id = args[0];
        reaction = args[1];

        chan = message.guild.channels.cache.find(c => c.id === channel)

        try {
            var argsWith = args[1].startsWith('.');
            var emoji = args[1];

            var fM = chan.messages.fetch(id)
        } catch(err) {
            reaction = args[0]
            var argsWith = args[0].startsWith('.');
            var emoji = args[0];

            var fM = chan.messages.fetch(message.id)
        }

    } else {
        var argsWith = args[2].startsWith('.');
        var emoji = args[2];
        var fM = chan.messages.fetch(id)
    }

    try {
        const msg = await fM;
        
        if(argsWith) {

            var emj = emojis.name(emoji);
            await msg.react(emj);

        } else {
            await msg.react(reaction);
        }
    } catch(err) {
        console.error(err);
    }
}

module.exports.help = {
  name: "react"
}
