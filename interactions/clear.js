import { ActionRow, ApplicationCommandOptionType, ButtonComponent, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { botOwners } from '../defaults.js';

export const data = [
  {
    description: 'Deletes chat messages from the last 2 weeks',
    name: 'clear',
    options: [
      {
        description: 'How many messages to delete (Range: 1 - 100)',
        max_value: 100,
        min_value: 1,
        name: 'count',
        required: true,
        type: ApplicationCommandOptionType.Integer,
      },
      {
        description: 'Send reply as an ephemeral message (Default: True)',
        name: 'ephemeral',
        type: ApplicationCommandOptionType.Boolean,
      },
    ],
  },
];
export async function execute({ interaction, st, embed }) {
  const { options, channel, user, memberPermissions } = interaction,
    countO = options?.getInteger('count'),
    ephemeralO = options?.getBoolean('ephemeral') ?? true;

  // TODO: Create a confirmation menu
  // TODO: Delete user-specific messages
  // TODO: Let users delete their own messages without manage messages permission
  if (interaction.isChatInputCommand()) {
    await interaction.deferReply({ ephemeral: ephemeralO });

    const rows = !ephemeralO
      ? [
          new ActionRow().addComponents(
            new ButtonComponent()
              .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
              .setEmoji({ name: '🧹' })
              .setStyle(ButtonStyle.Danger)
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

    if (!memberPermissions?.has(PermissionFlagsBits.ManageMessages) && !botOwners.includes(user.id)) {
      return interaction.editReply({
        components: rows,
        embeds: [
          embed({ type: 'error' }).setDescription(st.__mf('PERM.REQUIRES', { perm: st.__('PERM.MANAGE_MESSAGES') })),
        ],
      });
    }

    const q = (await channel.bulkDelete(countO, true)).size;
    return interaction.editReply({
      components: rows,
      embeds: [embed({ type: q > 0 ? 'success' : 'warning' }).setDescription(st.__mf('CLEAR.DELETED', { count: q }))],
    });
  }
}
