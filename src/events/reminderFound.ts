import {
  SnowflakeUtil,
  GuildTextBasedChannel,
  Colors,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Snowflake,
} from 'discord.js';
import { emojis } from '../defaults.js';
import { toUTS } from '../utils.js';
import { AppEvents, Event } from '../../lib/structures/Event.js';
import { App } from '../../lib/App.js';
import { ReminderData } from '../../lib/structures/ReminderData.js';

export default class ReminderFoundEvent extends Event {
  constructor() {
    super(AppEvents.ReminderFound);
  }

  async run(client: App, reminder: ReminderData): Promise<any> {
    const { i18n } = client,
      { channelId, content, id, isRecursive, msTime, timestamp, userId } = reminder,
      channel = client.channels.cache.get(channelId) as GuildTextBasedChannel,
      member = channel?.guild.members.cache.get(userId),
      user = await client.users.fetch(userId),
      idTimestamp = SnowflakeUtil.timestampFrom(id);

    await client.database.reminders.delete(id, userId);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel(i18n.__('REMINDER.COMPONENT.LIST'))
          .setEmoji('🗒️')
          .setStyle(ButtonStyle.Primary)
          .setCustomId('reminder_list'),
      ),
      fields = [
        {
          name: `📄 ${i18n.__('GENERIC.CONTENT')}`,
          value: content,
        },
        {
          inline: true,
          name: `🪪 ${i18n.__('GENERIC.ID')}`,
          value: `\`${id}\``,
        },
        {
          inline: true,
          name: `📅 ${i18n.__('GENERIC.CREATION_DATE')}`,
          value: toUTS(idTimestamp),
        },
      ],
      params: { messageOwners: Snowflake; reminderId?: Snowflake } = { messageOwners: userId };

    if (isRecursive) {
      const recReminderId = SnowflakeUtil.generate().toString(),
        recReminder = await client.database.reminders.set(recReminderId, user.id, {
          channelId: channelId,
          content: content,
          isRecursive,
          msTime,
          timestamp: SnowflakeUtil.timestampFrom(recReminderId) + msTime,
          userId: user.id,
        });

      params.reminderId = recReminderId;
      fields.push({
        name: `🔁 ${i18n.__('GENERIC.RECURSIVE')}`,
        value: i18n.__mf('REMINDER.RECURSIVE.DESCRIPTION', { timestamp: toUTS(recReminder.timestamp) }),
      });

      row.addComponents(
        new ButtonBuilder()
          .setLabel(i18n.__('GENERIC.EDIT'))
          .setEmoji('📝')
          .setStyle(ButtonStyle.Secondary)
          .setCustomId('reminder_edit'),
      );
    }

    const emb = client
      .embedBuilder({
        addParams: params,
        color: Colors.Yellow,
        member,
        timestamp,
        title: `${emojis.bellRinging} ${i18n.__('REMINDER.NEW')}`,
        user,
      })
      .addFields(fields);

    if (channelId) {
      if (!channel) {
        return user.send({
          components: [row],
          embeds: [
            emb.setDescription(
              `You asked me to remind you in a specific channel (\`${channelId}\`) but it was not found`,
            ),
          ],
        });
      }
      return channel.send({
        allowedMentions: { users: [user.id] },
        components: [row],
        content: `${user}`,
        embeds: [emb.setDescription(`You asked me to remind you here`)],
      });
    }

    return user.send({
      components: [row],
      embeds: [emb.setDescription(`You asked me to remind you here`)],
    });
  }
}
