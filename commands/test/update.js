const Discord = require('discord.js');
const utils = require('../../utils/utils.js');
const client = new Discord.Client();

module.exports.run = async (bot, message, args) => {

    const channel = message.guild.channels.find(c => c.id === '420352343402348544' && c.type === 'news')

    var e1 = new Discord.RichEmbed()
    /*.setThumbnail('')*/
    .setTitle('**1.17.2 — Revamping Update**')
	.addField('**__Bots__**', '∗ O prefixo do modo de testes do <@618587791546384385> foi alterado de `>` para `}}`.\n\n∗ O prefixo do <@485962834782453762> foi alterado de `\\` para `>`.')
    .addField('**__Cargos__**', '+ Novo cargo de configuração: <@&692078877496967199>.\n\nㅤ• Cargo usado na **Menção de Atualização**.\n\n∗ Os antigos cargos da configuração **Menção de Atualização** a partir do Trailer (antigo **@A2**) teve a numeração aumentada 1 número (Ex: O **@A2** agora é <@&531265681459773440>).')
    .addField('**__Chats__**', '∗ A configuração **Menção de Atualização** recebeu algumas mudanças:\n\nㅤ• Agora você pode escolher mais uma outra opção, sendo o **Anúncio**, que lhe dá o cargo <@&692078877496967199>.\n\nㅤ• As reações foram resetadas e agora são números em vez de letras, mas ninguém perdeu os cargos da configuração.')
    .addField('**__Geral__**', '∗ O changelog recebeu mais algumas mudanças:\n\nㅤ• O tipo de changelog **Live** foi separado em duas partes:\n\nㅤㅤ• **Live**: Continua a mesma coisa, falando quando, onde e o que vai acontecer na próxima live do servidor. Continua mencionando o cargo <@&584460982726950912>.\n\nㅤㅤ• **Anúncios**: Após a live, em vez de ser mencionado também no tipo de changelog **live**, agora será mencionado separadamente, tudo oque ocorreu na live em um changelog. Menciona o cargo <@&692078877496967199>.\n\nㅤ• A cor do changelog de anúncio é **roxo** e do trailer agora será **rosa**.\n\nㅤ• O ícone do servidor que antes aparecia na *thumbnail* agora aparece no *footer*.')
    .setFooter('Essa é a 3ª e última release da Revamping Update!', 'https://cdn.discordapp.com/icons/420007989261500418/7307c28f2b48677cb35619def07d6e00.png')
    .setColor(65535);

    if(args[0] === 'release') {
        if(message.member.roles.has('420008165762138124')) {
            utils.mentionRole(message, '602143940321214475', channel);
            channel.send(e1).then(sent => {
                sent.react('update:593220375320723466');
          })
        } else {
            message.channel.send('Você precisa ter o cargo **Fundador** para poder lançar uma versão.')
        }
    } else if(args[0] === 'old') {
        utils.msgEdit(channel, args[1], e1);
        message.channel.send(`Changelog editado para:`, e1)
    } else {
        message.channel.send(e1).then(sent => {
            sent.react('update:593220375320723466')
    })
    }
    
}

module.exports.help = {
  name:'update'
}
