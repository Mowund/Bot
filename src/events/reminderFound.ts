import { EmbedBuilder, SnowflakeUtil, GuildTextBasedChannel, Colors } from 'discord.js';
import { AppEvents, Event } from '../../lib/util/Event.js';
import { App } from '../../lib/App.js';
import { emojis, imgOpts } from '../defaults.js';
import { toUTS } from '../utils.js';

export default class ReminderFoundEvent extends Event {
  constructor() {
    super(AppEvents.ReminderFound);
  }

  async run(client: App, reminder: any): Promise<any> {
    await client.database.reminders.delete(reminder.id, reminder.userId);

    const { i18n } = client,
      { channelId, content, id, isRecursive, timestamp, userId } = reminder,
      channel = client.channels.cache.get(channelId) as GuildTextBasedChannel,
      member = channel?.guild.members.cache.get(userId),
      user = await client.users.fetch(userId),
      idTimestamp = SnowflakeUtil.timestampFrom(id);

    if (!user) return;
    const emb = new EmbedBuilder()
      .setColor(Colors.Yellow)
      .setTitle(`${emojis.bellRinging} ${i18n.__('REMINDER.NEW')}`)
      .addFields(
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
      )
      .setFooter({
        iconURL: `${(member ?? user).displayAvatarURL(imgOpts)}&messageOwners=${userId}`,
        text: i18n.__mf(`REMINDER.TO`, {
          userName: member?.displayName ?? user.username,
        }),
      })
      .setTimestamp(timestamp);

    if (isRecursive) {
      const recReminderId = SnowflakeUtil.generate().toString(),
        recReminder = await client.database.reminders.set(recReminderId, user.id, {
          channelId: channelId,
          content: content,
          timestamp: SnowflakeUtil.timestampFrom(recReminderId) + (SnowflakeUtil.timestampFrom(id) - timestamp),
          userId: user.id,
        });
      emb.addFields({
        name: `🔁 ${i18n.__('REMINDER.RECURSIVE')}`,
        value: i18n.__mf('REMINDER.RECURSIVE_DESCRIPTION', { timestamp: recReminder.timestamp }),
      });
    }

    if (channelId) {
      if (!channel) {
        return user.send({
          embeds: [
            emb.setDescription(
              `You asked me to remind you in a specific channel (\`${channelId}\`) but it was not found`,
            ),
          ],
        });
      }
      return channel.send({
        allowedMentions: { users: [user.id] },
        content: `${user}`,
        embeds: [emb.setDescription(`You asked me to remind you here`)],
      });
    }

    return user.send({
      embeds: [emb.setDescription(`You asked me to remind you here`)],
    });
  }
}
