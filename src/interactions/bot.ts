import process from 'node:process';
import { readFileSync } from 'node:fs';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
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

    const { client, embed, localize } = args,
      { database, globalCommandCount } = client,
      { guild, guildId, options, user } = interaction,
      botMember = guild?.members.cache.get(client.user.id),
      settings = await database.users.fetch(user.id),
      isEphemeral = settings?.ephemeralResponses,
      pkg = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url)).toString());

    switch (options.getSubcommand()) {
      case 'info': {
        await interaction.deferReply({ ephemeral: isEphemeral });

        const guildCommandCount =
            guildId && client.countCommands(await client.application.commands.fetch({ guildId: guildId })),
          embs = [
            embed({ title: localize('BOT.OPTIONS.INFO.TITLE', { botName: client.user.username }) })
              .setColor(botMember?.displayColor || Colors.Blurple)
              .addFields(
                {
                  inline: true,
                  name: `${emojis.serverDiscovery} ${localize('GENERIC.SERVERS')}`,
                  value: `\`${((await client.shard.fetchClientValues('guilds.cache.size')) as number[]).reduce(
                    (acc, c) => acc + c,
                    0,
                  )}\``,
                },
                {
                  inline: true,
                  name: `${emojis.members} ${localize('GENERIC.MEMBERS')}`,
                  value: `\`${(
                    await client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0))
                  ).reduce((acc, c) => acc + c, 0)}\``,
                },
                {
                  inline: true,
                  name: `${emojis.commands} ${localize('GENERIC.COMMANDS')} [${globalCommandCount.sum.all}${
                    guildCommandCount.sum.all ? ` + ${guildCommandCount.sum.all}` : ''
                  }]`,
                  value: `${emojis.slashCommand} \`${globalCommandCount.chatInput}\`${
                    guildCommandCount.chatInput ? ` + \`${guildCommandCount.chatInput}\`` : ''
                  }\n${emojis.contextMenuCommand} \`${globalCommandCount.sum.contextMenu}\`${
                    guildCommandCount.sum.contextMenu ? ` + \`${guildCommandCount.sum.contextMenu}\`` : ''
                  }`,
                },
                {
                  inline: true,
                  name: `${emojis.ramMemory} ${localize('BOT.OPTIONS.INFO.MEMORY_USAGE')}`,
                  value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`/\`${(
                    process.memoryUsage().heapTotal /
                    1024 /
                    1024
                  ).toFixed(2)} MB\``,
                },
                {
                  inline: true,
                  name: `${emojis.discordJS} ${localize('BOT.OPTIONS.INFO.DISCORDJS_VERSION')}`,
                  value: `[\`${version}\`](https://discord.js.org)`,
                },
                {
                  inline: true,
                  name: `${emojis.nodeJS} ${localize('BOT.OPTIONS.INFO.NODEJS_VERSION')}`,
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
                .setLabel(localize('BOT.OPTIONS.INFO.COMPONENT.INVITE_BOT'))
                .setEmoji('📖')
                .setStyle(ButtonStyle.Link)
                .setURL(botInvite(client.user.id)),
              new ButtonBuilder()
                .setLabel(localize('BOT.OPTIONS.INFO.COMPONENT.SUPPORT_SERVER'))
                .setEmoji('📖')
                .setStyle(ButtonStyle.Link)
                .setURL(supportServer.invite),
            ),
          ];

        if (guild) {
          embs[0].addFields({
            inline: true,
            name: `💎 ${localize('PING.SHARD')}`,
            value: `**${localize('GENERIC.CURRENT')}:** \`${ShardClientUtil.shardIdForGuildId(
              guildId,
              client.shard.count,
            )}\`\n**${localize('GENERIC.TOTAL')}:** \`${client.shard.count}\` `,
          });
        }

        embs[0].addFields(
          {
            inline: true,
            name: `🕑 ${localize('GENERIC.UPTIME')}`,
            value: `\`${msToTime(client.uptime)}\` | ${toUTS(Date.now() - client.uptime)}`,
          },
          {
            inline: true,
            name: `📅 ${localize('GENERIC.CREATION_DATE')}`,
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
