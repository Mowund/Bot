import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle } from 'discord.js';
import { colors, imgOpts } from '../defaults.js';

export const data = [
  {
    description: 'Kills someone',
    description_localizations: { 'pt-BR': 'Mata alguém' },
    name: 'kill',
    name_localizations: { 'pt-BR': 'matar' },
    options: [
      {
        description: 'An user to kill',
        description_localizations: { 'pt-BR': 'Um usuário para matar' },
        name: 'user',
        name_localizations: { 'pt-BR': 'usuário' },
        type: ApplicationCommandOptionType.User,
      },
      {
        description: 'Send reply as an ephemeral message (Default: True)',
        description_localizations: { 'pt-BR': 'Envia a resposta como uma mensagem efêmera (Padrão: Verdadeiro)' },
        name: 'ephemeral',
        name_localizations: { 'pt-BR': 'efêmero' },
        type: ApplicationCommandOptionType.Boolean,
      },
    ],
  },
];
export function execute({ embed, interaction, st }) {
  const { member, options, user } = interaction,
    userO = options?.getUser('user') ?? user,
    memberO = options?.getMember('user') ?? member,
    ephemeralO = options?.getBoolean('ephemeral') ?? true;

  if (interaction.isChatInputCommand()) {
    return interaction.reply({
      components: !ephemeralO
        ? [
            new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                .setEmoji('🧹')
                .setStyle(ButtonStyle.Danger)
                .setCustomId('generic_message_delete'),
            ]),
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
