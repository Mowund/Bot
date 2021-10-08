const { ShardClientUtil } = require('discord.js');
const utils = require('../utils');
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
          required: false,
        },
        {
          name: 'ephemeral',
          description: 'Send reply as an ephemeral message. Defaults to true.',
          type: 'BOOLEAN',
          required: false,
        },
      ],
    },
  ],
  async execute(client, interaction, getTS, emb) {
    var { guild, options } = interaction;
    var deferO = options?.getBoolean('defer') ?? false;
    var ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (interaction.isCommand()) {
      if (deferO) {
        await interaction.deferReply({ ephemeral: ephemeralO });
        let itc = await interaction.fetchReply();
        let timeNow = Date.now();
        emb = emb()
          .setTitle(
            '🏓 ' +
              getTS(['PING', 'TITLE']) +
              ' (' +
              getTS(['PING', 'DEFERRED']) +
              ')'
          )
          .addField(
            '⏱️ ' + getTS(['PING', 'TIME', 'DEFERMENT']),
            '`' + (itc.createdTimestamp - interaction.createdTimestamp) + 'ms`',
            true
          )
          .addField(
            '📝 ' + getTS(['PING', 'TIME', 'EDITING']),
            '`' + (timeNow - itc.createdTimestamp) + 'ms`',
            true
          )
          .addField(
            '⌛ ' + getTS(['PING', 'TIME', 'RESPONSE']),
            '`' + (timeNow - interaction.createdTimestamp) + 'ms`',
            true
          )
          .addField(
            '💓 ' + getTS(['PING', 'API_LATENCY']),
            '`' + Math.round(client.ws.ping) + 'ms`',
            true
          )
          .addField(
            '🕑 ' + getTS(['PING', 'UPTIME']),
            '`' + msToTime(client.uptime) + '`',
            true
          );

        if (interaction.inGuild())
          emb = emb.addField(
            '💎 ' + getTS(['PING', 'SHARD']),
            '**' +
              getTS(['GENERIC', 'CURRENT']) +
              ':** `' +
              ShardClientUtil.shardIdForGuildId(guild.id, client.shard.count) +
              '`\n**' +
              getTS(['GENERIC', 'TOTAL']) +
              ':** `' +
              client.shard.count +
              '` ',
            false
          );
        interaction.editReply({
          embeds: [emb],
        });
      } else {
        let timeNow = Date.now();
        emb = emb()
          .setTitle('🏓 ' + getTS(['PING', 'TITLE']))
          .addField(
            '⌛ ' + getTS(['PING', 'TIME', 'RESPONSE']),
            '`' + (timeNow - interaction.createdTimestamp) + 'ms`',
            true
          )
          .addField(
            '💓 ' + getTS(['PING', 'API_LATENCY']),
            '`' + Math.round(client.ws.ping) + 'ms`',
            true
          )
          .addField(
            '🕑 ' + getTS(['PING', 'UPTIME']),
            '`' + msToTime(client.uptime) + '` ',
            false
          );

        if (interaction.inGuild())
          emb = emb.addField(
            '💎 ' + getTS(['PING', 'SHARD']),
            '**' +
              getTS(['GENERIC', 'CURRENT']) +
              ':** `' +
              ShardClientUtil.shardIdForGuildId(guild.id, client.shard.count) +
              '`\n**' +
              getTS(['GENERIC', 'TOTAL']) +
              ':** `' +
              client.shard.count +
              '` ',
            false
          );
        interaction.reply({
          embeds: [emb],
          ephemeral: ephemeralO,
        });
      }

      function msToTime(ms) {
        let days = Math.floor(ms / 86400000);
        let hours = Math.floor((ms % 86400000) / 3600000);
        let minutes = Math.floor((ms % 3600000) / 60000);
        let sec = Math.floor((ms % 60000) / 1000);

        let str = '';
        if (days) str = str + days + 'd ';
        if (hours) str = str + hours + 'h ';
        if (minutes) str = str + minutes + 'm ';
        if (sec) str = sec + 's';

        return str;
      }
    }
  },
};
