'use strict';

const { ShardClientUtil } = require('discord.js'),
  { msToTime } = require('../utils');
module.exports = {
  data: [
    {
      name: 'ping',
      description: "Shows bot's latency.",
      options: [
        {
          name: 'defer',
          description: 'Defers the interaction. Defaults to false.',
          type: 'BOOLEAN',
        },
        {
          name: 'ephemeral',
          description: 'Send reply as an ephemeral message. Defaults to true.',
          type: 'BOOLEAN',
        },
      ],
    },
  ],
  async execute(client, interaction, st, emb) {
    const { guild, options } = interaction,
      deferO = options?.getBoolean('defer') ?? false,
      ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (interaction.isCommand()) {
      if (deferO) {
        await interaction.deferReply({ ephemeral: ephemeralO });
        const itc = await interaction.fetchReply(),
          timeNow = Date.now();

        emb = emb({ title: `🏓 ${st.__('PING.TITLE')} (${st.__('PING.DEFERRED')})` })
          .addField(
            `⏱️ ${st.__('PING.TIME.DEFERMENT')}`,
            `\`${itc.createdTimestamp - interaction.createdTimestamp}ms\``,
            true,
          )
          .addField(`📝 ${st.__('PING.TIME.EDITING')}`, `\`${timeNow - itc.createdTimestamp}ms\``, true)
          .addField(`⌛ ${st.__('PING.TIME.RESPONSE')}`, `\`${timeNow - interaction.createdTimestamp}ms\``, true)
          .addField(`💓 ${st.__('PING.API_LATENCY')}`, `\`${Math.round(client.ws.ping)}ms\``, true)
          .addField(`🕑 ${st.__('PING.UPTIME')}`, `\`${msToTime(client.uptime)}\``, true);

        if (interaction.inGuild()) {
          emb = emb.addField(
            `💎 ${st.__('PING.SHARD')}`,
            `**${st.__('GENERIC.CURRENT')}:** \`${ShardClientUtil.shardIdForGuildId(
              guild.id,
              client.shard.count,
            )}\`\n**${st.__('GENERIC.TOTAL')}:** \`${client.shard.count}\` `,
            false,
          );
        }

        return interaction.editReply({
          embeds: [emb],
        });
      }
      emb = emb({ title: `🏓 ${st.__('PING.TITLE')}` })
        .addField(`⌛ ${st.__('PING.TIME.RESPONSE')}`, `\`${Date.now() - interaction.createdTimestamp}ms\``, true)
        .addField(`💓 ${st.__('PING.API_LATENCY')}`, `\`${Math.round(client.ws.ping)}ms\``, true)
        .addField(`🕑 ${st.__('PING.UPTIME')}`, `\`${msToTime(client.uptime)}\` `, false);

      if (interaction.inGuild()) {
        emb = emb.addField(
          `💎 ${st.__('PING.SHARD')}`,
          `**${st.__('GENERIC.CURRENT')}:** \`${ShardClientUtil.shardIdForGuildId(
            guild.id,
            client.shard.count,
          )}\`\n**${st.__('GENERIC.TOTAL')}:** \`${client.shard.count}\` `,
          false,
        );
      }

      return interaction.reply({
        embeds: [emb],
        ephemeral: ephemeralO,
      });
    }
  },
};
