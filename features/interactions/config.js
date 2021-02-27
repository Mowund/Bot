const Discord = require('discord.js');
const tc = require('tinycolor2');
const utils = require('../../utils/utils.js');
require('colors');
require('log-timestamp');

module.exports = async (client, instance) => {
  client.api
    .applications(client.user.id)
    .guilds('420007989261500418')
    .commands.post({
      data: {
        name: 'config',
        description: 'Configura interações.',
        options: [
          {
            name: 'delete',
            description: 'Deleta uma interação. (Somente dono)',
            type: 1,
            options: [
              {
                name: 'id',
                description: 'ID da interação.',
                type: 3,
                required: true,
              },
            ],
          },
          {
            name: 'list',
            description: 'Lista todas as interações no console. (Somente dono)',
            type: 1,
          },
        ],
      },
    });

  client.ws.on('INTERACTION_CREATE', async (interaction) => {
    const command = interaction.data.name.toLowerCase();
    var args = interaction.data.options;

    const guildI = client.guilds.cache.get(interaction.guild_id);
    const uI = guildI.members.cache.get(interaction.member.user.id);
    const uIF = await client.users.fetch(uI.id);

    var getId = await client.api.applications(client.user.id).commands.get();
    var getIdG = await client.api
      .applications(client.user.id)
      .guilds(guildI.id)
      .commands.get();

    var argsJ = args;
    if (args.find((arg) => arg['options'])) {
      argsJ = args.find((arg) => arg['options']);
    }

    console.log(
      guildI.name.green +
        ' ('.gray +
        guildI.id.green +
        ') - '.gray +
        uIF.username.cyan +
        ' ('.gray +
        uI.id.cyan +
        '): '.gray +
        command +
        ':'.gray +
        JSON.stringify(argsJ)
    );

    if (command == 'config') {
      if (uI.id != '205130563424616450')
        return utils.iCP(
          client,
          interaction,
          '> **Somente o dono pode usar esse comando.**',
          1
        );

      if (args.find((arg) => arg.name.toLowerCase() == 'list')) {
        console.table(getId);
        console.table(getIdG);
        utils.iCP(
          client,
          interaction,
          '> **Interações listadas no console.**',
          1
        );
      }

      if (args.find((arg) => arg.name.toLowerCase() == 'delete')) {
        iID = args
          .find((arg) => arg['options'])
          .options.find((arg) => arg['value']);

        if (!iID)
          return utils.iCP(
            client,
            interaction,
            '> **ID não especificado.**',
            1
          );

        if (!getId.find((id) => id.id == iID.value))
          return utils.iCP(
            client,
            interaction,
            '> **Interação não encontrada.**',
            1
          );

        client.api.applications(client.user.id).commands(iID.value).delete();
        utils.iCP(client, interaction, '> **Interação deletada.**', 1);
      }
    }
  });
  console.log('Interação config iniciada!'.blue);
};

module.exports.config = {
  displayName: 'Configure Interactions',
  dbName: 'ConfigI',
  loadDBFirst: true,
};
