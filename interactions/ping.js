import { ShardClientUtil, ActionRow, ButtonComponent, ButtonStyle, ApplicationCommandOptionType } from 'discord.js';
export const data = [
  {
    description: "Shows bot's latency",
    name: 'ping',
    options: [
      {
        description: 'Defers the interaction (Default: False)',
        name: 'defer',
        type: ApplicationCommandOptionType.Boolean,
      },
      {
        description: 'Send reply as an ephemeral message (Default: True)',
        name: 'ephemeral',
        type: ApplicationCommandOptionType.Boolean,
      },
    ],
  },
];
export async function execute({ client, interaction, st, embed }) {
  const { guild, options } = interaction,
    deferO = options?.getBoolean('defer') ?? false,
    ephemeralO = options?.getBoolean('ephemeral') ?? true;

  if (interaction.isChatInputCommand()) {
    const rows = !ephemeralO
      ? [
          new ActionRow().addComponents(
            new ButtonComponent()
              .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
              .setEmoji({ name: '🧹' })
              .setStyle(ButtonStyle.Danger)
              .setCustomId('generic_message_delete'),
          ),
        ]
      : [];

    if (deferO) {
      const itc = await interaction.deferReply({ ephemeral: ephemeralO, fetchReply: true }),
        timeNow = Date.now();

      embed = embed({ title: `🏓 ${st.__('PING.TITLE')} (${st.__('PING.DEFERRED')})` })
        .addField({
          inline: true,
          name: `⏱️ ${st.__('PING.TIME.DEFERMENT')}`,
          value: `\`${itc.createdTimestamp - interaction.createdTimestamp}ms\``,
        })
        .addField({
          inline: true,
          name: `📝 ${st.__('PING.TIME.EDITING')}`,
          value: `\`${timeNow - itc.createdTimestamp}ms\``,
        })
        .addField({
          inline: true,
          name: `⌛ ${st.__('PING.TIME.RESPONSE')}`,
          value: `\`${timeNow - interaction.createdTimestamp}ms\``,
        })
        .addField({
          inline: true,
          name: `💓 ${st.__('PING.API_LATENCY')}`,
          value: `\`${Math.round(client.ws.ping)}ms\``,
        });

      if (interaction.inGuild()) {
        embed = embed.addField({
          inline: true,
          name: `💎 ${st.__('PING.SHARD')}`,
          value: `**${st.__('GENERIC.CURRENT')}:** \`${ShardClientUtil.shardIdForGuildId(
            guild.id,
            client.shard.count,
          )}\`\n**${st.__('GENERIC.TOTAL')}:** \`${client.shard.count}\` `,
        });
      }

      return interaction.editReply({
        components: rows,
        embeds: [embed],
      });
    }
    embed = embed({ title: `🏓 ${st.__('PING.TITLE')}` })
      .addField({
        inline: true,
        name: `⌛ ${st.__('PING.TIME.RESPONSE')}`,
        value: `\`${Date.now() - interaction.createdTimestamp}ms\``,
      })
      .addField({
        inline: true,
        name: `💓 ${st.__('PING.API_LATENCY')}`,
        value: `\`${Math.round(client.ws.ping)}ms\``,
      });

    if (interaction.inGuild()) {
      embed = embed.addField({
        name: `💎 ${st.__('PING.SHARD')}`,
        value: `**${st.__('GENERIC.CURRENT')}:** \`${ShardClientUtil.shardIdForGuildId(
          guild.id,
          client.shard.count,
        )}\`\n**${st.__('GENERIC.TOTAL')}:** \`${client.shard.count}\` `,
      });
    }

    return interaction.reply({
      components: rows,
      embeds: [embed],
      ephemeral: ephemeralO,
    });
  }
}
