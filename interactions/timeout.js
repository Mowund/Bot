import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ApplicationCommandOptionType, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import parseDur from 'parse-duration';
import { msToTime } from '../utils.js';

export const data = [
  {
    default_member_permissions: '1099511627776',
    description: 'Timeouts a member',
    description_localizations: {
      'pt-BR': 'Dá timeout em um membro',
    },
    dm_permission: false,
    name: 'timeout',
    name_localizations: {},
    options: [
      {
        description: 'The member to timeout',
        description_localizations: {
          'pt-BR': 'O membro para dar timeout',
        },
        name: 'user',
        name_localizations: { 'pt-BR': 'usuário' },
        required: true,
        type: ApplicationCommandOptionType.User,
      },
      {
        description: 'How much time the timeout will last, up to 28 days (Default: 1 hour or disable)',
        description_localizations: {
          'pt-BR': 'Quanto tempo o timeout vai durar, até 28 dias (Padrão: 1 hora ou desativa)',
        },
        name: 'duration',
        name_localizations: { 'pt-BR': 'duração' },
        type: ApplicationCommandOptionType.String,
      },
      {
        description: 'The reason for timeouting',
        description_localizations: {
          'pt-BR': 'O motivo do timeout',
        },
        name: 'reason',
        name_localizations: { 'pt-BR': 'motivo' },
        type: ApplicationCommandOptionType.String,
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
  },
];

export async function execute({ embed, interaction, st }) {
  const { guild, member, memberPermissions, options, user } = interaction,
    memberO = options?.getMember('user'),
    durationO = options?.getString('duration'),
    reasonO = options?.getString('reason'),
    ephemeralO = options?.getBoolean('ephemeral');

  if (interaction.isChatInputCommand()) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.DM'))],
        ephemeral: true,
      });
    }

    if (!memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({
        embeds: [
          embed({ type: 'error' }).setDescription(
            st.__mf('ECHO.INSUFFICIENT.PERMS', { perm: st.__('PERM.MODERATE_MEMBERS') }),
          ),
        ],
        ephemeral: true,
      });
    }

    if (guild.ownerId === memberO.id) {
      return interaction.reply({
        embeds: [embed({ type: 'error' }).setDescription(st.__mf("Can't timeout the server owner"))],
        ephemeral: true,
      });
    }

    if (memberO.roles.highest.position >= guild.me.roles.highest.position) {
      return interaction.reply({
        embeds: [
          embed({ type: 'error' }).setDescription(
            st.__mf('The target has a role with a higher or same position as me'),
          ),
        ],
        ephemeral: true,
      });
    }

    if (memberO.roles.highest.position >= member.roles.highest.position) {
      return interaction.reply({
        embeds: [
          embed({ type: 'error' }).setDescription(
            st.__mf("You can't timeout who has a role with a higher or same position as you"),
          ),
        ],
        ephemeral: true,
      });
    }

    const rows = !ephemeralO
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

    if (!durationO && memberO.isCommunicationDisabled()) {
      await memberO.timeout(null, `${user.tag}${reasonO ? ` | ${reasonO}` : ''}`);

      return interaction.reply({
        components: rows,
        embeds: [embed({ type: 'success' }).setDescription(`Removed timeout from ${memberO}`)],
        ephemeral: ephemeralO,
      });
    }

    const msTime = durationO ? parseDur(durationO) : 3600000;

    if (!msTime || msTime > 2419200000) {
      return interaction.reply({
        embeds: [
          embed({ type: 'error' }).setDescription(
            st.__mf('ERROR.INVALID.TIME', {
              condition: msTime && 'greater',
              input: msToTime(msTime),
              time: st.__mf('GENERIC.TIME.DAYS', { count: 28 }),
            }),
          ),
        ],
        ephemeral: true,
      });
    }

    await memberO.timeout(msTime, `${user.tag} | Timeouted for ${msToTime(msTime)}${reasonO ? ` | ${reasonO}` : ''}`);

    return interaction.reply({
      components: rows,
      embeds: [embed({ type: 'success' }).setDescription(`${memberO} has been timed out for \`${msToTime(msTime)}\``)],
      ephemeral: ephemeralO,
    });
  }
}
