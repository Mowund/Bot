const Discord = require("discord.js")

module.exports.run = async (bot, message, args) => {

    function duration(ms) {
        const sec = Math.floor((ms / 1000) % 60).toString()
        const min = Math.floor((ms / (1000 * 60)) % 60).toString()
        const hrs = Math.floor((ms / (1000 * 60 * 60)) % 60).toString()
        const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 60).toString()
        return `${days.padStart(0, '0')} dias, ${hrs.padStart(0, '0')} horas, ${min.padStart(0, '0')} minutos e ${sec.padStart(0, '0')} segundos`
    }

    message.channel.send(`Eu estou online por: ${duration(bot.uptime)}.`)

}

module.exports.help = {
    name: "uptime"
}