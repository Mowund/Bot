const Discord = require('discord.js');
const utils = require('../../utils/utils.js');
const client = new Discord.Client();

module.exports = {
  name: 'update',
  category: 'Utils',
  description: 'Para atualizações do servidor',
  callback: async ({ message, args, client }) => {
    if (message.channel.type === 'dm') return;

    const channel = message.guild.channels.cache.find(
      (c) => c.id === '420352343402348544'
    );

    var e1 = new Discord.MessageEmbed()
      .setTitle('**Snapshot 21w08a**')
      .addField(
        '**__Bots__**',
        '∗ A partir da próxima snapshot, o <@618587791546384385> usará o mesmo versionamento do servidor.'
      )
      .addField(
        '**__Cargos__**',
        '∗ Os cargos <@&460764499922911252> [<@&460764728512479242>] e <@&422236247000350751> [<@&447473425028743168>] tiveram a permissão de `gerenciar emojis` revogada.\n\n∗ Alguns cargos foram renomeados:\n\nㅤ• **@Testador** >> <@&447409833361014804>\nㅤ• **@Aniversariantes** >> <@&503219168007421971>\nㅤ• **@Mutado** >> <@&531313330703433758>'
      )
      .addField(
        '**__Calls__**',
        '∗ Agora só é possível transmitir vídeo (tela, jogo e câmera) nas calls **<#514122817520926731>** e todas as **#\\💠 Gerais**.\n\nㅤ• Experimental, logo somente os <@&447409833361014804> podem transmitir vídeo no momento.'
      )
      .addField(
        '**__Chats__**',
        '∗ O chat **#\\📰atualizações-bot** foi mesclado com o <#420352343402348544>.\n\nㅤ• Com isso, a partir da próxima snapshot, todas as mudanças no <@618587791546384385> serão mencionadas nos changelogs.'
      )
      .addField(
        '**__Emojis__**',
        '+ Novo emoji:\n\nㅤ• <:musiquinho:795852622778597406> **(musiquinho)**'
      )
      .addField(
        '**__Geral__**',
        '∗ Todos os `77` nos códigos de hex (de cargos e embeds) foram alterados para `80`.'
      )
      .setFooter(
        'Essa é a 6ª snapshot da 1.18 e a primeira de 2021!',
        message.guild.iconURL()
      )
      .setColor('ff0000');

    var role = '531267169464483860';

    if (args[0] === 'release') {
      message.channel.send(`<@&${role}> <@&772968044816498709>`);
      message.channel.send(e1).then((msg) => {
        msg.react('⛔').then(() => msg.react('✅'));

        const filter = (reaction, user) => {
          return (
            ['⛔', '✅'].includes(reaction.emoji.name) &&
            user.id === message.author.id
          );
        };

        msg
          .awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
          .then((collected) => {
            const reaction = collected.first();

            if (reaction.emoji.name === '⛔') {
              message.channel.send('**Cancelado**');
            } else {
              if (message.member.roles.cache.has('420008165762138124')) {
                channel.send(`<@&${role}> <@&772968044816498709>`);
                channel.send(e1).then((sent) => {
                  sent.react('update:593220375320723466');
                });
              } else {
                message.channel.send(
                  'Você precisa ter o cargo **Fundador** para poder lançar uma versão.'
                );
              }
            }
            msg.reactions.removeAll();
          })
          .catch((err) => {
            console.error(err);
            message.channel.send('**Tempo Esgotado.**');
          });
      });
    } else if (args[0] === 'old') {
      if (args[1]) {
        utils.msgEdit(channel, args[1], e1);
        message.channel.send(`Changelog editado para:`, e1);
      } else {
        message.channel.send('Por favor, especifique uma mensagem.');
      }
    } else {
      message.channel.send(e1).then((sent) => {
        sent.react('update:593220375320723466');
      });
    }
  },
};
