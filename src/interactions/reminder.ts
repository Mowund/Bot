import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  SnowflakeUtil,
} from 'discord.js';
import parseDur from 'parse-duration';
import { Command, CommandArgs } from '../../lib/util/Command.js';
import { emojis } from '../defaults.js';
import { disableComponents, msToTime, toUTS, truncate } from '../utils.js';

// TODO
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
      { channel, guild, user } = interaction,
      rows = [];

    if (interaction.isChatInputCommand()) {
      const { options } = interaction,
        reminderO = options?.getString('reminder'),
        timeO = options?.getString('time'),
        ephemeralO = options?.getBoolean('ephemeral') ?? true;

      switch (options?.getSubcommand()) {
        case 'create': {
          const msTime = parseDur(timeO),
            summedTime = msTime + Date.now();

          if (!msTime || msTime < 0) {
            return interaction.reply({
              components: rows,
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

          const reminderId = SnowflakeUtil.generate().toString(),
            reminder = await client.dbSet(
              user,
              {
                channelId: interaction.guild ? channel.id : null,
                content: reminderO,
                guildId: guild?.id,
                id: reminderId,
                timestamp: summedTime,
                userId: user.id,
              },
              { subCollections: [['reminders', reminderId]] },
            ),
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

          return interaction.editReply({
            components: rows,
            embeds: [emb],
          });
        }
        case 'list': {
          await interaction.deferReply({ ephemeral: ephemeralO });

          const reminders = await client.dbGet(user, { subCollections: [['reminders']] }),
            selectMenu = new SelectMenuBuilder()
              .setPlaceholder(i18n.__('REMINDER.COMPONENT.SELECT_LIST'))
              .setCustomId('reminder_select');

          let emb;
          if (reminders.length) {
            emb = embed({ title: `🔔 ${i18n.__('REMINDER.LIST')}` });
            reminders.forEach(r => {
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
    } else if (interaction.isButton()) {
      const { message } = interaction;

      if (message.interaction.user.id !== user.id) {
        return interaction.reply({
          embeds: [embed({ type: 'error' }).setDescription(i18n.__('ERROR.UNALLOWED.COMMAND'))],
          ephemeral: true,
        });
      }

      await interaction.deferUpdate();
      await interaction.editReply({
        components: disableComponents(message.components),
      });

      const reminders = await client.dbGet(user, { subCollections: [['reminders']] }),
        selectMenu = new SelectMenuBuilder()
          .setPlaceholder(i18n.__('REMINDER.COMPONENT.SELECT_LIST'))
          .setCustomId('reminder_select');

      let emb;
      if (reminders.length) {
        emb = embed({ title: `🔔 ${i18n.__('REMINDER.LIST')}` });

        reminders.forEach(r => {
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
        emb = embed({ title: `🔕 ${i18n.__('REMINDER.LIST')}` })
          .setColor(Colors.Red)
          .setDescription(i18n.__('ERROR.REMINDER.EMPTY'));
      }

      return interaction.editReply({
        components: rows,
        embeds: [emb],
      });
    }

    if (interaction.isSelectMenu()) {
      const { message, values } = interaction;

      if (message.interaction.user.id !== user.id) {
        return interaction.reply({
          embeds: [embed({ type: 'error' }).setDescription(i18n.__('ERROR.UNALLOWED.COMMAND'))],
          ephemeral: true,
        });
      }

      await interaction.deferUpdate();
      await interaction.editReply({
        components: disableComponents(message.components, {
          defaultValues: [{ customId: 'reminder_select', value: values[0] }],
        }),
      });

      const reminders = await client.dbGet(user, { subCollections: [['reminders']] }),
        reminder = reminders.find?.(r => r.id === values[0]);

      console.log(reminders);

      let emb;
      if (reminder) {
        emb = embed({ title: `🔔 ${i18n.__('REMINDER.INFO')}` }).addFields(
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

        rows.push(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel(i18n.__('GENERIC.COMPONENT.BACK'))
              .setEmoji('↩️')
              .setStyle(ButtonStyle.Primary)
              .setCustomId('reminderList'),
          ),
        );
      } else {
        const selectMenu = new SelectMenuBuilder()
          .setPlaceholder(i18n.__('REMINDER.COMPONENT.SELECT_LIST'))
          .setCustomId('reminder_select');

        if (reminders.length) {
          emb = embed({ title: `🔔 ${i18n.__('REMINDER.LIST')}` });
          reminders.forEach(r => {
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
          emb = embed({ title: `🔕 ${i18n.__('REMINDER.LIST')}` })
            .setColor(Colors.Red)
            .setDescription(i18n.__('ERROR.REMINDER.EMPTY'));
        }
      }

      await interaction.editReply({
        components: rows,
        embeds: [emb],
      });

      if (!reminder) {
        return interaction.followUp({
          embeds: [
            embed({ type: 'error' }).setDescription(i18n.__mf('ERROR.REMINDER.NOT_FOUND', { reminderId: values[0] })),
          ],
          ephemeral: true,
        });
      }
    }
  }
}
