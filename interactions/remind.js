import { ActionRow, ApplicationCommandOptionType, ButtonComponent, ButtonStyle } from 'discord.js';

// TODO
export const data = [
  {
    description: 'Remind related commands',
    name: 'remind',
    options: [
      {
        description: 'Creates a new reminder',
        name: 'create',
        options: [
          {
            description: "What you'll be reminded about",
            name: 'reminder',
            required: true,
            type: ApplicationCommandOptionType.String,
          },
          {
            description: "When you'll be reminded",
            name: 'time',
            required: true,
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            name: 'ephemeral',
            type: ApplicationCommandOptionType.Boolean,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
];
export async function execute({ interaction, st, embed, firebase }) {
  const { guild, user, options } = interaction,
    reminderO = options?.getString('reminder'),
    timeO = options?.getString('time'),
    ephemeralO = options?.getBoolean('ephemeral') ?? true;

  if (interaction.isChatInputCommand()) {
    if (options?.getSubcommand() === 'create') {
      await interaction.deferReply({ ephemeral: ephemeralO });
      const rows = [];
      if (!ephemeralO) {
        rows.push(
          new ActionRow().addComponents(
            new ButtonComponent()
              .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
              .setEmoji({ name: '🧹' })
              .setStyle(ButtonStyle.Danger)
              .setCustomId('generic_message_delete'),
          ),
        );
      }

      const time = Date.parse(timeO);
      console.log(time);
      if (!time) {
        return interaction.editReply({
          components: rows,
          embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.INVALID.TIME'))],
        });
      }

      const embs = [];

      return interaction.editReply({
        components: rows,
        embeds: embs,
      });
    }
  }
}
