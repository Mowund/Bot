const Discord = require('discord.js');
let pack = require('../package.json');

module.exports.run = async (bot, message, args) => {
    
    let botembed = new Discord.RichEmbed()
    .setTitle('**Informações do Bot**')
    .setColor('#00ff55')
    .setThumbnail(bot.user.displayAvatarURL)
    .addField('Nome do Bot', bot.user.username)
    .addField('Versão do Bot', pack.version, true)
    .addField('Convites', '[Servidor de Comunidade](https://discord.gg/f85rEGJ)\nBot privado, não é possível convidá-lo.');
  
    message.channel.send(botembed);
}

module.exports.help = {
  name:'botinfo'
}
