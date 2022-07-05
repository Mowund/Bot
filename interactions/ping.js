import {
  ShardClientUtil,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
} from 'discord.js';
export const data = [
  {
    description: "Shows bot's latency",
    description_localizations: {
      'pt-BR': 'Mostra a latência do bot',
    },
    name: 'ping',
    name_localizations: {},
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
  },
];
export async function execute({ embed, interaction, st }) {
  const { client, guild, options } = interaction,
    ephemeralO = options?.getBoolean('ephemeral') ?? true;

  if (interaction.isChatInputCommand()) {
    const rows = !ephemeralO
        ? [
            new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                .setEmoji('🧹')
                .setStyle(ButtonStyle.Danger)
                .setCustomId('generic_message_delete'),
            ]),
          ]
        : [],
      itc = await interaction.deferReply({ ephemeral: ephemeralO, fetchReply: true });

    embed = embed({ title: `🏓 ${st.__('PING.TITLE')}` }).addFields([
      {
        inline: true,
        name: `⌛ ${st.__('PING.TIME.RESPONSE')}`,
        value: `\`${itc.createdTimestamp - interaction.createdTimestamp}ms\``,
      },
      {
        inline: true,
        name: `💓 ${st.__('PING.API_LATENCY')}`,
        value: `\`${Math.round(client.ws.ping)}ms\``,
      },
    ]);

    if (interaction.inGuild()) {
      embed = embed.addFields([
        {
          name: `💎 ${st.__('PING.SHARD')}`,
          value: `**${st.__('GENERIC.CURRENT')}:** \`${ShardClientUtil.shardIdForGuildId(
            guild.id,
            client.shard.count,
          )}\`\n**${st.__('GENERIC.TOTAL')}:** \`${client.shard.count}\` `,
        },
      ]);
    }

    return interaction.editReply({
      components: rows,
      embeds: [embed],
    });
  }
}
