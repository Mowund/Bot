import { ActionRow, ApplicationCommandOptionType, ButtonComponent, ButtonStyle, MessageFlags } from 'discord.js';
export const data = [
  {
    description: 'Punish or unpunish a member (Bot owner only)',
    name: 'punish',
    options: [
      {
        description: 'Punishes a member (Bot owner only)',
        name: 'add',
        options: [
          {
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
            description: 'Punishment type',
            name: 'type',
            required: true,
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'Member that will be punished',
            name: 'user',
            required: true,
            type: ApplicationCommandOptionType.User,
          },
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            name: 'ephemeral',
            type: ApplicationCommandOptionType.Boolean,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        description: 'Unpunishes a member (Bot owner only)',
        name: 'remove',
        options: [
          {
            description: 'Member that will be unpunished',
            name: 'user',
            required: true,
            type: ApplicationCommandOptionType.User,
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
export const guildOnly = ['420007989261500418'];
export async function execute({ interaction, st, embed }) {
  const { customId, message, options } = interaction,
    ephemeralO = options?.getBoolean('ephemeral') ?? true,
    mdBtn = new ButtonComponent()
      .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
      .setEmoji({ name: '🧹' })
      .setStyle(ButtonStyle.Danger)
      .setCustomId('generic_message_delete');

  if (interaction.isChatInputCommand()) {
    await interaction.deferReply({ ephemeral: ephemeralO });
    if (!interaction.inGuild()) {
      return interaction.editReply({
        embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.DM'))],
        ephemeral: ephemeralO,
      });
    }

    if (['add', 'remove'].includes(options?.getSubcommand())) {
      const rows = [
        new ActionRow().addComponents(
          new ButtonComponent()
            .setLabel(st.__('GENERIC.WIP'))
            .setEmoji({ name: '🔨' })
            .setStyle(ButtonStyle.Danger)
            .setCustomId('punish_danger'),
        ),
      ];
      if (!ephemeralO) rows[0].addComponents(mdBtn);

      return interaction.editReply({
        components: rows,
        embeds: [embed({ type: 'wip' })],
        ephemeral: ephemeralO,
      });
    }
  } else if (interaction.isButton()) {
    switch (customId) {
      case 'punish_danger':
        return interaction.update({
          components: !message.flags.has(MessageFlags.Ephemeral) ? [new ActionRow().addComponents(mdBtn)] : [],
        });
    }
  }
}
