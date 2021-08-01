const Discord = require('discord.js');

module.exports = {
  name: 'bip',
  category: 'Utils',
  description: 'Envia uma mensagem em webhook.',
  callback: async ({ message, args, client }) => {
    message.channel.fetchWebhooks().then(async (webhook) => {
      var msg = args.slice(0).join(' ');
      var options = {
        username: message.author.username,
        avatarURL: message.author.avatarURL(),
      };

      var found = webhook.find((w) => w.name == client.user.username);

      message.delete();

      if (!found) {
        message.channel
          .createWebhook(client.user.username, client.user.avatarURL())
          .then((webcreated) => {
            webcreated.send(msg, options);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        found.send(msg, options);
      }
    });
  },
};
