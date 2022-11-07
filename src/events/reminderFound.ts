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
    const { database } = client,
      { channelId, content, id, isRecursive, msTime, timestamp, userId } = reminder,
      channel = client.channels.cache.get(channelId) as GuildTextBasedChannel;

    if (
      !channel &&
      (await client.shard.broadcastEval((c, { cI }) => c.channels.cache.get(cI), { context: { cI: channelId } })).find(
        c => c,
      )
    )
      return;

    await client.database.reminders.delete(id, userId);

    const locale = (await database.users.fetch(userId))?.locale || 'en-US',
      localize = (phrase: string, replace?: Record<string, any>) => client.localize({ locale, phrase }, replace),
      member = channel?.guild.members.cache.get(userId),
      user = await client.users.fetch(userId),
      idTimestamp = SnowflakeUtil.timestampFrom(id),
      row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel(localize('REMINDER.COMPONENT.LIST'))
          .setEmoji('🗒️')
          .setStyle(ButtonStyle.Primary)
          .setCustomId('reminder_list'),
      ),
      fields = [
        {
          name: `📄 ${localize('GENERIC.CONTENT.CONTENT')}`,
          value: content,
        },
        {
          inline: true,
          name: `🪪 ${localize('GENERIC.ID')}`,
          value: `\`${id}\``,
        },
        {
          inline: true,
          name: `📅 ${localize('GENERIC.CREATION_DATE')}`,
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
        name: `🔁 ${localize('GENERIC.RECURSIVE')}`,
        value: localize('REMINDER.RECURSIVE.ON', { timestamp: toUTS(recReminder.timestamp) }),
      });

      row.addComponents(
        new ButtonBuilder()
          .setLabel(localize('GENERIC.EDIT'))
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
        title: `${emojis.bellRinging} ${localize('REMINDER.NEW')}`,
        user,
      })
      .addFields(fields);

    if (channelId) {
      if (!channel && client.shard.ids.includes(0)) {
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

    if (client.shard.ids.includes(0)) {
      return user.send({
        components: [row],
        embeds: [emb.setDescription(`You asked me to remind you here`)],
      });
    }
  }
}
