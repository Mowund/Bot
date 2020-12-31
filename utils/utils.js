const Discord = require("discord.js");
const client = new Discord.Client();

module.exports.msgEdit = async (chan, id, medit) => {
    
    try {
        const message = await chan.messages.fetch(id);
        if (!message) return console.log('Unable to find message.');
    
        await message.edit(medit);
    } catch(err) {
        console.error(err);
    }

}

module.exports.diEmb = (eMsg, message, color, title, diB, diL, diT, footer) => {

    var pEmb = new Discord.MessageEmbed()
    .setColor(parseInt(color, 16))
    .setTitle(title)
    .setImage(`https://dummyimage.com/300x100/${diB}/${diL}&text=+${diT}`);

    if (footer) {
        pEmb = new Discord.MessageEmbed()
        .setColor(parseInt(color, 16))
        .setTitle(title)
        .setImage(`https://dummyimage.com/300x100/${diB}/${diL}&text=+${diT}`)
        .setFooter(footer);
    };

    if (eMsg === 0) {
        message.channel.send(pEmb)
    } else {
        eMsg.edit(pEmb)
    };
}

/*module.exports.mentionRole = (m, r, chan) => {

            var role = m.guild.roles.find(x => x.id == r);
            
            role.edit({mentionable: true})
            .then(chan.send(`<@&${r}>`))
            .then(role.edit({mentionable: false}))
            .catch(err => console.error(err))

}*/
