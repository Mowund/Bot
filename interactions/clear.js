'use strict';

const { Permissions, MessageActionRow, MessageButton } = require('discord.js'),
  { botOwners } = require('../defaults');

module.exports = {
  data: [
    {
      name: 'clear',
      description: 'Deletes chat messages from the last 2 weeks.',
      options: [
        {
          name: 'count',
          description: 'How many messages to delete. (Range: 1 - 100)',
          type: 'INTEGER',
          min_value: 1,
          max_value: 100,
          required: true,
        },
        {
          name: 'ephemeral',
          description: 'Send reply as an ephemeral message. (Default: True)',
          type: 'BOOLEAN',
        },
      ],
    },
  ],
  async execute(client, interaction, st, embed) {
    const { options, channel, user, memberPermissions } = interaction,
      countO = options?.getInteger('count'),
      ephemeralO = options?.getBoolean('ephemeral') ?? true;
    // TODO: Create a confirmation menu
    // TODO: Delete user-specific messages
    // TODO: Let users delete their own messages without manage messages permission
    if (interaction.isCommand()) {
      await interaction.deferReply({ ephemeral: ephemeralO });

      const rows = !ephemeralO
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
          components: rows,
          embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.DM'))],
        });
      }

      if (!memberPermissions?.has(Permissions.FLAGS.MANAGE_MESSAGES) && !botOwners.includes(user.id)) {
        return interaction.editReply({
          components: rows,
          embeds: [embed({ type: 'error' }).setDescription(st.__('PERM.REQUIRES', st.__('PERM.MANAGE_MESSAGES')))],
        });
      }

      const q = (await channel.bulkDelete(countO, true)).size;
      return interaction.editReply({
        components: rows,
        embeds: [embed({ type: q > 0 ? 'success' : 'warning' }).setDescription(st.__mf('CLEAR.DELETED', { count: q }))],
      });
    }
  },
};
