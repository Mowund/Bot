const Discord = require('discord.js');
const tc = require('tinycolor2');
const kick = require('../../commands/kick.js');
const utils = require('../../utils/utils.js');
require('colors');
require('log-timestamp');

module.exports = async (client, instance) => {
  client.api
    .applications(client.user.id)
    .guilds('420007989261500418')
    .commands.post({
      data: {
        name: 'punish',
        description: 'Pune ou despune um membro.',
        options: [
          {
            name: 'add',
            description: 'Pune um membro. (Somente dono)',
            type: 1,
            options: [
              {
                name: 'type',
                description: 'Tipo de punimento.',
                type: 3,
                required: true,
                choices: [
                  {
                    name: 'Warn',
                    value: 'warn',
                  },
                  {
                    name: 'Strike',
                    value: 'strike',
                  },
                  {
                    name: 'Ban',
                    value: 'ban',
                  },
                ],
              },
              {
                name: 'member',
                description: 'Membro que será punido.',
                type: 6,
                required: true,
              },
            ],
          },
          {
            name: 'remove',
            description: 'Despune um membro. (Somente dono)',
            type: 1,
            options: [
              {
                name: 'member',
                description: 'Membro que será despunido.',
                type: 6,
                required: true,
              },
            ],
          },
        ],
      },
    });

  client.ws.on('INTERACTION_CREATE', async (interaction) => {
    if (interaction.data.name) {
      const command = interaction.data.name.toLowerCase();
      var args = interaction.data.options;

      const guildI = client.guilds.cache.get(interaction.guild_id);
      const uI = guildI.members.cache.get(interaction.member.user.id);
      const uIF = await client.users.fetch(uI.id);

      if (command == 'punish') {
      }
    }
  });
};

module.exports.config = {
  displayName: 'Punish Interaction',
  dbName: 'PunishI',
  loadDBFirst: true,
};
