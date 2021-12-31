'use strict';

const { MessageSelectMenu, Permissions, MessageActionRow, Collection, MessageButton } = require('discord.js'),
  { botOwners } = require('../defaults'),
  { collMap } = require('../utils');

module.exports = {
  data: [
    {
      name: 'rolemenu',
      description: 'Manage a rolemenu.',
      options: [
        {
          name: 'create',
          description: 'Create a rolemenu.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'channel',
              description: 'The channel to create the rolemenu.',
              type: 'CHANNEL',
            },
            {
              name: 'ephemeral',
              description: 'Send reply as an ephemeral message. (Default: True)',
              type: 'BOOLEAN',
            },
          ],
        },
        {
          name: 'edit',
          description: 'Edit a rolemenu.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'channel',
              description: 'The channel to edit the rolemenu.',
              type: 'CHANNEL',
              channel_types: [0, 5, 10, 11, 12],
            },
            {
              name: 'ephemeral',
              description: 'Send reply as an ephemeral message. (Default: True)',
              type: 'BOOLEAN',
            },
          ],
        },
      ],
    },
  ],
  guildOnly: ['420007989261500418'],
  async execute(client, interaction, st, emb) {
    const { guild, user, values, options } = interaction,
      channelO = options?.getChannel('channel') ?? interaction.channel,
      ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (interaction.isCommand()) {
      await interaction.deferReply({ ephemeral: ephemeralO });

      const respRows = !ephemeralO
        ? [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                .setEmoji('🧹')
                .setStyle('DANGER')
                .setCustomId('generic_message_delete'),
            ),
          ]
        : [];

      if (!interaction.inGuild()) {
        return interaction.editReply({
          components: respRows,
          embeds: [emb({ type: 'error' }).setDescription(st.__('ERROR.DM'))],
        });
      }
      if (!botOwners.includes(user.id)) {
        return interaction.editReply({
          components: respRows,
          embeds: [emb({ type: 'wip' })],
        });
      }

      if (options?.getSubcommand() === 'create') {
        if (!channelO.isText()) {
          return interaction.editReply({
            components: respRows,
            embeds: [emb({ type: 'error' }).setDescription('Not a text based channel.')],
          });
        }
        if (!channelO.permissionsFor(client.user).has(Permissions.FLAGS.SEND_MESSAGES)) {
          return interaction.editReply({
            components: respRows,
            embeds: [emb({ type: 'error' }).setDescription("Can't send messages on this channel.")],
          });
        }

        const menuRows = [
          new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setCustomId('rolemenu_giverole')
              .setPlaceholder('Escolha um cargo')
              .setMinValues(1)
              .setMaxValues(2)
              .addOptions([
                {
                  label: 'Aniversariantes',
                  description: 'Cargo de aniversariantes',
                  emoji: '🎂',
                  value: '503219168007421971',
                },
                {
                  label: 'Mutados',
                  description: 'Cargo de mutados',
                  emoji: '⛔',
                  value: '531313330703433758',
                },
              ]),
          ),
        ];

        await channelO.send({
          embeds: [emb({ title: 'Escolha Algum Cargo' }).setDescription('🎂 Aniversariantes\n⛔ Mutados')],
          components: menuRows,
        });

        return interaction.editReply({
          components: respRows,
          embeds: [emb().setDescription(`rolemenu criado em: ${channelO.toString()}`)],
        });
      }
    }
    if (interaction.isSelectMenu()) {
      if (interaction.customId === 'rolemenu_giverole') {
        await interaction.deferReply({ ephemeral: true });
        let roles = new Collection();
        for (let rID of values) {
          rID = rID.split(' ').join('');
          const role = guild.roles.cache.filter(r => r.id === rID);

          if (!role) return interaction.reply(`Role ${rID} not found`);
          roles = roles.concat(role);
        }
        roles = collMap(roles);

        return interaction.editReply({
          embeds: [emb({ title: 'Cargos Selecionados' }).setDescription(roles)],
        });
      }
    }
  },
};
