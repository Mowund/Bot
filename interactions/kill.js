import { ActionRow, ApplicationCommandOptionType, ButtonComponent, ButtonStyle } from 'discord.js';
import { colors, imgOpts } from '../defaults.js';

export const data = [
  {
    description: 'Kills someone',
    name: 'kill',
    options: [
      {
        description: 'An user to kill',
        name: 'user',
        type: ApplicationCommandOptionType.User,
      },
      {
        description: 'Send reply as an ephemeral message (Default: True)',
        name: 'ephemeral',
        type: ApplicationCommandOptionType.Boolean,
      },
    ],
  },
];
export function execute({ interaction, st, embed }) {
  const { user, member, options } = interaction,
    userO = options?.getUser('user') ?? user,
    memberO = options?.getMember('user') ?? member,
    ephemeralO = options?.getBoolean('ephemeral') ?? true;

  if (interaction.isChatInputCommand()) {
    return interaction.reply({
      components: !ephemeralO
        ? [
            new ActionRow().addComponents(
              new ButtonComponent()
                .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                .setEmoji({ name: '🧹' })
                .setStyle(ButtonStyle.Danger)
                .setCustomId('generic_message_delete'),
            ),
          ]
        : [],
      embeds: [
        embed()
          .setColor(colors.red)
          .setAuthor({
            iconURL: (memberO ?? userO).displayAvatarURL(imgOpts),
            name: memberO?.displayName ?? userO.username,
          })
          .setDescription(st.__('KILL.DIED')),
      ],
      ephemeral: ephemeralO,
    });
  }
}
