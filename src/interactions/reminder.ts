import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  StringSelectMenuBuilder,
  SelectMenuInteraction,
  SnowflakeUtil,
  TimestampStyles,
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
                description: 'REMINDER.OPTIONS.CREATE.OPTIONS.REMINDER.DESCRIPTION',
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
          ?.replace(/(\\n(\s*)?)+/g, '\n')
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
                name: `📄 ${i18n.__('GENERIC.CONTENT')}`,
                value: reminder.content,
              },
              {
                inline: true,
                name: `🪪 ${i18n.__('GENERIC.ID')}`,
                value: `\`${reminder.id}\``,
              },
              {
                inline: true,
                name: `${emojis.channelText} ${i18n.__('GENERIC.CHANNEL')}`,
                value: reminder.channelId ? `<#${reminder.channelId}> - \`${reminder.channelId}\`` : 'DM',
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
    } else if (interaction.isButton() || interaction.isSelectMenu()) {
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
          interaction instanceof SelectMenuInteraction
            ? interaction.values[0]
            : urlArgs.get('reminderId') || getFieldValue(message.embeds[0], i18n.__('GENERIC.ID'))?.replaceAll('`', ''),
        reminder = reminderId ? await client.database.reminders.fetch(reminderId, user.id) : null;
      let emb = embed(
        message.interaction?.user.id === client.user.id || !message.interaction
          ? { addParams: { messageOwners: user.id }, footer: 'interacted' }
          : { footer: 'interacted' },
      );

      if (!isList) {
        if (reminder) {
          emb.setTitle(`🔔 ${i18n.__('REMINDER.INFO')}`).addFields(
            {
              name: `📄 ${i18n.__('GENERIC.CONTENT')}`,
              value: reminder.content,
            },
            {
              inline: true,
              name: `🪪 ${i18n.__('GENERIC.ID')}`,
              value: `\`${reminder.id}\``,
            },
            {
              inline: true,
              name: `${emojis.channelText} ${i18n.__('GENERIC.CHANNEL')}`,
              value: reminder.channelId ? `<#${reminder.channelId}> - \`${reminder.channelId}\`` : 'DM',
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
                .setLabel(i18n.__('GENERIC.BACK'))
                .setEmoji('↩️')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('reminder_view'),
              new ButtonBuilder()
                .setLabel(i18n.__(`GENERIC.${reminder.isRecursive ? 'RECURSIVE' : 'NOT_RECURSIVE'}`))
                .setEmoji('🔁')
                .setStyle(reminder.isRecursive ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setCustomId(`reminder_recursive_${reminder.isRecursive ? 'unset' : 'set'}`)
                .setDisabled(reminder.msTime < minRecursiveTime),
              new ButtonBuilder()
                .setLabel(i18n.__('GENERIC.DELETE'))
                .setEmoji('🗑️')
                .setStyle(ButtonStyle.Danger)
                .setCustomId('reminder_delete'),
            ),
          );

          if (!message.webhookId) return interaction.reply({ components: rows, embeds: [emb], ephemeral: true });
          return interaction.update({
            components: rows,
            embeds: [emb],
          });
        }
        case 'reminder_recursive_set':
        case 'reminder_recursive_unset': {
          const updReminder = await client.database.reminders.set(reminderId, user.id, {
            isRecursive: !reminder.isRecursive,
          });

          rows.push(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel(i18n.__('GENERIC.BACK'))
                .setEmoji('↩️')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('reminder_view'),
              new ButtonBuilder()
                .setLabel(i18n.__(`GENERIC.${updReminder.isRecursive ? 'RECURSIVE' : 'NOT_RECURSIVE'}`))
                .setEmoji('🔁')
                .setStyle(updReminder.isRecursive ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setCustomId(`reminder_recursive_${updReminder.isRecursive ? 'unset' : 'set'}`)
                .setDisabled(updReminder.msTime < minRecursiveTime),
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
              updReminder.isRecursive
                ? {
                    name: `🔁 ${i18n.__('GENERIC.RECURSIVE')}`,
                    value: i18n.__mf('REMINDER.RECURSIVE.ON', {
                      timestamp: toUTS(updReminder.timestamp + updReminder.msTime),
                    }),
                  }
                : {
                    name: `🔁 ${i18n.__('GENERIC.NOT_RECURSIVE')}`,
                    value: i18n.__('REMINDER.RECURSIVE.OFF'),
                  },
            )
            .setColor(Colors.Yellow);

          return interaction.update({
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
          return interaction.update({
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
          return interaction.update({
            components: rows,
            embeds: [emb.setTitle(`🔕 ${i18n.__('REMINDER.DELETED')}`).setColor(Colors.Red)],
          });
        }
      }
    }
  }
}
