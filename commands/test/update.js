const Discord = require('discord.js');
const utils = require('../../utils/utils.js');
const client = new Discord.Client();

module.exports.run = async (bot, message, args) => {

    const ctype = 'news'
    const cch = '420352343402348544'
    const channel = message.guild.channels.find(c => c.id === cch && c.type === ctype)

    var e1 = new Discord.RichEmbed()
    .setThumbnail(`https://cdn.discordapp.com/icons/420007989261500418/7307c28f2b48677cb35619def07d6e00.png`)
    .setTitle('**Snapshot 20w04b**')
    .addField('**__Comandos__**', '+ Novo comando: `-squote`\n\nㅤ• Comando usado para citar uma sugestão, tendo uma interface parecida com a do SCLM.\n\nㅤ• Uso correto: `-squote {ID da Mensagem da Sugestão}`')
    .addField('**__Erros__**', '∗ Erro corrigido:\n```Markdown\n#SRV-0013:\nO sistema de citação por link de mensagem não funciona.```')
    .addField('**__Geral__**', '∗ O changelog recebeu algumas mudanças:\n\nㅤ• O símbolo de mudança foi alterado de `*` para `∗`.\n\nㅤ• Os erros corrigidos agora são considerados mudanças, e não adições.\n\n∗ Os *fields* no sistema de sugestões agora são em negrito.\n\n∗ O sistema de citação por link de mensagem (SCLM) teve a interface atualizada.')
    .setFooter('Essa é a 14ª snapshot da 1.17!')
    .setColor(16711680);   
  

    if(args[0] === 'release') {
        if(message.member.roles.has('420008165762138124')) {
            utils.mentionRole(message, '531267169464483860', channel);
            channel.send(e1).then(sent => {
                sent.react('update:593220375320723466');
          })
        } else {
            message.channel.send('Você precisa ter o cargo **Fundador** para poder lançar uma versão.')
        }
    } else if(args[0] === 'old') {
        utils.msgEdit(message, ctype, channel, '643612237562380289', e1);
    } else {
        message.channel.send(e1).then(sent => {
            sent.react('update:593220375320723466')
        })
    }
    
}

module.exports.help = {
  name:'update'
}
