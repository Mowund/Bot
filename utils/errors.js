const Discord = require("discord.js");
const fs = require("fs");

module.exports.noPerms = (message, perm) => {
    let embed = new Discord.MessageEmbed()
        .setAuthor(message.author.username)
        .setTitle("Permissão Insuficiente")
        .setColor("#ff0000")
        .addField("Permissão Necessária", perm);

    message.channel.send(embed).then(m => m.delete({timeout:5000}));
}

module.exports.equalPerms = (message, user, perms) => {

    let embed = new Discord.MessageEmbed()
        .setAuthor(message.author.username)
        .setColor("#ff0000")
        .setTitle("Erro")
        .addField(`${user} tem permissões`, perms);

    message.channel.send(embed).then(m => m.delete({timeout:5000}));

}

module.exports.botuser = (message) => {
    let embed = new Discord.MessageEmbed()
        .setTitle("Erro")
        .setDescription("Você não pode banir um bot.")
        .setColor("#ff0000");

    message.channel.send(embed).then(m => m.delete({timeout:5000}));
}

module.exports.cantfindUser = (channel) => {
    let embed = new Discord.MessageEmbed()
        .setTitle("Erro")
        .setDescription("Não foi possível encontrar este usuário.")
        .setColor("#ff0000");

    channel.send(embed).then(m => m.delete({timeout:5000}));
}

module.exports.noReason = (channel) => {
    let embed = new Discord.MessageEmbed()
        .setTitle("Erro")
        .setDescription("Por favor, providencie um motivo.")
        .setColor("#ff0000");

    channel.send(embed).then(m => m.delete({timeout:5000}));
}

module.exports.noMsgQuantity = (channel) => {
    let embed = new Discord.MessageEmbed()
        .setTitle("Erro")
        .setDescription("Por favor, providencie uma quantidade de mensagens.")
        .setColor("#ff0000");

    channel.send(embed).then(m => m.delete({timeout:5000}));
}
