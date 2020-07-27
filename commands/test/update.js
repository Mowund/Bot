const Discord = require('discord.js');
const utils = require('../../utils/utils.js');
const emj = require('../../utils/emojis.js');
const client = new Discord.Client();

module.exports.run = async (bot, message, args) => {

    const channel = message.guild.channels.find(c => c.id === '420352343402348544' && c.type === 'news')

    var e1 = new Discord.RichEmbed()
    /*.setThumbnail('')*/
    .setTitle('**Snapshot 20w22a**')
    .addField('**__Bots__**', '∗ O bot <@618587791546384385> agora suporta novos emojis e imagens, disponíveis em servidores de arquivo.\n\n- Os bots NSFW foram removidos, sendo eles **@BoobBot™#5382** e **@Nadeko#6685**.')
    .addField('**__Cargos__**', '+ Novo cargo: <@&698226508837421147>.\n\nㅤ• Usado no <#462669344841924618>.\n\n- Os cargos **@Notebook**, **@Tablet**, **@NSFW** e todos os de sexualidade foram deletados.')
    .addField('**__Categorias__**', '- A categoria **\\🔞 NSFW \\🔞** foi deletada.')
    .addField('**__Chats__**', '∗ O chat <#462669344841924618> foi atualizado:\n\nㅤ• Agora as mensagens são em embed.\n\nㅤ• Os emojis foram atualizados.\n\nㅤ• As etapas foram atualizadas:\n\nㅤㅤ• A etapa **1** (Gênero) agora tem mais uma opção: <@&698226508837421147>.\n\nㅤㅤ• As etapas **3** (PC ou Notebook) e **4** (Celular ou Tablet) foram mescladas e agora pergunta qual seu principal dispositivo (PC ou Celular).\n\nㅤㅤ• As etapas **2** (Sexualidade) e **7** (NSFW) foram removidas.\n\n- Os chats **#\\🔥nsfw-1\\🔥** e **#\\🔥nsfw-2\\🔥** foram deletados.')
    .setFooter('Esta é a 1ª snapshot da 1.18.', 'https://cdn.discordapp.com/icons/420007989261500418/7307c28f2b48677cb35619def07d6e00.png')
    .setColor(16711680);

    var role = "531267169464483860"

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
