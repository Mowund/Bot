import { ShardClientUtil, BaseInteraction } from 'discord.js';
import { Command, CommandArgs } from '../../lib/structures/Command.js';

export default class Ping extends Command {
  constructor() {
    super([
      {
        description: 'PING.DESCRIPTION',
        name: 'PING.NAME',
      },
    ]);
  }

  async run(args: CommandArgs, interaction: BaseInteraction<'cached'>): Promise<any> {
    if (!interaction.isChatInputCommand()) return;

    const { client, embed } = args,
      { i18n } = client,
      { guild, options } = interaction,
      ephemeralO = options?.getBoolean('ephemeral') ?? true,
      itc = await interaction.deferReply({ ephemeral: ephemeralO, fetchReply: true }),
      emb = embed({ title: `🏓 ${i18n.__('PING.TITLE')}` }).addFields(
        {
          inline: true,
          name: `⌛ ${i18n.__('PING.RESPONSE_TIME')}`,
          value: `\`${itc.createdTimestamp - interaction.createdTimestamp}ms\``,
        },
        {
          inline: true,
          name: `💓 ${i18n.__('PING.API_LATENCY')}`,
          value: `\`${Math.round(client.ws.ping)}ms\``,
        },
      );

    if (interaction.inGuild()) {
      emb.addFields({
        name: `💎 ${i18n.__('PING.SHARD')}`,
        value: `**${i18n.__('GENERIC.CURRENT')}:** \`${ShardClientUtil.shardIdForGuildId(
          guild.id,
          client.shard.count,
        )}\`\n**${i18n.__('GENERIC.TOTAL')}:** \`${client.shard.count}\``,
      });
    }

    return interaction.editReply({
      embeds: [emb],
    });
  }
}
