const Discord = require("discord.js");
const client = new Discord.Client();

module.exports.msgEdit = async (m, chan, id, medit) => {
    
    /*const guild = client.guilds.get('420007989261500418');
    if (!guild) return console.log('Unable to find guild.');*/
    
    const channel = m.channels.find(c => c.id === chan && c.type === 'text');
    if (!channel) return console.log('Unable to find channel.');
    
    try {
        const message = await channel.fetchMessage(id);
        if (!message) return console.log('Unable to find message.');
    
        await message.edit(medit);
        console.log('Done.');
    } catch(err) {
        console.error(err);
    }

}

module.exports.mentionRole = (m, r, chan) => {

            var role = m.guild.roles.find(x => x.id == r);
            
            role.edit({mentionable: true})
            .then(chan.send(`<@&${r}>`))
            .then(role.edit({mentionable: false}))
            .catch(err => console.error(err))

}
