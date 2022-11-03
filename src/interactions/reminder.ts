import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  StringSelectMenuBuilder,
  SnowflakeUtil,
  TimestampStyles,
  StringSelectMenuInteraction,
  ChannelSelectMenuBuilder,
  ChannelSelectMenuInteraction,
  ChannelType,
  ButtonInteraction,
  ModalBuilder,
  ModalMessageModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import parseDur from 'parse-duration';
import { Command, CommandArgs } from '../../lib/structures/Command.js';
import { emojis } from '../defaults.js';
import { disableComponents, getFieldValue, msToTime, toUTS, truncate } from '../utils.js';

export default class Reminder extends Command {
  constructor() {
    super([
      {
        description: 'REMINDER.DESCRIPTION',
        name: 'REMINDER.NAME',
        options: [
          {
            description: 'REMINDER.OPTIONS.CREATE.DESCRIPTION',
            name: 'REMINDER.OPTIONS.CREATE.NAME',
            options: [
              {
                description: 'REMINDER.OPTIONS.CREATE.OPTIONS.CONTENT.DESCRIPTION',
                max_length: 1024,
                name: 'REMINDER.OPTIONS.CREATE.OPTIONS.CONTENT.NAME',
                required: true,
                type: ApplicationCommandOptionType.String,
              },
              {
                autocomplete: true,
                description: 'REMINDER.OPTIONS.CREATE.OPTIONS.TIME.DESCRIPTION',
                name: 'REMINDER.OPTIONS.CREATE.OPTIONS.TIME.NAME',
                required: true,
                type: ApplicationCommandOptionType.String,
              },
            ],
            type: ApplicationCommandOptionType.Subcommand,
          },
          {
            description: 'REMINDER.OPTIONS.LIST.DESCRIPTION',
            name: 'REMINDER.OPTIONS.LIST.NAME',
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
      },
    ]);
  }

  async run(args: CommandArgs, interaction: BaseInteraction<'cached'>): Promise<any> {
    const { client, embed } = args,
      { i18n } = client,
      { channel, user } = interaction,
      minTime = 1000 * 60 * 3,
      maxTime = 1000 * 60 * 60 * 24 * 365.25 * 100,
      minRecursiveTime = minTime * 10,
      rows = [];

    if (interaction.isAutocomplete()) {
      const focused = interaction.options.getFocused(),
        msTime = parseDur(focused);

      return interaction.respond([
        {
          name:
            !msTime || msTime < minTime || msTime > maxTime
              ? i18n.__mf('ERROR.INVALID.TIME_AUTOCOMPLETE', {
                  condition: msTime && (msTime > maxTime ? 'greater' : 'less'),
                  input: msToTime(msTime),
                  time:
                    msTime > maxTime
                      ? i18n.__mf('GENERIC.TIME.YEARS', { count: maxTime / 365.25 / 24 / 60 / 60000 })
                      : i18n.__mf('GENERIC.TIME.MINUTES', { count: minTime / 60000 }),
                })
              : msToTime(msTime),
          value: focused,
        },
      ]);
    }

    if (interaction.isChatInputCommand()) {
      const { options } = interaction,
        contentO = options
          .getString('content')
          ?.replace(/((\\n|\n)(\s*)?)+/g, '\n')
          .trim(),
        timeO = options.getString('time'),
        ephemeralO = options.getBoolean('ephemeral') ?? true;

      switch (options.getSubcommand()) {
        case 'create': {
          const msTime = parseDur(timeO),
            reminderId = SnowflakeUtil.generate().toString(),
            summedTime = msTime + SnowflakeUtil.timestampFrom(reminderId);

          if (!contentO) {
            return interaction.reply({
              embeds: [embed({ type: 'error' }).setDescription(i18n.__('ERROR.REMINDER.EMPTY_CONTENT'))],
              ephemeral: true,
            });
          }

          if (!msTime || msTime < minTime || msTime > maxTime) {
            return interaction.reply({
              embeds: [
                embed({ type: 'error' }).setDescription(
                  i18n.__mf('ERROR.INVALID.TIME', {
                    condition: msTime && (msTime > maxTime ? 'greater' : 'less'),
                    input: msTime ? msToTime(msTime) : timeO,
                    time:
                      msTime > maxTime
                        ? i18n.__mf('GENERIC.TIME.YEARS', { count: maxTime / 365.25 / 24 / 60 / 60000 })
                        : i18n.__mf('GENERIC.TIME.MINUTES', { count: minTime / 60000 }),
                  }),
                ),
              ],
              ephemeral: true,
            });
          }

          await interaction.deferReply({ ephemeral: ephemeralO });

          const reminder = await client.database.reminders.set(reminderId, user.id, {
              channelId: interaction.guild ? channel.id : null,
              content: contentO,
              msTime,
              timestamp: summedTime,
              userId: user.id,
            }),
            emb = embed({ title: i18n.__('REMINDER.CREATED'), type: 'success' }).addFields(
              {
                name: `📄 ${i18n.__('GENERIC.CONTENT.CONTENT')}`,
                value: reminder.content,
              },
              {
                inline: true,
                name: `🪪 ${i18n.__('GENERIC.ID')}`,
                value: `\`${reminder.id}\``,
              },
              {
                inline: true,
                name: `${emojis.channelText} ${i18n.__('GENERIC.CHANNEL.CHANNEL')}`,
                value: reminder.channelId
                  ? `<#${reminder.channelId}> - \`${reminder.channelId}\``
                  : i18n.__('GENERIC.DIRECT_MESSAGE'),
              },
              {
                name: `📅 ${i18n.__('GENERIC.TIMESTAMP')}`,
                value: `${i18n.__mf('REMINDER.TIMESTAMP', { timestamp: toUTS(reminder.timestamp) })}\n${i18n.__mf(
                  'REMINDER.CREATED_AT',
                  { timestamp: toUTS(SnowflakeUtil.timestampFrom(reminder.id)) },
                )}`,
              },
              {
                name: `🔁 ${i18n.__('GENERIC.NOT_RECURSIVE')}`,
                value:
                  reminder.msTime < minRecursiveTime
                    ? i18n.__mf('REMINDER.RECURSIVE.DISABLED', {
                        time: i18n.__mf('GENERIC.TIME.MINUTES', { count: minRecursiveTime / 60000 }),
                      })
                    : i18n.__('REMINDER.RECURSIVE.OFF'),
              },
            );

          rows.push(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel(i18n.__('REMINDER.COMPONENT.LIST'))
                .setEmoji('🗒️')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('reminder_list'),
              new ButtonBuilder()
                .setLabel(i18n.__('GENERIC.EDIT'))
                .setEmoji('📝')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('reminder_edit'),
            ),
          );

          return interaction.editReply({
            components: rows,
            embeds: [emb],
          });
        }
        case 'list': {
          await interaction.deferReply({ ephemeral: ephemeralO });

          const reminders = await client.database.users.fetchAllReminders(user.id),
            selectMenu = new StringSelectMenuBuilder()
              .setPlaceholder(i18n.__('REMINDER.SELECT_LIST'))
              .setCustomId('reminder_select');

          let emb: EmbedBuilder;
          if (reminders.size) {
            emb = embed({ title: `🔔 ${i18n.__('REMINDER.LIST')}` });
            reminders
              .sort((a, b) => a.timestamp - b.timestamp)
              .forEach((r: Record<string, any>) => {
                selectMenu.addOptions({
                  description: truncate(r.content, 100),
                  label: new Date(r.timestamp).toLocaleString(i18n.locale),
                  value: r.id,
                });
                emb.addFields({
                  name: `${toUTS(r.timestamp, TimestampStyles.ShortDateTime)}${r.isRecursive ? ' 🔁' : ''}`,
                  value: truncate(r.content, 300),
                });
              });

            rows.push(new ActionRowBuilder().addComponents(selectMenu));
          } else {
            emb = embed({ title: `🔕 ${i18n.__('REMINDER.LIST')}` })
              .setColor(Colors.Red)
              .setDescription(i18n.__('ERROR.REMINDER.EMPTY'));
          }

          return interaction.editReply({
            components: rows,
            embeds: [emb],
          });
        }
      }
    } else if (
      interaction.isButton() ||
      interaction.isChannelSelectMenu() ||
      interaction.isStringSelectMenu() ||
      interaction.isModalSubmit()
    ) {
      let { customId } = interaction;
      const { message } = interaction,
        urlArgs = new URLSearchParams(message.embeds.at(-1)?.footer?.iconURL),
        isList = customId === 'reminder_list';

      if (
        !(message.interaction?.user.id === user.id || urlArgs.get('messageOwners') === user.id) &&
        !(!message.interaction && isList)
      ) {
        return interaction.reply({
          embeds: [embed({ type: 'error' }).setDescription(i18n.__('ERROR.UNALLOWED.COMMAND'))],
          ephemeral: true,
        });
      }

      const reminderId =
        interaction instanceof StringSelectMenuInteraction
          ? interaction.values[0]
          : urlArgs.get('reminderId') || getFieldValue(message.embeds[0], i18n.__('GENERIC.ID'))?.replaceAll('`', '');

      let reminder = reminderId ? await client.database.reminders.fetch(reminderId, user.id) : null,
        emb = embed(
          message.interaction?.user.id === client.user.id || !message.interaction
            ? { addParams: { messageOwners: user.id }, footer: 'interacted' }
            : { footer: 'interacted' },
        );

      if (!isList) {
        if (reminder) {
          emb.setTitle(`🔔 ${i18n.__('REMINDER.INFO')}`).addFields(
            {
              name: `📄 ${i18n.__('GENERIC.CONTENT.CONTENT')}`,
              value: reminder.content,
            },
            {
              inline: true,
              name: `🪪 ${i18n.__('GENERIC.ID')}`,
              value: `\`${reminder.id}\``,
            },
            {
              inline: true,
              name: `${emojis.channelText} ${i18n.__('GENERIC.CHANNEL.CHANNEL')}`,
              value: reminder.channelId
                ? `<#${reminder.channelId}> - \`${reminder.channelId}\``
                : i18n.__('GENERIC.DIRECT_MESSAGE'),
            },
            {
              name: `📅 ${i18n.__('GENERIC.TIMESTAMP')}`,
              value: `${i18n.__mf('REMINDER.TIMESTAMP', { timestamp: toUTS(reminder.timestamp) })}\n${i18n.__mf(
                'REMINDER.CREATED_AT',
                { timestamp: toUTS(SnowflakeUtil.timestampFrom(reminder.id)) },
              )}`,
            },
            reminder.isRecursive
              ? {
                  name: `🔁 ${i18n.__('GENERIC.RECURSIVE')}`,
                  value: i18n.__mf('REMINDER.RECURSIVE.ON', { timestamp: toUTS(reminder.timestamp + reminder.msTime) }),
                }
              : {
                  name: `🔁 ${i18n.__('GENERIC.NOT_RECURSIVE')}`,
                  value:
                    reminder.msTime < minRecursiveTime
                      ? i18n.__mf('REMINDER.RECURSIVE.DISABLED', {
                          time: i18n.__mf('GENERIC.TIME.MINUTES', { count: minRecursiveTime / 60000 }),
                        })
                      : i18n.__('REMINDER.RECURSIVE.OFF'),
                },
          );
        } else {
          emb = EmbedBuilder.from(message.embeds[0])
            .setTitle(`🔕 ${i18n.__('REMINDER.INFO')}`)
            .setColor(Colors.Red);
          customId = 'reminder_view';
        }
      }

      switch (customId) {
        case 'reminder_list':
        case 'reminder_select':
        case 'reminder_view': {
          await interaction.deferUpdate();
          if (message.webhookId) {
            await interaction.editReply({
              components: disableComponents(message.components, {
                defaultValues: [{ customId: 'reminder_select', value: reminderId }],
              }),
            });
          }

          if (!isList) {
            rows.push(
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setLabel(i18n.__('REMINDER.COMPONENT.LIST'))
                  .setEmoji('🗒️')
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId('reminder_list'),
                new ButtonBuilder()
                  .setEmoji('📝')
                  .setLabel(i18n.__('GENERIC.EDIT'))
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId('reminder_edit')
                  .setDisabled(!reminder),
              ),
            );
          } else {
            const reminders = await client.database.users.fetchAllReminders(user.id),
              selectMenu = new StringSelectMenuBuilder()
                .setPlaceholder(i18n.__('REMINDER.SELECT_LIST'))
                .setCustomId('reminder_select');

            if (reminders.size) {
              emb.setTitle(`🔔 ${i18n.__('REMINDER.LIST')}`);
              reminders
                .sort((a, b) => a.timestamp - b.timestamp)
                .forEach((r: Record<string, any>) => {
                  selectMenu.addOptions({
                    description: truncate(r.content, 100),
                    label: new Date(r.timestamp).toLocaleString(i18n.locale),
                    value: r.id,
                  });
                  emb.addFields({
                    name: `${toUTS(r.timestamp, TimestampStyles.ShortDateTime)}${r.isRecursive ? ' 🔁' : ''}`,
                    value: truncate(r.content, 300),
                  });
                });

              rows.push(new ActionRowBuilder().addComponents(selectMenu));
            } else {
              emb
                .setTitle(`🔕 ${i18n.__('REMINDER.LIST')}`)
                .setColor(Colors.Red)
                .setDescription(i18n.__('ERROR.REMINDER.EMPTY'));
            }
          }

          if (!isList && !reminder) {
            await interaction.followUp({
              embeds: [
                embed({ type: 'error' }).setDescription(
                  i18n.__mf('ERROR.REMINDER.NOT_FOUND', { reminderId: reminderId }),
                ),
              ],
              ephemeral: true,
            });
            if (!message.webhookId) {
              return interaction.editReply({
                components: disableComponents(message.components, { enabledComponents: ['reminder_list'] }),
              });
            }
          }

          if (!message.webhookId) return interaction.followUp({ components: rows, embeds: [emb], ephemeral: true });
          return interaction.editReply({
            components: rows,
            embeds: [emb],
          });
        }
        case 'reminder_edit': {
          emb.setTitle(`🔔 ${i18n.__('REMINDER.EDITING')}`).setColor(Colors.Yellow);
          rows.push(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel(i18n.__('GENERIC.VIEW'))
                .setEmoji('🔎')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('reminder_view'),
              new ButtonBuilder()
                .setLabel(i18n.__('GENERIC.CONTENT.EDIT'))
                .setEmoji('✏️')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('reminder_edit_content'),
              new ButtonBuilder()
                .setLabel(i18n.__('GENERIC.CHANNEL.EDIT'))
                .setEmoji(emojis.channelText)
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('reminder_edit_channel'),
            ),
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel(i18n.__(`GENERIC.${reminder.isRecursive ? 'RECURSIVE' : 'NOT_RECURSIVE'}`))
                .setEmoji('🔁')
                .setStyle(reminder.isRecursive ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setCustomId('reminder_recursive')
                .setDisabled(reminder.msTime < minRecursiveTime),
              new ButtonBuilder()
                .setLabel(i18n.__('GENERIC.DELETE'))
                .setEmoji('🗑️')
                .setStyle(ButtonStyle.Danger)
                .setCustomId('reminder_delete'),
            ),
          );

          if (!message.webhookId) return interaction.reply({ components: rows, embeds: [emb], ephemeral: true });
          return (interaction as ButtonInteraction).update({
            components: rows,
            embeds: [emb],
          });
        }
        case 'reminder_recursive': {
          reminder = await client.database.reminders.set(reminderId, user.id, {
            isRecursive: !reminder.isRecursive,
          });

          rows.push(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel(i18n.__('GENERIC.VIEW'))
                .setEmoji('🔎')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('reminder_view'),
              new ButtonBuilder()
                .setLabel(i18n.__(`GENERIC.${reminder.isRecursive ? 'RECURSIVE' : 'NOT_RECURSIVE'}`))
                .setEmoji('🔁')
                .setStyle(reminder.isRecursive ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setCustomId('reminder_recursive')
                .setDisabled(reminder.msTime < minRecursiveTime),
              new ButtonBuilder()
                .setLabel(i18n.__('GENERIC.DELETE'))
                .setEmoji('🗑️')
                .setStyle(ButtonStyle.Danger)
                .setCustomId('reminder_delete'),
            ),
          );

          emb
            .setTitle(`🔔 ${i18n.__('REMINDER.EDITED')}`)
            .spliceFields(
              4,
              1,
              reminder.isRecursive
                ? {
                    name: `🔁 ${i18n.__('GENERIC.RECURSIVE')}`,
                    value: i18n.__mf('REMINDER.RECURSIVE.ON', {
                      timestamp: toUTS(reminder.timestamp + reminder.msTime),
                    }),
                  }
                : {
                    name: `🔁 ${i18n.__('GENERIC.NOT_RECURSIVE')}`,
                    value: i18n.__('REMINDER.RECURSIVE.OFF'),
                  },
            )
            .setColor(Colors.Yellow);

          return (interaction as ButtonInteraction).update({
            components: rows,
            embeds: [emb],
          });
        }
        case 'reminder_delete': {
          rows.push(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel(i18n.__('GENERIC.BACK'))
                .setEmoji('↩️')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('reminder_edit'),
              new ButtonBuilder()
                .setLabel(i18n.__('GENERIC.YES'))
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success)
                .setCustomId('reminder_delete_confirm'),
            ),
          );
          return (interaction as ButtonInteraction).update({
            components: rows,
            embeds: [
              emb
                .setTitle(`🔔 ${i18n.__('REMINDER.DELETING')}`)
                .setDescription(i18n.__('REMINDER.DELETING_DESCRIPTION'))
                .setColor(Colors.Orange),
            ],
          });
        }
        case 'reminder_delete_confirm': {
          await client.database.reminders.delete(reminderId, user.id);
          rows.push(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel(i18n.__('REMINDER.COMPONENT.LIST'))
                .setEmoji('🗒️')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('reminder_list'),
            ),
          );
          return (interaction as ButtonInteraction).update({
            components: rows,
            embeds: [emb.setTitle(`🔕 ${i18n.__('REMINDER.DELETED')}`).setColor(Colors.Red)],
          });
        }
        case 'reminder_edit_content': {
          return (interaction as ButtonInteraction).showModal(
            new ModalBuilder()
              .setTitle(i18n.__('GENERIC.CONTENT.EDITING'))
              .setCustomId('reminder_edit_content_submit')
              .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                    .setCustomId('reminder_edit_content_input')
                    .setLabel(i18n.__('GENERIC.CONTENT.EDITING_LABEL'))
                    .setMinLength(1)
                    .setMaxLength(1024)
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder(reminder.content),
                ),
              ),
          );
        }
        case 'reminder_edit_content_submit': {
          const { fields } = interaction as ModalMessageModalSubmitInteraction,
            inputF = fields
              .getTextInputValue('reminder_edit_content_input')
              ?.replace(/((\\n|\n)(\s*)?)+/g, '\n')
              .trim();

          if (!inputF) {
            return interaction.reply({
              embeds: [embed({ type: 'error' }).setDescription(i18n.__('ERROR.REMINDER.EMPTY_CONTENT'))],
              ephemeral: true,
            });
          }

          reminder = await client.database.reminders.set(reminderId, user.id, {
            content: inputF,
          });

          return (interaction as ButtonInteraction).update({
            embeds: [
              emb
                .setTitle(`🔔 ${i18n.__('GENERIC.CONTENT.EDITED')}`)
                .spliceFields(0, 1, {
                  name: `📄 ${i18n.__('GENERIC.CONTENT.CONTENT')}`,
                  value: reminder.content,
                })
                .setColor(Colors.Green),
            ],
          });
        }
        case 'reminder_dm':
        case 'reminder_edit_channel_submit':
          reminder = await client.database.reminders.set(reminderId, user.id, {
            channelId:
              customId === 'reminder_dm' ? null : (interaction as ChannelSelectMenuInteraction).channels.first().id,
          });
        // eslint-disable-next-line no-fallthrough
        case 'reminder_edit_channel': {
          return (interaction as ButtonInteraction).update({
            components: [
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel(i18n.__('GENERIC.BACK'))
                  .setEmoji('↩️')
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId('reminder_edit'),
                new ButtonBuilder()
                  .setLabel(i18n.__(`GENERIC.${reminder.channelId ? 'NOT_DIRECT_MESSAGE' : 'DIRECT_MESSAGE'}`))
                  .setEmoji(emojis.user)
                  .setStyle(reminder.channelId ? ButtonStyle.Secondary : ButtonStyle.Success)
                  .setCustomId('reminder_dm')
                  .setDisabled(!reminder.channelId),
              ),
              new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
                new ChannelSelectMenuBuilder()
                  .setPlaceholder(i18n.__('GENERIC.CHANNEL.SELECT_PLACEHOLDER'))
                  .setChannelTypes(
                    ChannelType.AnnouncementThread,
                    ChannelType.GuildAnnouncement,
                    ChannelType.GuildText,
                    ChannelType.GuildVoice,
                    ChannelType.PrivateThread,
                    ChannelType.PublicThread,
                  )
                  .setCustomId('reminder_edit_channel_submit'),
              ),
            ],
            embeds: [
              emb
                .setTitle(`🔔 ${i18n.__('REMINDER.EDITED')}`)
                .spliceFields(2, 1, {
                  inline: true,
                  name: `${emojis.channelText} ${i18n.__('GENERIC.CHANNEL.CHANNEL')}`,
                  value: reminder.channelId
                    ? `<#${reminder.channelId}> - \`${reminder.channelId}\``
                    : i18n.__('GENERIC.DIRECT_MESSAGE'),
                })
                .setColor(Colors.Green),
            ],
          });
        }
      }
    }
  }
}
