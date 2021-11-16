'use strict';

const { Permissions } = require('discord.js'),
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
          description: 'Send reply as an ephemeral message. Defaults to true.',
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
      if (!interaction.inGuild()) {
        return interaction.editReply({
          embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.DM'))],
          ephemeral: true,
        });
      }

      if (!memberPermissions.has(Permissions.FLAGS.MANAGE_MESSAGES) && !botOwners.includes(user.id)) {
        return interaction.editReply({
          embeds: [embed({ type: 'error' }).setDescription(st.__('PERM.REQUIRES', st.__('PERM.MANAGE_MESSAGES')))],
        });
      }

      const q = (await channel.bulkDelete(countO, true)).size;
      return interaction.editReply({
        embeds: [embed({ type: q > 0 ? 'success' : 'warning' }).setDescription(st.__mf('CLEAR.DELETED', { count: q }))],
        ephemeral: ephemeralO,
      });
    }
  },
};
