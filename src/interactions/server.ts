import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  BaseInteraction,
  ButtonInteraction,
  Colors,
  RoleSelectMenuBuilder,
  RoleSelectMenuInteraction,
  ColorResolvable,
  ChannelSelectMenuInteraction,
  ChannelSelectMenuBuilder,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js';
import { Command, CommandArgs } from '../../lib/structures/Command.js';
import { GuildData } from '../../lib/structures/GuildData.js';
import { imgOpts } from '../defaults.js';
import { toUTS } from '../utils.js';

// TODO
export default class Server extends Command {
  constructor() {
    super([
      {
        description: 'SERVER.DESCRIPTION',
        dmPermission: false,
        name: 'SERVER.NAME',
        options: [
          {
            description: 'SERVER.OPTIONS.INFO.DESCRIPTION',
            name: 'SERVER.OPTIONS.INFO.NAME',
            type: ApplicationCommandOptionType.Subcommand,
          },
          {
            description: 'SERVER.OPTIONS.SETTINGS.DESCRIPTION',
            name: 'SERVER.OPTIONS.SETTINGS.NAME',
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
      },
    ]);
  }

  async run(args: CommandArgs, interaction: BaseInteraction<'cached'>): Promise<any> {
    let { guildSettings } = args;
    const { embed, isEphemeral } = args,
      { guild, guildId, memberPermissions, user } = interaction,
      { client, localize } = args,
      { database } = client,
      settingsComponents = () => [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel(localize('SERVER.OPTIONS.SETTINGS.ALLOW_NON_EPHEMERAL.EDIT'))
            .setEmoji('📝')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!memberPermissions.has(PermissionFlagsBits.ManageGuild))
            .setCustomId('server_settings_ephemeral_edit'),
        ),
      ],
      settingsFields = (data: GuildData) => {
        const channelIds =
            data?.allowNonEphemeral?.channelIds
              ?.sort((a, b) => +a - +b)
              .map(cI => `<#${cI}>`)
              .reverse() ?? [],
          roleIds =
            data?.allowNonEphemeral?.roleIds
              ?.sort((a, b) => +a - +b)
              .map(cI => `<#${cI}>`)
              .reverse() ?? [];

        return [
          {
            inline: true,
            name: `👁️ ${localize('SERVER.OPTIONS.SETTINGS.ALLOW_NON_EPHEMERAL.NAME')}`,
            value: `**${localize('GENERIC.CHANNELS.CHANNELS')}:** ${
              channelIds.length ? channelIds : localize('GENERIC.NONE')
            }\n**${localize('GENERIC.ROLES.ROLES')}:** ${roleIds.length ? roleIds : localize('GENERIC.NONE')}`,
          },
        ];
      };

    if (interaction.isChatInputCommand()) {
      await interaction.deferReply({ ephemeral: isEphemeral });
      const { options } = interaction;

      switch (options.getSubcommand()) {
        case 'info': {
          const embs = [
            embed({ title: localize('SERVER.OPTIONS.INFO.TITLE') })
              .setThumbnail(guild.iconURL(imgOpts))
              .addFields(
                { inline: true, name: `🪪 ${localize('GENERIC.ID')}`, value: `\`${guild.id}\`` },
                { inline: true, name: `📅 ${localize('GENERIC.CREATION_DATE')}`, value: toUTS(guild.createdTimestamp) },
              ),
          ];

          return interaction.editReply({ embeds: embs });
        }
        case 'settings': {
          return interaction.editReply({
            components: memberPermissions.has(PermissionFlagsBits.ManageGuild) ? settingsComponents() : [],
            embeds: [
              embed({ title: `⚙️ ${localize('SERVER.OPTIONS.SETTINGS.TITLE')}` }).addFields(
                settingsFields(guildSettings),
              ),
            ],
          });
        }
      }
    }

    if (interaction.isButton() || interaction.isChannelSelectMenu() || interaction.isRoleSelectMenu()) {
      const { message } = interaction,
        { customId } = interaction;

      if (message.interaction.user.id !== user.id) {
        return interaction.reply({
          embeds: [embed({ type: 'error' }).setDescription(localize('ERROR.UNALLOWED.COMMAND'))],
          ephemeral: true,
        });
      }

      if (!memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
        await interaction.update({
          components: settingsComponents(),
          embeds: [
            embed({ title: `⚙️ ${localize('SERVER.OPTIONS.SETTINGS.TITLE')}` }).addFields(
              settingsFields(guildSettings),
            ),
          ],
        });
        return interaction.followUp({
          embeds: [
            embed({ type: 'error' }).setDescription(
              localize('PERM.NO_LONGER', { perm: localize('PERM.MANAGE_GUILD') }),
            ),
          ],
          ephemeral: true,
        });
      }

      switch (customId) {
        case 'server_settings': {
          return interaction.update({
            components: settingsComponents(),
            embeds: [
              embed({ title: `⚙️ ${localize('SERVER.OPTIONS.SETTINGS.TITLE')}` }).addFields(
                settingsFields(guildSettings),
              ),
            ],
          });
        }
        case 'server_settings_ephemeral_edit':
        case 'server_settings_ephemeral_add':
        case 'server_settings_ephemeral_remove':
        case 'server_settings_ephemeral_channels_add_submit':
        case 'server_settings_ephemeral_channels_remove_submit':
        case 'server_settings_ephemeral_channels_reset':
        case 'server_settings_ephemeral_roles_add_submit':
        case 'server_settings_ephemeral_roles_remove_submit':
        case 'server_settings_ephemeral_roles_reset': {
          const isEdit = customId === 'server_settings_ephemeral_edit',
            isRemove =
              !customId.includes('add') &&
              (message.components.at(-1).components.at(-1).customId.endsWith('remove_submit') ||
                customId.includes('remove')),
            isChannel = customId.includes('channels');

          let color: ColorResolvable,
            count: number,
            title: string,
            channelIds = guildSettings?.allowNonEphemeral?.channelIds || [],
            roleIds = guildSettings?.allowNonEphemeral?.roleIds || [];

          if (customId.endsWith('_submit')) {
            const { values } = interaction as
                | RoleSelectMenuInteraction<'cached'>
                | ChannelSelectMenuInteraction<'cached'>,
              oldChannelIds = channelIds,
              oldRoleIds = roleIds;

            if (isRemove) {
              if (isChannel) {
                channelIds = channelIds.filter(r => !values.includes(r));
                guildSettings = await database.guilds.set(guildId, {
                  allowNonEphemeral: {
                    channelIds,
                    roleIds,
                  },
                });
                count = oldChannelIds.length - channelIds.length;
                title = count
                  ? localize('GENERIC.CHANNELS.REMOVING', { count })
                  : localize('GENERIC.CHANNELS_AND_ROLES.REMOVING');
              } else {
                roleIds = roleIds.filter(r => !values.includes(r));
                guildSettings = await database.guilds.set(guildId, {
                  allowNonEphemeral: {
                    channelIds,
                    roleIds,
                  },
                });
                count = oldRoleIds.length - roleIds.length;
                title = count
                  ? localize('GENERIC.ROLES.REMOVING', { count })
                  : localize('GENERIC.CHANNELS_AND_ROLES.REMOVING');
              }

              color = Colors.Red;
            } else {
              if (isChannel) {
                channelIds = channelIds.filter(r => !values.includes(r));
                values.forEach(v => channelIds.push(v));

                guildSettings = await database.guilds.set(guildId, {
                  allowNonEphemeral: {
                    channelIds,
                    roleIds,
                  },
                });
                count = channelIds.length - oldChannelIds.length;
                title = count
                  ? localize('GENERIC.CHANNELS.ADDING', { count })
                  : localize('GENERIC.CHANNELS_AND_ROLES.ADDING');
              } else {
                roleIds = roleIds.filter(r => !values.includes(r));
                values.forEach(v => roleIds.push(v));

                guildSettings = await database.guilds.set(guildId, {
                  allowNonEphemeral: {
                    channelIds,
                    roleIds,
                  },
                });
                count = roleIds.length - oldRoleIds.length;
                title = count
                  ? localize('GENERIC.ROLES.ADDING', { count })
                  : localize('GENERIC.CHANNELS_AND_ROLES.ADDING');
              }
              color = Colors.Green;
            }
          } else if (customId.endsWith('_reset')) {
            if (isChannel) channelIds = [];
            else roleIds = [];
            guildSettings = await database.guilds.set(guildId, {
              allowNonEphemeral: { channelIds, roleIds },
            });
            title = localize(`GENERIC.${isChannel ? 'CHANNELS' : 'ROLES'}.RESET`);
            color = Colors.Red;
          } else if (isEdit) {
            title = localize('GENERIC.CHANNELS_AND_ROLES.EDITING');
            color = Colors.Orange;
          } else if (isRemove) {
            title = localize('GENERIC.CHANNELS_AND_ROLES.REMOVING');
            color = Colors.Red;
          } else {
            title = localize('GENERIC.CHANNELS_AND_ROLES.ADDING');
            color = Colors.Green;
          }

          return (interaction as ButtonInteraction | RoleSelectMenuInteraction).update({
            components: [
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel(localize('GENERIC.BACK'))
                  .setEmoji('↩️')
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId('server_settings'),
              ),
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel(localize('GENERIC.CHANNELS.RESET'))
                  .setEmoji('🔄')
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId('server_settings_ephemeral_channels_reset')
                  .setDisabled(!channelIds.length),
                new ButtonBuilder()
                  .setLabel(localize('GENERIC.ROLES.RESET'))
                  .setEmoji('🔄')
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId('server_settings_ephemeral_roles_reset')
                  .setDisabled(!roleIds.length),
              ),
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel(localize('GENERIC.ADD'))
                  .setEmoji('➕')
                  .setStyle(ButtonStyle.Success)
                  .setCustomId('server_settings_ephemeral_add')
                  .setDisabled(!isEdit && !isRemove),
                new ButtonBuilder()
                  .setLabel(localize('GENERIC.REMOVE'))
                  .setEmoji('➖')
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId('server_settings_ephemeral_remove')
                  .setDisabled((!isEdit && isRemove) || (!channelIds.length && !roleIds.length)),
              ),
              new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
                new ChannelSelectMenuBuilder()
                  .setPlaceholder(
                    localize(
                      isEdit
                        ? 'GENERIC.CHANNELS.SELECT.DEFAULT'
                        : isRemove
                        ? 'GENERIC.CHANNELS.SELECT.REMOVE'
                        : 'GENERIC.CHANNELS.SELECT.ADD',
                    ),
                  )
                  .setChannelTypes(
                    ChannelType.AnnouncementThread,
                    ChannelType.GuildAnnouncement,
                    ChannelType.GuildText,
                    ChannelType.GuildVoice,
                    ChannelType.PrivateThread,
                    ChannelType.PublicThread,
                  )
                  .setMinValues(1)
                  .setMaxValues(25)
                  .setCustomId(
                    isRemove
                      ? 'server_settings_ephemeral_channels_remove_submit'
                      : 'server_settings_ephemeral_channels_add_submit',
                  )
                  .setDisabled(isEdit || (isRemove && !channelIds.length)),
              ),
              new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
                new RoleSelectMenuBuilder()
                  .setPlaceholder(
                    localize(
                      isEdit
                        ? 'GENERIC.ROLES.SELECT.DEFAULT'
                        : isRemove
                        ? 'GENERIC.ROLES.SELECT.REMOVE'
                        : 'GENERIC.ROLES.SELECT.ADD',
                    ),
                  )
                  .setMinValues(1)
                  .setMaxValues(25)
                  .setCustomId(
                    isRemove
                      ? 'server_settings_ephemeral_roles_remove_submit'
                      : 'server_settings_ephemeral_roles_add_submit',
                  )
                  .setDisabled(isEdit || (isRemove && !roleIds.length)),
              ),
            ],
            embeds: [embed({ color, title }).addFields(settingsFields(guildSettings))],
          });
        }
      }
    }
  }
}
