import process from 'node:process';
import { readFileSync } from 'node:fs';
import {
  ActionRowBuilder,
  ApplicationCommandData,
  ApplicationCommandOptionType,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  Colors,
  ShardClientUtil,
  version,
} from 'discord.js';
import { emojis, supportServer } from '../defaults.js';
import { toUTS, botInvite, msToTime } from '../utils.js';
import { Command, CommandArgs } from '../../lib/structures/Command.js';

export default class Bot extends Command {
  constructor() {
    super([
      {
        description: 'BOT.DESCRIPTION',
        name: 'BOT.NAME',
        options: [
          {
            description: 'BOT.OPTIONS.INFO.DESCRIPTION',
            name: 'BOT.OPTIONS.INFO.NAME',
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
      },
    ]);
  }

  async run(args: CommandArgs, interaction: BaseInteraction<'cached'>): Promise<any> {
    if (!interaction.isChatInputCommand()) return;

    const { client, embed } = args,
      { i18n } = client,
      { guild, options } = interaction,
      botMember = guild?.members.cache.get(client.user.id),
      ephemeralO = options?.getBoolean('ephemeral') ?? true,
      pkg = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url)).toString());

    switch (options?.getSubcommand()) {
      case 'info': {
        await interaction.deferReply({ ephemeral: ephemeralO });

        const guildCmds = interaction.guild
            ? client.splitCmds(await client.application.commands.fetch({ guildId: interaction.guild.id }))
            : (new Collection() as Collection<string, ApplicationCommandData>),
          embs = [
            embed({ title: i18n.__mf('BOT.OPTIONS.INFO.TITLE', { botName: client.user.username }) })
              .setColor(botMember?.displayColor || Colors.Blurple)
              .addFields(
                {
                  inline: true,
                  name: `${emojis.serverDiscovery} ${i18n.__('GENERIC.SERVERS')}`,
                  value: `\`${((await client.shard.fetchClientValues('guilds.cache.size')) as number[]).reduce(
                    (acc, c) => acc + c,
                    0,
                  )}\``,
                },
                {
                  inline: true,
                  name: `${emojis.members} ${i18n.__('GENERIC.MEMBERS')}`,
                  value: `\`${(
                    await client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0))
                  ).reduce((acc, c) => acc + c, 0)}\``,
                },
                {
                  inline: true,
                  name: `${emojis.commands} ${i18n.__('GENERIC.COMMANDS')} [${client.splitedCmds.size}${
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
                  name: `${emojis.ramMemory} ${i18n.__('BOT.OPTIONS.INFO.MEMORY_USAGE')}`,
                  value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`/\`${(
                    process.memoryUsage().heapTotal /
                    1024 /
                    1024
                  ).toFixed(2)} MB\``,
                },
                {
                  inline: true,
                  name: `${emojis.discordJS} ${i18n.__('BOT.OPTIONS.INFO.DISCORDJS_VERSION')}`,
                  value: `[\`${version}\`](https://discord.js.org)`,
                },
                {
                  inline: true,
                  name: `${emojis.nodeJS} ${i18n.__('BOT.OPTIONS.INFO.NODEJS_VERSION')}`,
                  value: `[\`${process.version.slice(1)}\`](https://nodejs.org)`,
                },
              ),
          ],
          rows = [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel('GitHub')
                .setEmoji(emojis.github)
                .setStyle(ButtonStyle.Link)
                .setURL(pkg.repository.url),
              new ButtonBuilder()
                .setLabel(i18n.__('BOT.OPTIONS.INFO.COMPONENT.INVITE_BOT'))
                .setEmoji('📖')
                .setStyle(ButtonStyle.Link)
                .setURL(botInvite(client.user.id)),
              new ButtonBuilder()
                .setLabel(i18n.__('BOT.OPTIONS.INFO.COMPONENT.SUPPORT_SERVER'))
                .setEmoji('📖')
                .setStyle(ButtonStyle.Link)
                .setURL(supportServer.invite),
            ),
          ];

        if (guild) {
          embs[0].addFields({
            inline: true,
            name: `💎 ${i18n.__('PING.SHARD')}`,
            value: `**${i18n.__('GENERIC.CURRENT')}:** \`${ShardClientUtil.shardIdForGuildId(
              guild.id,
              client.shard.count,
            )}\`\n**${i18n.__('GENERIC.TOTAL')}:** \`${client.shard.count}\` `,
          });
        }

        embs[0].addFields(
          {
            inline: true,
            name: `🕑 ${i18n.__('GENERIC.UPTIME')}`,
            value: `\`${msToTime(client.uptime)}\` | ${toUTS(Date.now() - client.uptime)}`,
          },
          {
            inline: true,
            name: `📅 ${i18n.__('GENERIC.CREATION_DATE')}`,
            value: toUTS(client.user.createdTimestamp),
          },
        );

        return interaction.editReply({
          components: rows,
          embeds: embs,
        });
      }
    }
  }
}
