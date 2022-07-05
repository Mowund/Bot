import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
export const data = [
  {
    description: 'Punishes or unpunishes a member (Bot owner only)',
    description_localizations: {
      'pt-BR': 'Pune ou despune um membro (Apenas para o dono do bot)',
    },
    name: 'punish',
    name_localizations: {
      'pt-BR': 'punir',
    },
    options: [
      {
        description: 'Punishes a member (Bot owner only)',
        description_localizations: {
          'pt-BR': 'Pune um membro (Apenas para o dono do bot)',
        },
        name: 'add',
        name_localizations: { 'pt-BR': 'adicionar' },
        options: [
          {
            choices: [
              {
                name: 'Warn',
                name_localizations: { 'pt-BR': 'Avisar' },
                value: 'warn',
              },
              {
                name: 'Strike',
                name_localizations: {},
                value: 'strike',
              },
              {
                name: 'Ban',
                name_localizations: { 'pt-BR': 'Banir' },
                value: 'ban',
              },
            ],
            description: 'Punishment type',
            description_localizations: {
              'pt-BR': 'Tipo de punimento',
            },
            name: 'type',
            required: true,
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'Member that will be punished',
            description_localizations: {
              'pt-BR': 'O membro que será punido',
            },
            name: 'user',
            name_localizations: { 'pt-BR': 'usuário' },
            required: true,
            type: ApplicationCommandOptionType.User,
          },
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            description_localizations: {
              'pt-BR': 'Envia a resposta como uma mensagem efêmera (Padrão: Verdadeiro)',
            },
            name: 'ephemeral',
            name_localizations: { 'pt-BR': 'efêmero' },
            type: ApplicationCommandOptionType.Boolean,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        description: 'Unpunishes a member (Bot owner only)',
        description_localizations: {
          'pt-BR': 'Despune um membro (Apenas para o dono do bot)',
        },
        name: 'remove',
        name_localizations: { 'pt-BR': 'remover' },
        options: [
          {
            description: 'Member that will be unpunished',
            description_localizations: {
              'pt-BR': 'O membro que será despunido',
            },
            name: 'user',
            name_localizations: { 'pt-BR': 'usuário' },
            required: true,
            type: ApplicationCommandOptionType.User,
          },
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            description_localizations: {
              'pt-BR': 'Envia a resposta como uma mensagem efêmera (Padrão: Verdadeiro)',
            },
            name: 'ephemeral',
            name_localizations: { 'pt-BR': 'efêmero' },
            type: ApplicationCommandOptionType.Boolean,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
];
export const guildOnly = ['420007989261500418'];
export async function execute({ embed, interaction, st }) {
  const { customId, message, options } = interaction,
    ephemeralO = options?.getBoolean('ephemeral') ?? true,
    mdBtn = new ButtonBuilder()
      .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
      .setEmoji('🧹')
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
        new ActionRowBuilder().addComponents([
          new ButtonBuilder()
            .setLabel(st.__('GENERIC.WIP'))
            .setEmoji('🔨')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('punish_danger'),
        ]),
      ];
      if (!ephemeralO) rows[0].addComponents([mdBtn]);

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
          components: !message.flags.has(MessageFlags.Ephemeral) ? [new ActionRowBuilder().addComponents([mdBtn])] : [],
        });
    }
  }
}
