const Discord = require('discord.js');
const errors = require('../utils/errors.js');

module.exports = {
  name: 'eval',
  category: 'Utils',
  description: 'Retorna o resultado de um código.',
  callback: async ({ message, args, client, instance }) => {
    if (
      message.author.id != '205130563424616450' &&
      message.author.id != '204761318434144256'
    )
      return message.channel.send(
        'Somente o dono do bot pode usar esse comando.'
      );
    function getTS(path, values) {
      return utils.getTSE(instance, message.guild, path, values);
    }
    try {
      const clean = (text) => {
        if (typeof text === 'string')
          return text
            .replace(/`/g, '`' + String.fromCharCode(8203))
            .replace(/@/g, '@' + String.fromCharCode(8203));
        else return text;
      };

      try {
        const code = args.join(' ');
        let evaled = eval(code);

        if (typeof evaled != 'string') evaled = require('util').inspect(evaled);

        let embed = new Discord.MessageEmbed()
          .setTitle(getTS('GENERIC_SUCCESS'))
          .setDescription('```js\n' + clean(evaled) + '```')
          .setColor('00ff00');

        message.channel.send(embed);
      } catch (err) {
        let embed = new Discord.MessageEmbed()
          .setTitle(getTS('GENERIC_ERROR'))
          .setDescription('```js\n' + clean(err) + '```')
          .setColor('ff0000');

        message.channel.send(embed);
      }
    } catch (err) {
      console.log(err);
    }
  },
};
