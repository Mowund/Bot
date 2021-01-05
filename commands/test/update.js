const Discord = require('discord.js');
const utils = require('../../utils/utils.js');
const emj = require('../../utils/emojis.js');
const client = new Discord.Client();

module.exports = {
  name: 'update',
  category: 'Utils',
  description: 'Para atualizações do servidor',
  callback: async ({ message, args, client }) => {
    const channel = message.guild.channels.cache.find(
      (c) => c.id === '467133077475557376'
    );

    var e1 = new Discord.MessageEmbed()
      .setTitle('**Snapshot 21w01a**')
      .addField('**__Bots__**', 'a')
      .addField('**__Cargos__**', 'a')
      .addField('**__Categorias__**', 'a')
      .addField('**__Calls__**', 'a')
      .addField('**__Chats__**', 'a')
      .addField('**__Emojis__**', 'a')
      .addField('**__Geral__**', 'a')
      .setFooter(
        'Essa é a 6ª snapshot da 1.18 e a primeira de 2021!',
        message.guild.iconURL()
      )
      .setColor(16711680);

    var role = '531267169464483860';

    var ee = `<@&${role}> <@&772968044816498709>`,
      e1;

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
              message.channel.bulkDelete('2');
              message.channel.send('Cancelado');
            } else {
              if (message.member.roles.has('420008165762138124')) {
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
          })
          .catch((collected) => {
            (err) => console.error(err);
            message.channel.send('**Tempo Esgotado.**');
          });
      });
    } else if (args[0] === 'old') {
      if (args[1]) {
        utils.msgEdit(channel, args[1], ee);
        message.channel.send(`Changelog editado para:`, ee);
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
