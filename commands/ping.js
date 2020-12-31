const Discord = require("discord.js")

module.exports.run = async (bot, message, args) => {
    
        let botMsg = await message.channel.send("〽️ Pingando...")
      
        botMsg.edit('', { embed: {
          title: "📶 Ping",
          description: [
            "**Tempo de Resposta:** `" + (botMsg.createdAt - message.createdAt) + "ms`",
            "**Bot:** `" + Math.round(bot.ws.ping) + "ms`",
            "**Uptime:** `" + msToTime(bot.uptime) + "`"
          ].join("\n"),
          color: 16711680,
          timestamp: new Date()
        }}).catch(() => botMsg.edit("🆘 Erro desconhecido."));
      }
      
      function msToTime(ms){
        days = Math.floor(ms / 86400000); // 24*60*60*1000
        daysms = ms % 86400000; // 24*60*60*1000
        hours = Math.floor(daysms / 3600000); // 60*60*1000
        hoursms = ms % 3600000; // 60*60*1000
        minutes = Math.floor(hoursms / 60000); // 60*1000
        minutesms = ms % 60000; // 60*1000
        sec = Math.floor(minutesms / 1000);
      
        let str = "";
        if (days) str = str + days + "d ";
        if (hours) str = str + hours + "h ";
        if (minutes) str = str + minutes + "m ";
        if (sec) str = str + sec + "s";
      
        return str;

}

module.exports.help = {
    name: "ping"
}
