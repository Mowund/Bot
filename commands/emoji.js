const Discord = require('discord.js');
const client = new Discord.Client();
const emoji = require('../utils/emojis.js');

module.exports = {
  name: 'emoji',
  category: 'Utils',
  description: 'Exibe um emoji pré-definido.',
  callback: async ({ message, args, client }) => {
    if (message.channel.type === 'dm') return;

    var emj = emoji.name(args[0]);

    message.channel.send(emj);
  },
};
