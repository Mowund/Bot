import process from 'node:process';
import { readFileSync } from 'node:fs';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ShardClientUtil,
  version,
} from 'discord.js';
import { colors, emojis, supportServer } from '../defaults.js';
import { toUTS, botInvite, msToTime } from '../utils.js';

export const data = [
  {
    description: 'Bot related commands',
    description_localizations: { 'pt-BR': 'Comandos relacionados ao bot' },
    name: 'bot',
    name_localizations: {},
    options: [
      {
        description: "Send bot's information",
        description_localizations: { 'pt-BR': 'Envia as informações do bot' },
        name: 'info',
        name_localizations: {},
        options: [
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            description_localizations: { 'pt-BR': 'Envia a resposta como uma mensagem efêmera (Padrão: Verdadeiro)' },
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
  const { client, guild, options } = interaction,
    botMember = guild?.members.cache.get(client.user.id),
    ephemeralO = options?.getBoolean('ephemeral') ?? true,
    pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));

  if (interaction.isChatInputCommand()) {
    switch (options?.getSubcommand()) {
      case 'info': {
        await interaction.deferReply({ ephemeral: ephemeralO });

        const guildCmds = interaction.inGuild()
            ? client.splitCmds(await client.application.commands.fetch({ guildId: interaction.guild.id }))
            : [],
          embs = [
            embed({ title: st.__mf('BOT.INFO.TITLE', { botName: client.user.username }) })
              .setColor(botMember?.displayColor || colors.blurple)
              .addFields([
                {
                  inline: true,
                  name: `${emojis.serverDiscovery} ${st.__('GENERIC.SERVERS')}`,
                  value: `\`${(await client.shard.fetchClientValues('guilds.cache.size')).reduce(
                    (acc, c) => acc + c,
                    0,
                  )}\``,
                },
                {
                  inline: true,
                  name: `${emojis.members} ${st.__('GENERIC.MEMBERS')}`,
                  value: `\`${(
                    await client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0))
                  ).reduce((acc, c) => acc + c, 0)}\``,
                },
                {
                  inline: true,
                  name: `${emojis.commands} ${st.__('GENERIC.COMMANDS')} [${client.splitedCmds.size}${
                    guildCmds.size ? ` + ${guildCmds.size}` : ''
                  }]`,
                  value: `${emojis.slashCommand} \`${client.splitedCmds.filter(c => c.type === 1).size}\`${
                    guildCmds.filter(c => c.type === 1).size ? ` + \`${guildCmds.filter(c => c.type === 1).size}\`` : ''
                  }\n${emojis.contextMenuCommand} \`${client.splitedCmds.filter(c => c.type > 1).size}\`${
                    guildCmds.filter(c => c.type > 1).size ? ` + \`${guildCmds.filter(c => c.type > 1).size}\`` : ''
                  }`,
                },
                {
                  inline: true,
                  name: `${emojis.ramMemory} ${st.__('BOT.INFO.MEMORY_USAGE')}`,
                  value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`/\`${(
                    process.memoryUsage().heapTotal /
                    1024 /
                    1024
                  ).toFixed(2)} MB\``,
                },
                {
                  inline: true,
                  name: `${emojis.discordJS} ${st.__('BOT.INFO.DISCORDJS_VERSION')}`,
                  value: `[\`${version}\`](https://discord.js.org)`,
                },
                {
                  inline: true,
                  name: `${emojis.nodeJS} ${st.__('BOT.INFO.NODEJS_VERSION')}`,
                  value: `[\`${process.version.slice(1)}\`](https://nodejs.org)`,
                },
              ]),
          ],
          rows = [
            new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setLabel('GitHub')
                .setEmoji(emojis.github)
                .setStyle(ButtonStyle.Link)
                .setURL(pkg.repository.url),
              new ButtonBuilder()
                .setLabel(st.__('BOT.INFO.COMPONENT.INVITE_BOT'))
                .setEmoji('📖')
                .setStyle(ButtonStyle.Link)
                .setURL(botInvite(client.user.id)),
              new ButtonBuilder()
                .setLabel(st.__('BOT.INFO.COMPONENT.SUPPORT_SERVER'))
                .setEmoji('📖')
                .setStyle(ButtonStyle.Link)
                .setURL(supportServer.invite),
            ]),
          ];

        if (guild) {
          embs[0].addFields([
            {
              inline: true,
              name: `💎 ${st.__('PING.SHARD')}`,
              value: `**${st.__('GENERIC.CURRENT')}:** \`${ShardClientUtil.shardIdForGuildId(
                guild.id,
                client.shard.count,
              )}\`\n**${st.__('GENERIC.TOTAL')}:** \`${client.shard.count}\` `,
            },
          ]);
        }

        embs[0].addFields([
          {
            inline: true,
            name: `🕑 ${st.__('GENERIC.UPTIME')}`,
            value: `\`${msToTime(client.uptime)}\` | ${toUTS(Date.now() - client.uptime)}`,
          },
          {
            inline: true,
            name: `📅 ${st.__('GENERIC.CREATION_DATE')}`,
            value: toUTS(client.user.createdAt),
          },
        ]);

        if (!ephemeralO) {
          rows.push(
            new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                .setEmoji('🧹')
                .setStyle(ButtonStyle.Danger)
                .setCustomId('generic_message_delete'),
            ]),
          );
        }

        return interaction.editReply({
          components: rows,
          embeds: embs,
        });
      }
    }
  }
}
