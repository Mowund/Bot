import {
  SelectMenuComponent,
  ActionRowBuilder,
  Collection,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js';
import { botOwners } from '../defaults.js';
import { collMap } from '../utils.js';

export const data = [
  {
    default_member_permissions: '268435456',
    description: 'Manages a rolemenu',
    description_localizations: {
      'pt-BR': 'Gerencia um rolemenu',
    },
    name: 'rolemenu',
    name_localizations: {},
    options: [
      {
        description: 'Creates a rolemenu',
        description_localizations: {
          'pt-BR': 'Cria um rolemenu',
        },
        name: 'create',
        name_localizations: { 'pt-BR': 'criar' },
        options: [
          {
            channel_types: [
              ChannelType.GuildText,
              ChannelType.GuildNews,
              ChannelType.GuildNewsThread,
              ChannelType.GuildPublicThread,
              ChannelType.GuildPrivateThread,
            ],
            description: 'The channel to create the rolemenu',
            description_localizations: {
              'pt-BR': 'O canal para criar o rolemenu',
            },
            name: 'channel',
            name_localizations: { 'pt-BR': 'canal' },
            type: ApplicationCommandOptionType.Channel,
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
        description: 'Edits a rolemenu',
        description_localizations: {
          'pt-BR': 'Edita um rolemenu',
        },
        name: 'edit',
        name_localizations: { 'pt-BR': 'editar' },
        options: [
          {
            channel_types: [
              ChannelType.GuildText,
              ChannelType.GuildNews,
              ChannelType.GuildNewsThread,
              ChannelType.GuildPublicThread,
              ChannelType.GuildPrivateThread,
            ],
            description: 'The channel to edit the rolemenu',
            description_localizations: {
              'pt-BR': 'O canal para editar o rolemenu',
            },
            name: 'channel',
            name_localizations: { 'pt-BR': 'canal' },
            type: ApplicationCommandOptionType.Channel,
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
  const { client, customId, guild, options, user, values } = interaction,
    channelO = options?.getChannel('channel') ?? interaction.channel,
    ephemeralO = options?.getBoolean('ephemeral') ?? true;

  if (interaction.isChatInputCommand()) {
    await interaction.deferReply({ ephemeral: ephemeralO });

    const respRows = !ephemeralO
      ? [
          new ActionRowBuilder().addComponents([
            new ButtonBuilder()
              .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
              .setEmoji('🧹')
              .setStyle(ButtonStyle.Danger)
              .setCustomId('generic_message_delete'),
          ]),
        ]
      : [];

    if (!interaction.inGuild()) {
      return interaction.editReply({
        components: respRows,
        embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.DM'))],
      });
    }
    if (!botOwners.includes(user.id)) {
      return interaction.editReply({
        components: respRows,
        embeds: [embed({ type: 'wip' })],
      });
    }

    switch (options?.getSubcommand()) {
      case 'create': {
        if (!channelO.permissionsFor(client.user).has(PermissionFlagsBits.SendMessages)) {
          return interaction.editReply({
            components: respRows,
            embeds: [embed({ type: 'error' }).setDescription("Can't send messages on this channel")],
          });
        }

        const menuRows = [
          new ActionRowBuilder().addComponents([
            new SelectMenuComponent()
              .setCustomId('rolemenu_giverole')
              .setPlaceholder('Escolha um cargo')
              .setMinValues(0)
              .setMaxValues(2)
              .addOptions([
                {
                  description: 'Cargo de aniversariantes',
                  label: 'Aniversariantes',
                  name: '🎂',
                  value: '503219168007421971',
                },
                {
                  description: 'Cargo de mutados',
                  label: 'Mutados',
                  name: '⛔',
                  value: '531313330703433758',
                },
              ]),
          ]),
        ];

        await channelO.send({
          components: menuRows,
          embeds: [embed({ title: 'Escolha Algum Cargo' }).setDescription('🎂 Aniversariantes\n⛔ Mutados')],
        });

        return interaction.editReply({
          components: respRows,
          embeds: [embed().setDescription(`rolemenu criado em: ${channelO.toString()}`)],
        });
      }
    }
  } else if (interaction.isSelectMenu()) {
    switch (customId) {
      case 'rolemenu_giverole': {
        await interaction.deferReply({ ephemeral: true });
        let roles = new Collection();
        for (let rId of values) {
          rId = rId.split(' ').join('');
          const role = guild.roles.cache.filter(r => r.id === rId);

          if (!role) return interaction.reply(`Role ${rId} not found`);

          roles = roles.concat(role);
        }
        roles = collMap(roles);

        return interaction.editReply({
          embeds: [embed({ title: 'Cargos Selecionados' }).setDescription(roles)],
        });
      }
    }
  }
}
