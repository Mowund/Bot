const Discord = require('discord.js');
const utils = require('../../utils/utils.js');
const client = new Discord.Client();

module.exports.run = async (bot, message, args) => {

    const ctype = 'news'
    const channel = message.guild.channels.find(c => c.id === '420352343402348544' && c.type === ctype)

    var e1 = new Discord.RichEmbed()
    .setThumbnail(`https://cdn.discordapp.com/icons/420007989261500418/7307c28f2b48677cb35619def07d6e00.png`)
    .setTitle('**Snapshot 19w46a**')
    .addField("**__Bots__**", "+ Novos bots: <@593813539047604235>, <@485962834782453762> e <@172002275412279296>.\n\nㅤ• <@593813539047604235>:\n\nㅤㅤ• Seu prefix é: \`2\`\n\nㅤㅤ• Bot de jogo, disponível somente no chat <#521772002088845322>, junto com o <@528019494648414212>.\n\nㅤ• <@485962834782453762>:\n\nㅤㅤ• Seu prefix é: \`\\\`\n\nㅤㅤ• Bot geral, disponível em todos os chats, mas no momento, não tem uma função para o servidor.\n\nㅤ• <@172002275412279296>:\n\nㅤㅤ• Seu prefix é: \`t!\`\n\nㅤㅤ• Bot comum.")
    .addField("**__Cargos__**", "* A opção de mencionar o cargo por todos foi desativada em todos os cargos.")
    .addField("**__Chats__**", "* Agora os chats <#420352343402348544>, <#602176887166599168> e <#541692498624643073> são canais de anúncios, em vez de textos.\n\nㅤ• Ou seja, você agora pode seguir o canal para receber as atualizações nos seus servidores.\n\nㅤㅤ• Observação: Cargos mencionados no changelog sempre aparecerão como **@deleted-role** nos servidores seguidores.\n\n* O chat <#422236981586690048> foi desarquivado, usando agora o <@618587791546384385>.\n\nㅤ• Os comandos e suas informações estão nas instruções do chat, nas mensagens fixadas.")
    .addField("**__Erros__**", "+ Erro corrigido:\n```Markdown\n#SRV-0012:\nOs canais de voz 💠GERAL 1|2💠 e 💣JOGOS 1|2💣 não estavam com a taxa de bits em 76kbps.```")
    .addField("**__Geral__**", "+ O servidor agora tem licença de desenvolvedor, o que significa que agora pode ter canais de anúncios e de loja, para no futuro, poder ter jogos e coisas relacionadas, além de o servidor poder ser verificado no futuro.\n\n* O changelog recebeu alguns ajustes por conta do embed ter sido recentemente renovado.\n\nㅤ• Os changelogs usarão agora o <@618587791546384385> em vez do <@204255221017214977>.")
    .setFooter("Essa é a 12ª snapshot da 1.17 e a última de 2019!")
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
