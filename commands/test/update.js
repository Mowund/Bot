const Discord = require('discord.js');
const utils = require('../../utils/utils.js');
const emj = require('../../utils/emojis.js');
const client = new Discord.Client();

module.exports.run = async (bot, message, args) => {

    const channel = message.guild.channels.find(c => c.id === '420352343402348544')

    var e1 = new Discord.RichEmbed()
    .setTitle('**Snapshot 20w37a**')
    .addField('**__Cargos__**', '+ Novo cargo: <@&751632658517459086>.\n\nㅤ• Cargo ganho ao dar boost no servidor.\n\nㅤ• Fica acima dos Mowundenses, mudando a cor e separando dos mowundenses. Também tem acesso à call e chat **\\💎 EXCLUSIVO \\💎**. Não tem nenhuma outra função exclusiva no momento.')
    .addField('**__Chats__**', '+ Novos chats: <#752543560066400317>, <#752541321864020009>.\n\nㅤ• <#752543560066400317>:\n\nㅤㅤ• Similar ao chat <#510203957939798018>, é usado para listar ideias futuras para o servidor, porém, não confirmadas que ainda virão.\n\nㅤㅤ• O chat está abaixo do <#510203957939798018> e, por enquanto, ninguém consegue ver o chat.\n\nㅤ• <#752541321864020009>:\n\nㅤㅤ• Chat usado para a moderação receber notícias do próprio Discord\n\nㅤㅤ• O chat é oculto (ninguém consegue ver e está na categoria **\\❌ OCULTO \\❌**).\n\n∗ Os anúncios disponíveis de cada bot de jogo agora serão seguidos em seus respectivos chats.')
    .addField('**__Geral__**', '+ Novo plano de fundo de teste para convites do servidor (temporário por conta do nível 1 do server boost).\n\n+ O modo comunidade do servidor foi ativado.\n\n∗ O nível de verificação do servidor foi aumentado para de *Médio* para *Alto*.\n\n∗ O filtro de conteúdo de mídia explícita foi ativado para anilisar a mídia de todos os membros.\n\n∗ O V2E do servidor foi ativado.\n\n∗ Canais de voz agora serão chamados como *calls* no changelog e, também, serão mencionados pelo ID em negrito (\\*\\*\\<#462396024133124096>\\*\\* >> **<#462396024133124096>**).')
    .setFooter('Essa é a 3ª snapshot da 1.18.', message.guild.iconURL)
    .setColor(16711680);

    var role = '531267169464483860'

    if(args[0] === 'release') {
            utils.mentionRole(message, role, message.channel);
            message.channel.send(e1).then((msg) => {
                msg.react('⛔').then(() => msg.react('✅'));
                
          const filter = (reaction, user) => {
            return ['⛔', '✅'].includes(reaction.emoji.name) && user.id === message.author.id;
        };
        
        msg.awaitReactions(filter, {max: 1, time: 60000, errors: ['time']})
            .then(collected => {
                const reaction = collected.first();
        
                if (reaction.emoji.name === '⛔') {

                    message.channel.bulkDelete('2')
                    message.channel.send('Cancelado');
        
                } else {
                
                    if(message.member.roles.has('420008165762138124')) {
                        utils.mentionRole(message, role, channel);
                        channel.send(e1).then(sent => {
                            sent.react('update:593220375320723466');
                        });
                    } else {
                        message.channel.send('Você precisa ter o cargo **Fundador** para poder lançar uma versão.')
                    }
            }}).catch(collected => {
                err => console.error(err)
                message.channel.bulkDelete('2')
                message.channel.send('Tempo Esgotado.');
              })
            });

    } else if(args[0] === 'old') {
        if(args[1]) {
            utils.msgEdit(channel, args[1], e1);
            message.channel.send(`Changelog editado para:`, e1)
        } else {
            message.channel.send('Por favor, especifique uma mensagem.')
        }
    } else {
        message.channel.send(e1).then(sent => {
            sent.react('update:593220375320723466')
    })
    }
    
}

module.exports.help = {
  name:'update'
}
