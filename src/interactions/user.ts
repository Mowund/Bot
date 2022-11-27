import {
  UserFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  BaseInteraction,
  Colors,
  StringSelectMenuInteraction,
  StringSelectMenuBuilder,
} from 'discord.js';
import { Command, CommandArgs } from '../../lib/structures/Command.js';
import { UserData } from '../../lib/structures/UserData.js';
import { defaultLocale, emojis, flagEmojis, imgOpts } from '../defaults.js';
import { toUTS, collMap, monthDiff } from '../utils.js';

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
          {
            description: 'USER.OPTIONS.SETTINGS.DESCRIPTION',
            name: 'USER.OPTIONS.SETTINGS.NAME',
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
      },
    ]);
  }

  async run(args: CommandArgs, interaction: BaseInteraction<'cached'>): Promise<any> {
    const { client, embed, isEphemeral } = args,
      { database, i18n } = client,
      { guild, user } = interaction;
    let { localize, userSettings } = args;

    const settingsComponents = (data: UserData) => [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          data?.ephemeralResponses
            ? new ButtonBuilder()
                .setLabel(localize('GENERIC.EPHEMERAL'))
                .setEmoji('👁️')
                .setStyle(ButtonStyle.Success)
                .setCustomId('user_settings_ephemeral')
            : new ButtonBuilder()
                .setLabel(localize('GENERIC.NOT_EPHEMERAL'))
                .setEmoji('👁️')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('user_settings_ephemeral'),
          new ButtonBuilder()
            .setLabel(localize('USER.OPTIONS.SETTINGS.LOCALE.EDIT'))
            .setEmoji('📝')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('user_settings_locale'),
        ),
      ],
      settingsFields = (data: UserData) => [
        data?.ephemeralResponses
          ? {
              inline: true,
              name: `${emojis.check} ${localize('USER.OPTIONS.SETTINGS.EPHEMERAL_RESPONSES.NAME')}`,
              value: localize('USER.OPTIONS.SETTINGS.EPHEMERAL_RESPONSES.ENABLED'),
            }
          : {
              inline: true,
              name: `${emojis.no} ${localize('USER.OPTIONS.SETTINGS.EPHEMERAL_RESPONSES.NAME')}`,
              value: localize('USER.OPTIONS.SETTINGS.EPHEMERAL_RESPONSES.DISABLED'),
            },
        {
          inline: true,
          name: `${localize('GENERIC.LOCALE.EMOJI')} ${localize('USER.OPTIONS.SETTINGS.LOCALE.NAME')}`,
          value: localize('GENERIC.LOCALE.NAME'),
        },
      ];

    if (
      (interaction.isChatInputCommand() && interaction.options.getSubcommand() === 'info') ||
      interaction.isUserContextMenuCommand()
    ) {
      await interaction.deferReply({ ephemeral: isEphemeral });

      const { options } = interaction,
        userO = await (options.getUser('user') ?? user).fetch(),
        memberO = guild?.members.cache.get(userO.id),
        flags = userO.system
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

      for (const flag of userO.flags.toArray()) flags.push(flagEmojis[flag]);

      const embs = [
          embed({
            color: memberO?.displayColor || userO.accentColor || Colors.Blurple,
            title: localize('USER.OPTIONS.INFO.TITLE'),
          })
            .setAuthor({ iconURL: userO.displayAvatarURL(imgOpts), name: userO.tag })
            .setThumbnail((memberO ?? userO).displayAvatarURL(imgOpts))
            .setDescription(`${userO} ${flags.join(' ')}`)
            .addFields(
              { inline: true, name: `🪪 ${localize('GENERIC.ID')}`, value: `\`${userO.id}\`` },
              { inline: true, name: `📅 ${localize('GENERIC.CREATION_DATE')}`, value: toUTS(userO.createdTimestamp) },
            ),
        ],
        rows = [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel(localize('USER.OPTIONS.INFO.USER.AVATAR'))
              .setEmoji('🖼️')
              .setStyle(ButtonStyle.Link)
              .setURL(userO.displayAvatarURL(imgOpts)),
          ),
        ];

      if (memberO) {
        const mRoles = memberO.roles.cache.filter(({ id }) => id !== guild.id);
        embs[0].addFields({
          inline: true,
          name: `${emojis.serverJoin} ${localize('USER.OPTIONS.INFO.MEMBER.JOINED')}`,
          value: toUTS(memberO.joinedTimestamp),
        });
        if (mRoles.size) {
          embs[0].addFields({
            name: `${emojis.role} ${localize('GENERIC.ROLES.ROLES')} [${mRoles.size}]`,
            value: collMap(mRoles),
          });
        }
      }

      if (memberO?.avatar) {
        rows[0].addComponents(
          new ButtonBuilder()
            .setLabel(localize('USER.OPTIONS.INFO.MEMBER.AVATAR'))
            .setEmoji('🖼️')
            .setStyle(ButtonStyle.Link)
            .setURL(memberO.displayAvatarURL(imgOpts)),
        );
      }

      if (userO.banner) {
        const button = new ButtonBuilder()
          .setLabel(localize('USER.OPTIONS.INFO.USER.BANNER'))
          .setEmoji('🖼️')
          .setStyle(ButtonStyle.Link)
          .setURL(userO.bannerURL(imgOpts));

        embs[0]
          .addFields({ name: `🖼️ ${localize('USER.OPTIONS.INFO.USER.BANNER')}`, value: '\u200B' })
          .setImage(userO.bannerURL(imgOpts));
        rows[0].addComponents(button);
      }

      return interaction.editReply({ components: rows, embeds: embs });
    }

    if (interaction.isChatInputCommand()) {
      await interaction.deferReply({ ephemeral: isEphemeral });
      const { options } = interaction;

      switch (options.getSubcommand()) {
        case 'settings': {
          return interaction.editReply({
            components: settingsComponents(userSettings),
            embeds: [
              embed({ title: `⚙️ ${localize('USER.OPTIONS.SETTINGS.TITLE')}` }).addFields(settingsFields(userSettings)),
            ],
          });
        }
      }
    }

    if (interaction.isButton() || interaction.isStringSelectMenu()) {
      const { customId, message } = interaction;

      if (message.interaction.user.id !== user.id) {
        return interaction.reply({
          embeds: [embed({ type: 'error' }).setDescription(localize('ERROR.UNALLOWED.COMMAND'))],
          ephemeral: true,
        });
      }

      switch (customId) {
        case 'user_settings': {
          return interaction.update({
            components: settingsComponents(userSettings),
            embeds: [
              embed({ title: `⚙️ ${localize('USER.OPTIONS.SETTINGS.TITLE')}` }).addFields(settingsFields(userSettings)),
            ],
          });
        }
        case 'user_settings_ephemeral': {
          userSettings = await database.users.set(user.id, { ephemeralResponses: !isEphemeral });
          return interaction.update({
            components: settingsComponents(userSettings),
            embeds: [
              embed({ title: `⚙️ ${localize('USER.OPTIONS.SETTINGS.TITLE')}` }).addFields(settingsFields(userSettings)),
            ],
          });
        }
        case 'user_settings_locale_auto':
        case 'user_settings_locale_submit': {
          if (customId === 'user_settings_locale_auto') {
            userSettings = await database.users.set(user.id, {
              autoLocale: !userSettings.autoLocale,
              locale:
                (!userSettings.autoLocale && i18n.getLocales().includes(interaction.locale) && interaction.locale) ||
                userSettings.locale,
            });
          } else {
            userSettings = await database.users.set(user.id, {
              autoLocale: false,
              locale: (interaction as StringSelectMenuInteraction).values[0],
            });
          }
          localize = (phrase: string, replace?: Record<string, any>) =>
            client.localize({ locale: userSettings.locale, phrase }, replace);
        }
        // eslint-disable-next-line no-fallthrough
        case 'user_settings_locale': {
          console.log(localize('USER.OPTIONS.SETTINGS.LOCALE.SELECT_PLACEHOLDER'));
          const selectMenu = new StringSelectMenuBuilder()
            .setPlaceholder(localize('USER.OPTIONS.SETTINGS.LOCALE.SELECT_PLACEHOLDER'))
            .setCustomId('user_settings_locale_submit');

          selectMenu.addOptions(
            i18n
              .getLocales()
              .map((r: string) => ({
                default: r === userSettings.locale,
                description: (r === defaultLocale ? `(${localize('GENERIC.DEFAULT')}) ` : '') + r,
                emoji: client.localize({ locale: r, phrase: 'GENERIC.LOCALE.EMOJI' }),
                label: client.localize({ locale: r, phrase: 'GENERIC.LOCALE.NAME' }),
                value: r,
              }))
              .sort((a, b) => a.label.normalize().localeCompare(b.label.normalize())),
          );

          return interaction.update({
            components: [
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel(localize('GENERIC.BACK'))
                  .setEmoji('↩️')
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId('user_settings'),
                new ButtonBuilder()
                  .setLabel(userSettings.autoLocale ? localize('GENERIC.AUTOMATIC') : localize('GENERIC.NOT_AUTOMATIC'))
                  .setEmoji(emojis.integration)
                  .setStyle(userSettings.autoLocale ? ButtonStyle.Success : ButtonStyle.Secondary)
                  .setCustomId('user_settings_locale_auto'),
              ),
              new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu),
            ],
            embeds: [
              embed(
                customId === 'user_settings_locale_submit'
                  ? {
                      color: Colors.Green,
                      localizer: localize,
                      title: `⚙️ ${localize('USER.OPTIONS.SETTINGS.LOCALE.EDITED')}`,
                    }
                  : {
                      color: Colors.Yellow,
                      localizer: localize,
                      title: `⚙️ ${localize('USER.OPTIONS.SETTINGS.LOCALE.EDITING')}`,
                    },
              ).addFields(settingsFields(userSettings)),
            ],
          });
        }
      }
    }
  }
}
