import {
  UserFlags,
  ActionRow,
  ButtonComponent,
  ButtonStyle,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  PermissionFlagsBits,
} from 'discord.js';
import { emojis, colors, imgOpts } from '../defaults.js';
import { toUTS, userFlagToEmoji, collMap, monthDiff } from '../utils.js';

export const data = [
  {
    name: 'User Info',
    type: ApplicationCommandType.User,
  },
  {
    description: 'User related commands',
    name: 'user',
    options: [
      {
        description: 'Get information about a user',
        name: 'info',
        options: [
          {
            description: 'The user to get information from',
            name: 'user',
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
export async function execute({ interaction, st, embed }) {
  const { channel, commandName, guild, user, options } = interaction,
    userO = await (options?.getUser('user') ?? user).fetch(),
    memberO = guild?.members.cache.get(userO.id),
    ephemeralO = options?.getBoolean('ephemeral') ?? true;

  if (interaction.isCommand()) {
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
            .addField({ inline: true, name: `💻 ${st.__('GENERIC.ID')}`, value: `\`${userO.id}\`` })
            .addField({
              inline: true,
              name: `📅 ${st.__('GENERIC.CREATION_DATE')}`,
              value: toUTS(userO.createdTimestamp),
            }),
        ],
        rows = [
          new ActionRow().addComponents(
            new ButtonComponent()
              .setLabel(st.__('USER.INFO.USER.AVATAR'))
              .setEmoji({ name: '🖼️' })
              .setStyle(ButtonStyle.Link)
              .setURL(userO.displayAvatarURL(imgOpts)),
          ),
        ];

      if (memberO) {
        const mRoles = memberO.roles.cache.filter(({ id }) => id !== guild.id);
        embs[0].addField({
          inline: true,
          name: `${emojis.serverJoin} ${st.__('USER.INFO.MEMBER.JOINED')}`,
          value: toUTS(memberO.joinedTimestamp),
        });
        if (mRoles.size > 0) {
          embs[0].addField({
            name: `${emojis.role} ${st.__('GENERIC.ROLES')} [${mRoles.size}]`,
            value: collMap(mRoles),
          });
        }
      }

      if (memberO?.avatar) {
        rows[0].addComponents(
          new ButtonComponent()
            .setLabel(st.__('USER.INFO.MEMBER.AVATAR'))
            .setEmoji({ name: '🖼️' })
            .setStyle(ButtonStyle.Link)
            .setURL(memberO.displayAvatarURL(imgOpts)),
        );
      }

      if (userO.banner) {
        const button = new ButtonComponent()
          .setLabel(st.__('USER.INFO.USER.BANNER'))
          .setEmoji({ name: '🖼️' })
          .setStyle(ButtonStyle.Link)
          .setURL(userO.bannerURL(imgOpts));

        embs[0]
          .addField({ name: `🖼️ ${st.__('USER.INFO.USER.BANNER')}`, value: '_ _' })
          .setImage(userO.bannerURL(imgOpts));
        rows[0].addComponents(button);
      }

      if (memberO?.banner) {
        if (userO.banner) {
          embs[0].footer = null;
          embs[0].timestamp = null;
          embs.push(
            embed()
              .setColor(color)
              .addField({ name: `🖼️ ${st.__('USER.INFO.MEMBER.BANNER')}`, value: '_ _' })
              .setImage(memberO.bannerURL(imgOpts)),
          );
        } else {
          embs[0]
            .addField({ name: `🖼️ ${st.__('USER.INFO.MEMBER.BANNER')}`, value: '_ _' })
            .setImage(memberO.bannerURL(imgOpts));
        }

        rows[0].addComponents(
          new ButtonComponent()
            .setLabel(st.__('USER.INFO.MEMBER.BANNER'))
            .setEmoji({ name: '🖼️' })
            .setStyle(ButtonStyle.Link)
            .setURL(memberO.bannerURL(imgOpts)),
        );
      }

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

      await interaction.editReply({ components: rows, embeds: embs });

      if (
        interaction.inGuild() &&
        !channel.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.UseExternalEmojis, false)
      ) {
        return interaction.followUp({
          embeds: [
            embed({ type: 'warning' }).setDescription(
              st.__mf('PERM.ROLE_REQUIRES', { perm: st.__('PERM.USE_EXTERNAL_EMOJIS'), role: '@everyone' }),
            ),
          ],
          ephemeral: true,
        });
      }
    }
  }
}
