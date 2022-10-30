import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  SelectMenuBuilder,
  SelectMenuInteraction,
  SelectMenuOptionBuilder,
  SnowflakeUtil,
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
                name: 'REMINDER.OPTIONS.CREATE.OPTIONS.REMINDER.NAME',
                required: true,
                type: ApplicationCommandOptionType.String,
              },
              {
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
      minimumTime = 180000,
      minimumRecursiveTime = 1800000,
      rows = [];

    if (interaction.isChatInputCommand()) {
      const { options } = interaction,
        reminderO = options?.getString('reminder'),
        timeO = options?.getString('time'),
        ephemeralO = options?.getBoolean('ephemeral') ?? true;

      switch (options?.getSubcommand()) {
        case 'create': {
          const msTime = parseDur(timeO),
            reminderId = SnowflakeUtil.generate().toString(),
            summedTime = msTime + SnowflakeUtil.timestampFrom(reminderId);

          if (!msTime || msTime < minimumTime) {
            return interaction.reply({
              embeds: [
                embed({ type: 'error' }).setDescription(
                  i18n.__mf('ERROR.INVALID.TIME', {
                    condition: msTime && 'less',
                    input: msToTime(msTime),
                    time: i18n.__mf('GENERIC.TIME.MINUTES', { count: 1 }),
                  }),
                ),
              ],
              ephemeral: true,
            });
          }

          await interaction.deferReply({ ephemeral: ephemeralO });

          const reminder = await client.database.reminders.set(reminderId, user.id, {
              channelId: interaction.guild ? channel.id : null,
              content: reminderO,
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
                inline: true,
                name: `📅 ${i18n.__('GENERIC.TIMESTAMP')}`,
                value: toUTS(reminder.timestamp),
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
            selectMenu = new SelectMenuBuilder()
              .setPlaceholder(i18n.__('REMINDER.COMPONENT.SELECT_LIST'))
              .setCustomId('reminder_select');

          let emb: EmbedBuilder;
          if (reminders.size) {
            emb = embed({ title: `🔔 ${i18n.__('REMINDER.LIST')}` });
            reminders.forEach((r: Record<string, any>) => {
              selectMenu.addOptions({ description: truncate(r.content, 100), label: r.id, value: r.id });
              emb.addFields({
                name: `**${r.id}**`,
                value: `📄 **${i18n.__('GENERIC.CONTENT')}:** ${truncate(r.content, 300)}\n📅 **${i18n.__(
                  'GENERIC.TIMESTAMP',
                )}:** ${toUTS(r.timestamp)}`,
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
      const { message } = interaction,
        urlArgs = new URLSearchParams(message.embeds[message.embeds.length - 1]?.footer?.iconURL);
      let { customId } = interaction;

      if (!(message.interaction?.user.id === user.id || urlArgs.get('messageOwners') === user.id)) {
        return interaction.reply({
          embeds: [embed({ type: 'error' }).setDescription(i18n.__('ERROR.UNALLOWED.COMMAND'))],
          ephemeral: true,
        });
      }

      const reminderId =
          interaction instanceof SelectMenuInteraction
            ? interaction.values[0]
            : urlArgs.get('reminderId') || getFieldValue(message.embeds[0], i18n.__('GENERIC.ID'))?.replaceAll('`', ''),
        reminder = reminderId ? await client.database.reminders.fetch(reminderId, user.id) : null,
        isList = customId === 'reminder_list';
      let emb = embed(
        message.interaction?.user.id === client.user.id || !message.interaction
          ? { addParams: { messageOwners: user.id } }
          : {},
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
              inline: true,
              name: `📅 ${i18n.__('GENERIC.TIMESTAMP')}`,
              value: toUTS(reminder.timestamp),
            },
            {
              inline: true,
              name: `📅 ${i18n.__('GENERIC.CREATION_DATE')}`,
              value: toUTS(SnowflakeUtil.timestampFrom(reminder.id)),
            },
          );
        } else {
          emb = EmbedBuilder.from(message.embeds[0])
            .setTitle(`🔔 ${i18n.__('REMINDER.INFO')}`)
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
              selectMenu = new SelectMenuBuilder()
                .setPlaceholder(i18n.__('REMINDER.COMPONENT.SELECT_LIST'))
                .setCustomId('reminder_select');

            if (reminders.size) {
              reminders.forEach((r: Record<string, any>) => {
                selectMenu.addOptions(
                  new SelectMenuOptionBuilder().setLabel(r.id).setValue(r.id).setDescription(truncate(r.content, 100)),
                );
                emb.addFields({
                  name: `**${r.id}**`,
                  value: `📄 **${i18n.__('GENERIC.CONTENT')}:** ${truncate(r.content, 300)}\n📅 **${i18n.__(
                    'GENERIC.TIMESTAMP',
                  )}:** ${toUTS(r.timestamp)}`,
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
                .setDisabled(reminder.msTime < minimumRecursiveTime),
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
          await client.database.reminders.set(reminderId, user.id, { isRecursive: !reminder.isRecursive });
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
                .setDisabled(reminder.msTime < minimumRecursiveTime),
              new ButtonBuilder()
                .setLabel(i18n.__('GENERIC.DELETE'))
                .setEmoji('🗑️')
                .setStyle(ButtonStyle.Danger)
                .setCustomId('reminder_delete'),
            ),
          );
          return interaction.update({
            components: rows,
            embeds: [
              emb
                .setTitle(`🔔 ${i18n.__('REMINDER.EDITED')}`)
                .setDescription(i18n.__(`REMINDER.RECURSIVE.${reminder.isRecursive ? 'SET' : 'UNSET'}`))
                .setColor(Colors.Yellow),
            ],
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
          return interaction.update({
            components: [],
            embeds: [emb.setTitle(`🔕 ${i18n.__('REMINDER.DELETED')}`).setColor(Colors.Red)],
          });
        }
      }
    }
  }
}
