import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  SnowflakeUtil,
} from 'discord.js';
import parseDur from 'parse-duration';
import { colors, emojis } from '../defaults.js';
import { disableComponents, msToTime, toUTS, truncate } from '../utils.js';

// TODO
export const data = [
  {
    description: 'Reminder related commands',
    description_localizations: {
      'pt-BR': 'Comandos relacionados à lembretes',
    },
    name: 'reminder',
    name_localizations: {
      'pt-BR': 'lembrete',
    },
    options: [
      {
        description: 'Creates a new reminder',
        description_localizations: {
          'pt-BR': 'Cria um novo lembrete',
        },
        name: 'create',
        name_localizations: {
          'pt-BR': 'criar',
        },
        options: [
          {
            description: "What you'll be reminded about",
            description_localizations: {
              'pt-BR': 'Sobre o que você será lembrado',
            },
            name: 'reminder',
            name_localizations: {
              'pt-BR': 'lembrete',
            },
            required: true,
            type: ApplicationCommandOptionType.String,
          },
          {
            description: "When you'll be reminded",
            description_localizations: {
              'pt-BR': 'Quando você será lembrado',
            },
            name: 'time',
            name_localizations: { 'pt-BR': 'tempo' },
            required: true,
            type: ApplicationCommandOptionType.String,
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
      {
        description: 'Lists all of your reminders',
        description_localizations: {
          'pt-BR': 'Lista todos os seus lembretes',
        },
        name: 'list',
        name_localizations: { 'pt-BR': 'lista' },
        options: [
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
  const { channel, client, guild, message, options, user, values } = interaction,
    reminderO = options?.getString('reminder'),
    timeO = options?.getString('time'),
    ephemeralO = options?.getBoolean('ephemeral') ?? message?.flags.has(MessageFlags.Ephemeral) ?? true,
    mdBtn = new ButtonBuilder()
      .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
      .setEmoji('🧹')
      .setStyle(ButtonStyle.Danger)
      .setCustomId('generic_message_delete'),
    rows = [];

  if (interaction.isChatInputCommand()) {
    switch (options?.getSubcommand()) {
      case 'create': {
        const msTime = parseDur(timeO),
          summedTime = msTime + Date.now();

        if (!msTime || msTime < 0) {
          return interaction.reply({
            components: rows,
            embeds: [
              embed({ type: 'error' }).setDescription(
                st.__mf('ERROR.INVALID.TIME', {
                  condition: msTime && 'less',
                  input: msToTime(msTime),
                  time: st.__mf('GENERIC.TIME.MINUTES', { count: 1 }),
                }),
              ),
            ],
            ephemeral: true,
          });
        }

        await interaction.deferReply(ephemeralO);
        const reminderId = SnowflakeUtil.generate().toString(),
          reminder = await client.dbSet(
            user,
            {
              channelId: interaction.inGuild() ? channel.id : null,
              content: reminderO,
              guildId: guild?.id,
              id: reminderId,
              timestamp: summedTime,
              userId: user.id,
            },
            { subCollections: [['reminders', reminderId]] },
          ),
          emb = embed({ title: st.__('REMINDER.CREATED'), type: 'success' }).addFields([
            {
              name: `📄 ${st.__('GENERIC.CONTENT')}`,
              value: reminder.content,
            },
            {
              inline: true,
              name: `🏷️ ${st.__('GENERIC.ID')}`,
              value: `\`${reminder.id}\``,
            },
            {
              inline: true,
              name: `${emojis.channelText} ${st.__('GENERIC.CHANNEL')}`,
              value: reminder.channelId ? `<#${reminder.channelId}> - \`${reminder.channelId}\`` : 'DM',
            },
            {
              inline: true,
              name: `📅 ${st.__('GENERIC.TIMESTAMP')}`,
              value: toUTS(reminder.timestamp),
            },
          ]);

        if (!ephemeralO) rows.push(new ActionRowBuilder().addComponents([mdBtn]));

        return interaction.editReply({
          components: rows,
          embeds: [emb],
        });
      }
      case 'list': {
        await interaction.deferReply({ ephemeral: ephemeralO });

        const reminders = await client.dbGet(user, { subCollections: [['reminders']] }),
          selectMenu = new SelectMenuBuilder()
            .setPlaceholder(st.__('REMINDER.COMPONENT.SELECT_LIST'))
            .setCustomId('reminder_select');

        let emb;
        if (reminders.length) {
          emb = embed({ title: `🔔 ${st.__('REMINDER.LIST')}` });
          reminders.forEach(r => {
            selectMenu.addOptions([{ description: truncate(r.content, 100), label: r.id, value: r.id }]);
            emb.addFields([
              {
                name: `**${r.id}**`,
                value: `📄 **${st.__('GENERIC.CONTENT')}:** ${truncate(r.content, 300)}\n📅 **${st.__(
                  'GENERIC.TIMESTAMP',
                )}:** ${toUTS(r.timestamp)}`,
              },
            ]);
          });

          rows.push(new ActionRowBuilder().addComponents([selectMenu]));
        } else {
          emb = embed({ title: `🔕 ${st.__('REMINDER.LIST')}` })
            .setColor(colors.red)
            .setDescription(st.__('ERROR.REMINDER.EMPTY'));
        }

        if (!ephemeralO) rows.push(new ActionRowBuilder().addComponents([mdBtn]));

        return interaction.editReply({
          components: rows,
          embeds: [emb],
        });
      }
    }
  } else if (interaction.isButton()) {
    if (message.interaction.user.id !== user.id) {
      return interaction.reply({
        embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.UNALLOWED.COMMAND'))],
        ephemeral: true,
      });
    }

    await interaction.deferUpdate();
    await interaction.editReply({
      components: disableComponents(message.components),
    });

    const reminders = await client.dbGet(user, { subCollections: [['reminders']] }),
      selectMenu = new SelectMenuBuilder()
        .setPlaceholder(st.__('REMINDER.COMPONENT.SELECT_LIST'))
        .setCustomId('reminder_select');

    let emb;
    if (reminders.length) {
      emb = embed({ title: `🔔 ${st.__('REMINDER.LIST')}` });

      reminders.forEach(r => {
        selectMenu.addOptions([
          new SelectMenuOptionBuilder().setLabel(r.id).setValue(r.id).setDescription(truncate(r.content, 100)),
        ]);
        emb.addFields([
          {
            name: `**${r.id}**`,
            value: `📄 **${st.__('GENERIC.CONTENT')}:** ${truncate(r.content, 300)}\n📅 **${st.__(
              'GENERIC.TIMESTAMP',
            )}:** ${toUTS(r.timestamp)}`,
          },
        ]);
      });

      rows.push(new ActionRowBuilder().addComponents([selectMenu]));
    } else {
      emb = embed({ title: `🔕 ${st.__('REMINDER.LIST')}` })
        .setColor(colors.red)
        .setDescription(st.__('ERROR.REMINDER.EMPTY'));
    }

    if (!ephemeralO) rows.push(new ActionRowBuilder().addComponents([mdBtn]));

    return interaction.editReply({
      components: rows,
      embeds: [emb],
    });
  }
  if (interaction.isSelectMenu()) {
    if (message.interaction.user.id !== user.id) {
      return interaction.reply({
        embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.UNALLOWED.COMMAND'))],
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
      emb = embed({ title: `🔔 ${st.__('REMINDER.INFO')}` }).addFields([
        {
          name: `📄 ${st.__('GENERIC.CONTENT')}`,
          value: reminder.content,
        },
        {
          inline: true,
          name: `🏷️ ${st.__('GENERIC.ID')}`,
          value: `\`${reminder.id}\``,
        },
        {
          inline: true,
          name: `${emojis.channelText} ${st.__('GENERIC.CHANNEL')}`,
          value: reminder.channelId ? `<#${reminder.channelId}> - \`${reminder.channelId}\`` : 'DM',
        },
        {
          inline: true,
          name: `📅 ${st.__('GENERIC.TIMESTAMP')}`,
          value: toUTS(reminder.timestamp),
        },
        {
          inline: true,
          name: `📅 ${st.__('GENERIC.CREATION_DATE')}`,
          value: toUTS(SnowflakeUtil.timestampFrom(reminder.id)),
        },
      ]);

      rows.push(
        new ActionRowBuilder().addComponents([
          new ButtonBuilder()
            .setLabel(st.__('GENERIC.COMPONENT.BACK'))
            .setEmoji('↩️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('reminder_list'),
        ]),
      );
    } else {
      const selectMenu = new SelectMenuBuilder()
        .setPlaceholder(st.__('REMINDER.COMPONENT.SELECT_LIST'))
        .setCustomId('reminder_select');

      if (reminders.length) {
        emb = embed({ title: `🔔 ${st.__('REMINDER.LIST')}` });
        reminders.forEach(r => {
          selectMenu.addOptions([
            new SelectMenuOptionBuilder().setLabel(r.id).setValue(r.id).setDescription(truncate(r.content, 100)),
          ]);
          emb.addFields([
            {
              name: `**${r.id}**`,
              value: `📄 **${st.__('GENERIC.CONTENT')}:** ${truncate(r.content, 300)}\n📅 **${st.__(
                'GENERIC.TIMESTAMP',
              )}:** ${toUTS(r.timestamp)}`,
            },
          ]);
        });

        rows.push(new ActionRowBuilder().addComponents([selectMenu]));
      } else {
        emb = embed({ title: `🔕 ${st.__('REMINDER.LIST')}` })
          .setColor(colors.red)
          .setDescription(st.__('ERROR.REMINDER.EMPTY'));
      }
    }

    if (!ephemeralO) rows[0].addComponents([mdBtn]);

    await interaction.editReply({
      components: rows,
      embeds: [emb],
    });

    if (!reminder) {
      return interaction.followUp({
        embeds: [
          embed({ type: 'error' }).setDescription(st.__mf('ERROR.REMINDER.NOT_FOUND', { reminderId: values[0] })),
        ],
        ephemeral: true,
      });
    }
  }
}
