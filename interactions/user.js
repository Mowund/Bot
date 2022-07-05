import {
  UserFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionType,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from 'discord.js';
import { emojis, colors, imgOpts } from '../defaults.js';
import { toUTS, userFlagToEmoji, collMap, monthDiff } from '../utils.js';

export const data = [
  {
    name: 'User Info',
    name_localizations: { 'pt-BR': 'Informações do Usuário' },
    type: ApplicationCommandType.User,
  },
  {
    description: 'User related commands',
    description_localizations: {
      'pt-BR': 'Comandos relacionados à usuários',
    },
    name: 'user',
    name_localizations: { 'pt-BR': 'usuário' },
    options: [
      {
        description: 'Gets information about a user',
        description_localizations: {
          'pt-BR': 'Obtém informações sobre um usuário',
        },
        name: 'info',
        name_localizations: { 'pt-BR': 'info' },
        options: [
          {
            description: 'The user to get information about',
            description_localizations: {
              'pt-BR': 'O usuário para obter informações sobre',
            },
            name: 'user',
            name_localizations: { 'pt-BR': 'usuário' },
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
export async function execute({ embed, interaction, st }) {
  const { commandName, guild, options, user } = interaction,
    userO = await (options?.getUser('user') ?? user).fetch(),
    memberO = guild?.members.cache.get(userO.id),
    ephemeralO = options?.getBoolean('ephemeral') ?? true,
    mdBtn = new ButtonBuilder()
      .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
      .setEmoji('🧹')
      .setStyle(ButtonStyle.Danger)
      .setCustomId('generic_message_delete');

  if (interaction.type === InteractionType.ApplicationCommand) {
    await interaction.deferReply({ ephemeral: ephemeralO });

    if (commandName === 'User Info' || options?.getSubcommand(true) === 'info') {
      const flags = userO.system
        ? [emojis.verifiedSystem]
        : userO.bot
        ? userO.flags.has(UserFlags.VerifiedBot)
          ? [emojis.verifiedBot]
          : [emojis.bot]
        : [];

      if (userO.id === guild?.ownerId) flags.push(emojis.serverOwner);
      if (memberO?.premiumSince) {
        const pMonths = monthDiff(memberO.premiumSince);

        flags.push(
          pMonths <= 1
            ? emojis.boosting1Month
            : pMonths === 2
            ? emojis.boosting2Months
            : pMonths >= 3 && pMonths < 6
            ? emojis.boosting3Months
            : pMonths >= 6 && pMonths < 12
            ? emojis.boosting6Months
            : pMonths >= 12 && pMonths < 15
            ? emojis.boosting12Months
            : pMonths >= 15 && pMonths < 18
            ? emojis.boosting15Months
            : emojis.boosting18Months,
        );
      }

      for (const flag of userO.flags.toArray()) flags.push(userFlagToEmoji(flag));

      const color = memberO?.displayColor || userO.accentColor || colors.blurple,
        embs = [
          embed({ title: st.__('USER.INFO.TITLE') })
            .setColor(color)
            .setAuthor({ iconURL: userO.displayAvatarURL(imgOpts), name: userO.tag })
            .setThumbnail((memberO ?? userO).displayAvatarURL(imgOpts))
            .setDescription(`${userO} ${flags.join(' ')}`)
            .addFields([
              { inline: true, name: `🏷️ ${st.__('GENERIC.ID')}`, value: `\`${userO.id}\`` },
              {
                inline: true,
                name: `📅 ${st.__('GENERIC.CREATION_DATE')}`,
                value: toUTS(userO.createdTimestamp),
              },
            ]),
        ],
        rows = [
          new ActionRowBuilder().addComponents([
            new ButtonBuilder()
              .setLabel(st.__('USER.INFO.USER.AVATAR'))
              .setEmoji('🖼️')
              .setStyle(ButtonStyle.Link)
              .setURL(userO.displayAvatarURL(imgOpts)),
          ]),
        ];

      if (memberO) {
        const mRoles = memberO.roles.cache.filter(({ id }) => id !== guild.id);
        embs[0].addFields([
          {
            inline: true,
            name: `${emojis.serverJoin} ${st.__('USER.INFO.MEMBER.JOINED')}`,
            value: toUTS(memberO.joinedTimestamp),
          },
        ]);
        if (mRoles.size) {
          embs[0].addFields([
            {
              name: `${emojis.role} ${st.__('GENERIC.ROLES')} [${mRoles.size}]`,
              value: collMap(mRoles),
            },
          ]);
        }
      }

      if (memberO?.avatar) {
        rows[0].addComponents([
          new ButtonBuilder()
            .setLabel(st.__('USER.INFO.MEMBER.AVATAR'))
            .setEmoji('🖼️')
            .setStyle(ButtonStyle.Link)
            .setURL(memberO.displayAvatarURL(imgOpts)),
        ]);
      }

      if (userO.banner) {
        const button = new ButtonBuilder()
          .setLabel(st.__('USER.INFO.USER.BANNER'))
          .setEmoji('🖼️')
          .setStyle(ButtonStyle.Link)
          .setURL(userO.bannerURL(imgOpts));

        embs[0]
          .addFields([{ name: `🖼️ ${st.__('USER.INFO.USER.BANNER')}`, value: '\u200B' }])
          .setImage(userO.bannerURL(imgOpts));
        rows[0].addComponents([button]);
      }

      if (memberO?.banner) {
        if (userO.banner) {
          embs[0].footer = null;
          embs[0].timestamp = null;
          embs.push(
            embed()
              .setColor(color)
              .addFields([{ name: `🖼️ ${st.__('USER.INFO.MEMBER.BANNER')}`, value: '\u200B' }])
              .setImage(memberO.bannerURL(imgOpts)),
          );
        } else {
          embs[0]
            .addFields([{ name: `🖼️ ${st.__('USER.INFO.MEMBER.BANNER')}`, value: '\u200B' }])
            .setImage(memberO.bannerURL(imgOpts));
        }

        rows[0].addComponents([
          new ButtonBuilder()
            .setLabel(st.__('USER.INFO.MEMBER.BANNER'))
            .setEmoji('🖼️')
            .setStyle(ButtonStyle.Link)
            .setURL(memberO.bannerURL(imgOpts)),
        ]);
      }

      if (!ephemeralO) {
        if (rows[0].components.length > 1) rows.push(new ActionRowBuilder().addComponents([mdBtn]));
        else rows[0].addComponents([mdBtn]);
      }

      return interaction.editReply({ components: rows, embeds: embs });
    }
  }
}
