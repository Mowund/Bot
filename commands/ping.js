const Discord = require("discord.js")

module.exports.run = async (bot, message, args) => {
    
    message.channel.send("Pingando...").then(m => {
        let ping = m.createdTimestamp = message.createdTimestamp
        let choices = ["Isso é realmente meu ping?", "Está tudo bem? Eu não posso ver.", "Eu espero que isso não seja ruim."]
        let response = choices[Math.floor(Math.random() * choices.length)]

        m.edit(`${response} Bot Latency: ${ping}, API Latency: ${Math.round(bot.ping)}`)
    })

}

module.exports.help = {
    name: "ping"
}