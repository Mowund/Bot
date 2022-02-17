import {
  SelectMenuComponent,
  ActionRow,
  Collection,
  ButtonComponent,
  ButtonStyle,
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js';
import { botOwners } from '../defaults.js';
import { collMap } from '../utils.js';

export const data = [
  {
    description: 'Manage a rolemenu',
    name: 'rolemenu',
    options: [
      {
        description: 'Create a rolemenu',
        name: 'create',
        options: [
          {
            channelTypes: [
              ChannelType.GuildText,
              ChannelType.GuildNews,
              ChannelType.GuildNewsThread,
              ChannelType.GuildPrivateThread,
              ChannelType.GuildPublicThread,
            ],
            description: 'The channel to create the rolemenu',
            name: 'channel',
            type: ApplicationCommandOptionType.Channel,
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
        description: 'Edit a rolemenu',
        name: 'edit',
        options: [
          {
            channelTypes: [
              ChannelType.GuildText,
              ChannelType.GuildNews,
              ChannelType.GuildNewsThread,
              ChannelType.GuildPrivateThread,
              ChannelType.GuildPublicThread,
            ],
            description: 'The channel to edit the rolemenu',
            name: 'channel',
            type: ApplicationCommandOptionType.Channel,
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
export async function execute({ client, interaction, st, embed }) {
  const { customId, guild, user, values, options } = interaction,
    channelO = options?.getChannel('channel') ?? interaction.channel,
    ephemeralO = options?.getBoolean('ephemeral') ?? true;

  if (interaction.isChatInputCommand()) {
    await interaction.deferReply({ ephemeral: ephemeralO });

    const respRows = !ephemeralO
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

    if (options?.getSubcommand() === 'create') {
      if (!channelO.permissionsFor(client.user).has(PermissionFlagsBits.SendMessages)) {
        return interaction.editReply({
          components: respRows,
          embeds: [embed({ type: 'error' }).setDescription("Can't send messages on this channel")],
        });
      }

      const menuRows = [
        new ActionRow().addComponents(
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
        ),
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
