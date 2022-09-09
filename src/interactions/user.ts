import {
  UserFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  BaseInteraction,
  CommandInteractionOptionResolver,
  Colors,
} from 'discord.js';
import { Command, CommandArgs } from '../../lib/util/Command.js';
import { emojis, imgOpts } from '../defaults.js';
import { toUTS, userFlagToEmoji, collMap, monthDiff } from '../utils.js';

export default class User extends Command {
  constructor() {
    super([
      {
        name: 'USER.OPTIONS.INFO.VIEW_INFO',
        type: ApplicationCommandType.User,
      },
      {
        description: 'USER.DESCRIPTION',
        name: 'USER.NAME',
        options: [
          {
            description: 'USER.OPTIONS.INFO.DESCRIPTION',
            name: 'USER.OPTIONS.INFO.NAME',
            options: [
              {
                description: 'USER.OPTIONS.INFO.OPTIONS.USER.DESCRIPTION',
                name: 'USER.OPTIONS.INFO.OPTIONS.USER.NAME',
                type: ApplicationCommandOptionType.User,
              },
            ],
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
      },
    ]);
  }

  async run(args: CommandArgs, interaction: BaseInteraction<'cached'>): Promise<any> {
    const { client, embed } = args,
      { i18n } = client,
      { guild, user } = interaction;

    if (interaction.isCommand()) {
      const { options } = interaction,
        userO = await (options?.getUser('user') ?? user).fetch(),
        memberO = guild?.members.cache.get(userO.id),
        ephemeralO = (options as CommandInteractionOptionResolver)?.getBoolean('ephemeral') ?? true;

      await interaction.deferReply({ ephemeral: ephemeralO });

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

      const color = memberO?.displayColor || userO.accentColor || Colors.Blurple,
        embs = [
          embed({ title: i18n.__('USER.OPTIONS.INFO.TITLE') })
            .setColor(color)
            .setAuthor({ iconURL: userO.displayAvatarURL(imgOpts), name: userO.tag })
            .setThumbnail((memberO ?? userO).displayAvatarURL(imgOpts))
            .setDescription(`${userO} ${flags.join(' ')}`)
            .addFields(
              { inline: true, name: `🪪 ${i18n.__('GENERIC.ID')}`, value: `\`${userO.id}\`` },
              { inline: true, name: `📅 ${i18n.__('GENERIC.CREATION_DATE')}`, value: toUTS(userO.createdTimestamp) },
            ),
        ],
        rows = [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel(i18n.__('USER.OPTIONS.INFO.USER.AVATAR'))
              .setEmoji('🖼️')
              .setStyle(ButtonStyle.Link)
              .setURL(userO.displayAvatarURL(imgOpts)),
          ),
        ];

      if (memberO) {
        const mRoles = memberO.roles.cache.filter(({ id }) => id !== guild.id);
        embs[0].addFields({
          inline: true,
          name: `${emojis.serverJoin} ${i18n.__('USER.OPTIONS.INFO.MEMBER.JOINED')}`,
          value: toUTS(memberO.joinedTimestamp),
        });
        if (mRoles.size) {
          embs[0].addFields({
            name: `${emojis.role} ${i18n.__('GENERIC.ROLES')} [${mRoles.size}]`,
            value: collMap(mRoles),
          });
        }
      }

      if (memberO?.avatar) {
        rows[0].addComponents(
          new ButtonBuilder()
            .setLabel(i18n.__('USER.OPTIONS.INFO.MEMBER.AVATAR'))
            .setEmoji('🖼️')
            .setStyle(ButtonStyle.Link)
            .setURL(memberO.displayAvatarURL(imgOpts)),
        );
      }

      if (userO.banner) {
        const button = new ButtonBuilder()
          .setLabel(i18n.__('USER.OPTIONS.INFO.USER.BANNER'))
          .setEmoji('🖼️')
          .setStyle(ButtonStyle.Link)
          .setURL(userO.bannerURL(imgOpts));

        embs[0]
          .addFields({ name: `🖼️ ${i18n.__('USER.OPTIONS.INFO.USER.BANNER')}`, value: '\u200B' })
          .setImage(userO.bannerURL(imgOpts));
        rows[0].addComponents(button);
      }

      /* if (memberO?.banner) {
          if (userO.banner) {
            embs[0].footer = null;
            embs[0].timestamp = null;
            embs.push(
              embed()
                .setColor(color)
                .addFields({ name: `🖼️ ${i18n.__('USER.OPTIONS.INFO.MEMBER.BANNER')}`, value: '\u200B' })
                .setImage(memberO.bannerURL(imgOpts)),
            );
          } else {
            embs[0]
              .addFields({ name: `🖼️ ${i18n.__('USER.OPTIONS.INFO.MEMBER.BANNER')}`, value: '\u200B' })
              .setImage(memberO.bannerURL(imgOpts));
          }

          rows[0].addComponents(
            new ButtonBuilder()
              .setLabel(i18n.__('USER.OPTIONS.INFO.MEMBER.BANNER'))
              .setEmoji('🖼️')
              .setStyle(ButtonStyle.Link)
              .setURL(memberO.bannerURL(imgOpts)),
          );
        }*/

      return interaction.editReply({ components: rows, embeds: embs });
    }
  }
}
