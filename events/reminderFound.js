import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, SnowflakeUtil } from 'discord.js';
import { colors, debugMode, emojis, imgOpts } from '../defaults.js';
import { toUTS } from '../utils.js';

export const eventName = 'reminderFound';
export async function execute({ client, i18n }, reminder) {
  const { channelId, content, id, isRecursive, timestamp, userId } = reminder,
    channel = client.channels.cache.get(channelId),
    member = channel?.guild.members.cache.get(userId),
    user = userId && (await client.users.fetch(userId)),
    idTimestamp = SnowflakeUtil.timestampFrom(id),
    mdBtn = new ButtonBuilder()
      .setLabel(i18n.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
      .setEmoji('🧹')
      .setStyle(ButtonStyle.Danger)
      .setCustomId('generic_message_delete');

  if (!user) return;

  const emb = new EmbedBuilder()
    .setColor(colors.yellow)
    .setTitle(`${emojis.bellRinging} ${i18n.__('REMINDER.NEW')}`)
    .addFields([
      {
        name: `📄 ${i18n.__('GENERIC.CONTENT')}`,
        value: content,
      },
      {
        inline: true,
        name: `🏷️ ${i18n.__('GENERIC.ID')}`,
        value: `\`${id}\``,
      },
      {
        inline: true,
        name: `📅 ${i18n.__('GENERIC.CREATION_DATE')}`,
        value: toUTS(idTimestamp),
      },
    ])
    .setFooter({
      iconURL: `${(member ?? user).displayAvatarURL(imgOpts)}&messageOwners=${userId}`,
      text: i18n.__mf(`REMINDER.TO`, {
        userName: member?.displayName ?? user.username,
      }),
    })
    .setTimestamp(timestamp);

  if (channelId) {
    if (!channel) {
      return user.send({
        components: [new ActionRowBuilder().addComponents([mdBtn])],
        embeds: [
          emb.setDescription(
            `You asked me to remind you in a specific channel (\`${channelId}\`) but it was not found`,
          ),
        ],
      });
    }
    return channel.send({
      allowedMentions: { users: [user.id] },
      components: [new ActionRowBuilder().addComponents([mdBtn])],
      content: `${user}`,
      embeds: [emb.setDescription(`You asked me to remind you here`)],
    });
  }

  return user.send({
    components: [new ActionRowBuilder().addComponents([mdBtn])],
    embeds: [emb.setDescription(`You asked me to remind you here`)],
  });
}
