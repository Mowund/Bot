const Discord = require("discord.js");
const client = new Discord.Client();

module.exports.msgEdit = async (chan, id, medit) => {
    
    try {
        const message = await chan.messages.fetch(id);
        if(!message) return console.log('Unable to find message.');
    
        await message.edit(medit);
    } catch(err) {
        console.error(err);
    }

}

module.exports.diEmb = (eMsg, msg, color, title, diB, diL, diT, desc) => {

    var emb = new Discord.MessageEmbed()
    .setColor(parseInt(color, 16))
    .setTitle(title)
    .setImage(`https://dummyimage.com/300x100/${diB}/${diL}&text=+${diT}`)
    .setFooter(`Solicitado por ${msg.author.username}`, msg.author.avatarURL())
    .setTimestamp(Date.now());

    if(desc) {
        emb = emb.setDescription(desc)
    };

    if(eMsg === 0) {
        return emb
    } else if(eMsg === 1) {
        msg.channel.send(emb)
    } else {
        eMsg.edit(emb)
    };
}
