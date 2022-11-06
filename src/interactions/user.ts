import {
  UserFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  BaseInteraction,
  Colors,
} from 'discord.js';
import { Command, CommandArgs } from '../../lib/structures/Command.js';
import { UserData } from '../../lib/structures/UserData.js';
import { emojis, imgOpts } from '../defaults.js';
import { toUTS, userFlagToEmoji, collMap, monthDiff, disableComponents } from '../utils.js';

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
    const { client, embed } = args,
      { database, i18n } = client,
      { guild, user } = interaction;
    let settings = await database.users.fetch(user.id);
    const isEphemeral = settings?.ephemeralResponses ?? true,
      settingsComponents = (data: UserData) => [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          data?.ephemeralResponses
            ? new ButtonBuilder()
                .setLabel(i18n.__('GENERIC.EPHEMERAL'))
                .setEmoji('👁️')
                .setStyle(ButtonStyle.Success)
                .setCustomId('user_settings_ephemeral')
            : new ButtonBuilder()
                .setLabel(i18n.__('GENERIC.NOT_EPHEMERAL'))
                .setEmoji('👁️')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('user_settings_ephemeral'),
        ),
      ],
      settingsFields = (data: UserData) => [
        data?.ephemeralResponses
          ? {
              name: `${emojis.check} ${i18n.__('USER.OPTIONS.SETTINGS.EPHEMERAL_RESPONSES.NAME')}`,
              value: i18n.__('USER.OPTIONS.SETTINGS.EPHEMERAL_RESPONSES.ENABLED'),
            }
          : {
              name: `${emojis.no} ${i18n.__('USER.OPTIONS.SETTINGS.EPHEMERAL_RESPONSES.NAME')}`,
              value: i18n.__('USER.OPTIONS.SETTINGS.EPHEMERAL_RESPONSES.DISABLED'),
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
            name: `${emojis.role} ${i18n.__('GENERIC.ROLES.ROLES')} [${mRoles.size}]`,
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

      return interaction.editReply({ components: rows, embeds: embs });
    }

    if (interaction.isChatInputCommand()) {
      await interaction.deferReply({ ephemeral: isEphemeral });
      const { options } = interaction;

      switch (options.getSubcommand()) {
        case 'settings': {
          return interaction.editReply({
            components: settingsComponents(settings),
            embeds: [
              embed({ title: `⚙️ ${i18n.__('USER.OPTIONS.SETTINGS.TITLE')}` }).addFields(settingsFields(settings)),
            ],
          });
        }
      }
    }

    if (interaction.isButton()) {
      const { customId, message } = interaction;
      switch (customId) {
        case 'user_settings_ephemeral': {
          await interaction.deferUpdate();
          await interaction.editReply({ components: disableComponents(message.components) });
          settings = await database.users.set(user.id, { ephemeralResponses: !isEphemeral });
          return interaction.editReply({
            components: settingsComponents(settings),
            embeds: [
              embed({ title: `⚙️ ${i18n.__('USER.OPTIONS.SETTINGS.TITLE')}` }).addFields(settingsFields(settings)),
            ],
          });
        }
      }
    }
  }
}
