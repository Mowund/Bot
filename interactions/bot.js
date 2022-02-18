import process from 'node:process';
import {
  ActionRow,
  ApplicationCommandOptionType,
  ButtonComponent,
  ButtonStyle,
  ShardClientUtil,
  version,
} from 'discord.js';
import { colors, emojis, supportServer } from '../defaults.js';
import { toUTS, botInvite, msToTime } from '../utils.js';

export const data = [
  {
    description: 'Bot related commands',
    name: 'bot',
    options: [
      {
        description: "Send bot's information",
        name: 'info',
        options: [
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            name: 'ephemeral',
            type: ApplicationCommandOptionType.Boolean,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
];
export async function execute({ client, interaction, st, embed }) {
  const { guild, options } = interaction,
    botMember = guild?.members.cache.get(client.user.id),
    ephemeralO = options?.getBoolean('ephemeral') ?? true;

  if (interaction.isChatInputCommand()) {
    if (options?.getSubcommand() === 'info') {
      await interaction.deferReply({ ephemeral: ephemeralO });

      const guildCmds = client.splitCmds(await client.application.commands.fetch({ guildId: interaction.guild.id })),
        embs = [
          embed({ title: st.__mf('BOT.INFO.TITLE', { botName: client.user.username }) })
            .setColor(botMember?.displayColor || colors.blurple)
            .addField({
              inline: true,
              name: `${emojis.serverDiscovery} ${st.__('GENERIC.SERVERS')}`,
              value: `\`${(await client.shard.fetchClientValues('guilds.cache.size')).reduce(
                (acc, c) => acc + c,
                0,
              )}\``,
            })
            .addField({
              inline: true,
              name: `${emojis.members} ${st.__('GENERIC.MEMBERS')}`,
              value: `\`${(
                await client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0))
              ).reduce((acc, c) => acc + c, 0)}\``,
            })
            .addField({
              inline: true,
              name: `${emojis.commands} ${st.__('GENERIC.COMMANDS')} [${client.splitedCmds.size}${
                guildCmds.size ? ` + ${guildCmds.size}` : ''
              }]`,
              value: `${emojis.slashCommand} \`${client.splitedCmds.filter(c => c.type === 1).size}\`${
                guildCmds.filter(c => c.type === 1).size ? ` + \`${guildCmds.filter(c => c.type === 1).size}\`` : ''
              }\n${emojis.contextMenuCommand} \`${client.splitedCmds.filter(c => c.type > 1).size}\`${
                guildCmds.filter(c => c.type > 1).size ? ` + \`${guildCmds.filter(c => c.type > 1).size}\`` : ''
              }`,
            })
            .addField({
              inline: true,
              name: `${emojis.ramMemory} ${st.__('BOT.INFO.MEMORY_USAGE')}`,
              value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`/\`${(
                process.memoryUsage().heapTotal /
                1024 /
                1024
              ).toFixed(2)} MB\``,
            })
            .addField({
              inline: true,
              name: `${emojis.discordJS} ${st.__('BOT.INFO.DISCORDJS_VERSION')}`,
              value: `\`${version}\``,
            })
            .addField({
              inline: true,
              name: `${emojis.nodeJS} ${st.__('BOT.INFO.NODEJS_VERSION')}`,
              value: `\`${process.version.slice(1)}\``,
            })
            .addField({
              inline: true,
              name: `💎 ${st.__('PING.SHARD')}`,
              value: `**${st.__('GENERIC.CURRENT')}:** \`${ShardClientUtil.shardIdForGuildId(
                guild.id,
                client.shard.count,
              )}\`\n**${st.__('GENERIC.TOTAL')}:** \`${client.shard.count}\` `,
            })
            .addField({
              inline: true,
              name: `🕑 ${st.__('GENERIC.UPTIME')}`,
              value: `\`${msToTime(client.uptime)}\` | ${toUTS(Date.now() - client.uptime)}`,
            })
            .addField({
              inline: true,
              name: `📅 ${st.__('GENERIC.CREATION_DATE')}`,
              value: toUTS(client.user.createdAt),
            }),
        ],
        rows = [
          new ActionRow().addComponents(
            new ButtonComponent()
              .setLabel(st.__('BOT.INFO.COMPONENT.INVITE_BOT'))
              .setEmoji({ name: '📖' })
              .setStyle(ButtonStyle.Link)
              .setURL(botInvite(client.user.id)),
            new ButtonComponent()
              .setLabel(st.__('BOT.INFO.COMPONENT.SUPPORT_SERVER'))
              .setEmoji({ name: '📖' })
              .setStyle(ButtonStyle.Link)
              .setURL(supportServer.invite),
          ),
        ];

      if (!ephemeralO) {
        rows.push(
          new ActionRow().addComponents(
            new ButtonComponent()
              .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
              .setEmoji({ name: '🧹' })
              .setStyle(ButtonStyle.Danger)
              .setCustomId('generic_message_delete'),
          ),
        );
      }

      return interaction.editReply({
        components: rows,
        embeds: embs,
      });
    }
  }
}
