const Discord = require("discord.js")

module.exports.run = async (bot, message, args) => {
    
    message.channel.send("Pingando...").then(m => {
        let ping = m.createdTimestamp = message.createdTimestamp
        let choices = ["Esse é realmente meu ping?", "Está tudo bem? Eu não posso ver.", "Eu espero que isso não seja ruim. Aqui está meu ping:"]
        let response = choices[Math.floor(Math.random() * choices.length)]

        m.edit(`${response}\n${Math.round(bot.ping)}ms`)
    })

}

module.exports.help = {
    name: "ping"
}
