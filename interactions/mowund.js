import { readdirSync } from 'node:fs';
import { inspect } from 'node:util';
import {
  ActionRow,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonComponent,
  ButtonStyle,
} from 'discord.js';
import { botOwners, colors } from '../defaults.js';
import { truncate } from '../utils.js';

export const data = [
  {
    description: 'Bot owner only commands',
    name: 'mowund',
    options: [
      {
        description: 'Executes a script (Bot owner only)',
        name: 'eval',
        options: [
          {
            description: 'The script to execute',
            name: 'script',
            required: true,
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'Makes the script asynchronous (Default: True)',
            name: 'async',
            type: ApplicationCommandOptionType.Boolean,
          },
          {
            description: 'Await the script (Default: True)',
            name: 'await',
            type: ApplicationCommandOptionType.Boolean,
          },
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            name: 'ephemeral',
            type: ApplicationCommandOptionType.Boolean,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        description: 'Configures interactions (Bot owner only)',
        name: 'interaction',
        options: [
          {
            description: 'Update bot commands (Bot owner only)',
            name: 'update',
            options: [
              {
                description: 'ID of a specific command (Default: All commands)',
                name: 'id',
                type: ApplicationCommandOptionType.String,
              },
              {
                description: 'The guild the command is at (Default: Trigger guild)',
                name: 'guild',
                type: ApplicationCommandOptionType.String,
              },
              {
                description: 'Send reply as an ephemeral message (Default: True)',
                name: 'ephemeral',
                type: ApplicationCommandOptionType.Boolean,
              },
            ],
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
        type: ApplicationCommandOptionType.SubcommandGroup,
      },
      {
        description: 'Configures shards (Bot owner only)',
        name: 'shard',
        options: [
          {
            description: 'Respawns all shards (Bot owner only)',
            name: 'respawnall',
            options: [
              {
                description: 'How long to wait between shards',
                name: 'sharddelay',
                type: ApplicationCommandOptionType.Integer,
              },
              {
                description: "How long to wait between killing a shard's process and restarting it",
                name: 'respawndelay',
                type: ApplicationCommandOptionType.Integer,
              },
              {
                description: 'The amount to wait for a shard to become ready before continuing to another',
                name: 'timeout',
                type: ApplicationCommandOptionType.Integer,
              },
              {
                description: 'Send reply as an ephemeral message (Default: True)',
                name: 'ephemeral',
                type: ApplicationCommandOptionType.Boolean,
              },
            ],
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
        type: ApplicationCommandOptionType.SubcommandGroup,
      },
    ],
  },
];
export async function execute({ chalk, client, interaction, st, embed }) {
  const { user, options } = interaction,
    ephemeralO = options?.getBoolean('ephemeral') ?? true,
    idO = options?.getString('id'),
    guildO = options?.getString('guild');

  if (interaction.isChatInputCommand()) {
    await interaction.deferReply({ ephemeral: ephemeralO });

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

    if (!botOwners.includes(user.id)) {
      return interaction.editReply({
        components: rows,
        embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.DEVELOPERS_ONLY'))],
      });
    }

    const guild = await client.shard
      .broadcastEval((c, { id }) => c.guilds.cache.get(id), {
        context: {
          id: guildO,
        },
      })
      .then(gA => gA.find(g => g));

    if (guildO && !guild) {
      return interaction.editReply({
        components: rows,
        embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.GUILD_NOT_FOUND'))],
      });
    }

    if (options?.getSubcommand() === 'eval') {
      const scriptO = options?.getString('script'),
        asyncO = options?.getBoolean('async') ?? true,
        awaitO = options?.getBoolean('await') ?? true,
        script = asyncO ? `(async () => {${scriptO}})()` : scriptO;

      try {
        let evaled = awaitO ? await eval(script) : eval(script);
        const evaledType = typeof evaled;

        if (evaledType !== 'string') evaled = inspect(evaled);

        return interaction.editReply({
          components: rows,
          embeds: [
            embed({ type: 'success' })
              .addField({ name: st.__('GENERIC.OUTPUT'), value: `\`\`\`js\n${truncate(evaled, 1012)}\`\`\`` })
              .addField({ name: st.__('GENERIC.TYPE'), value: `\`\`\`js\n${evaledType}\`\`\`` }),
          ],
        });
      } catch (err) {
        return interaction.editReply({
          components: rows,
          embeds: [
            embed({ type: 'error' }).addField({ name: st.__('GENERIC.OUTPUT'), value: `\`\`\`js\n${err}\`\`\`` }),
          ],
        });
      }
    }
    if (options?.getSubcommandGroup() === 'interaction') {
      const appCmds = client.application.commands,
        fAppCmds = await appCmds.fetch(),
        embs = [];
      let fGdCmds;
      if (guild ?? interaction.guild) fGdCmds = await appCmds.fetch({ guildId: (guild ?? interaction.guild).id });

      if (options?.getSubcommand() === 'update') {
        let updCmds = [],
          delCmds = [];

        fAppCmds.each(c => (delCmds = delCmds.concat(c)));
        if (fGdCmds) fGdCmds.each(c => (delCmds = delCmds.concat(c)));

        try {
          const interactionFiles = readdirSync('./interactions').filter(f => f.endsWith('.js'));
          for (const file of interactionFiles) {
            const event = await import(`../interactions/${file}`);
            for (const dt of event.data) {
              const guildOnly = event.guildOnly?.find(i => i === (guild ?? interaction.guild)?.id),
                findCmd = idO
                  ? (await appCmds.fetch(idO, { guildId: (guild ?? interaction.guild).id })) ??
                    (await appCmds.fetch(idO))
                  : dt,
                searchCmd = fGdCmds?.find(c => c.name === findCmd.name) ?? fAppCmds.find(c => c.name === findCmd.name),
                dataEquals = searchCmd?.equals(dt);

              if (dt.name === findCmd.name) {
                if (interaction.inGuild() && event.guildOnly) {
                  if (idO) delCmds = delCmds.filter(c => c.name === dt.name);

                  const found = delCmds.find(c => c.name === dt.name);
                  delCmds =
                    found && event.guildOnly?.includes(found?.guildId)
                      ? delCmds.filter(c => c.name !== dt.name)
                      : delCmds;

                  if ((!dataEquals || idO) && guildOnly) {
                    const cmd = await appCmds.create(dt, guild?.id || guildOnly);
                    updCmds = updCmds.concat(cmd);
                    console.log(`Updated guild (${guild?.id || guildOnly}) command: ${cmd.name} (${cmd.id})`.green);
                  }
                } else if (!event.guildOnly) {
                  if (idO) delCmds = delCmds.filter(c => c.name === dt.name);

                  const found = delCmds.find(c => c.name === dt.name);
                  delCmds = found ? delCmds.filter(c => c.name !== dt.name || c.guildId) : delCmds;

                  if ((!dataEquals || idO) && !guild) {
                    const cmd = await appCmds.create(dt);
                    updCmds = updCmds.concat(cmd);
                    console.log(`Updated global command: ${cmd.name} (${cmd.id})`.yellow);
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error(chalk.red('An error occured while reloading an application command:\n'), err);
          return interaction.editReply({
            embeds: [
              embed({ type: 'error' }).setDescription(
                `${st.__('ERROR.RELOADING_APPLICATION_COMMAND')}\n\`\`\`js\n${err}\`\`\``,
              ),
            ],
          });
        }

        delCmds.forEach(c => {
          if (c.guildId) {
            (guild ?? interaction.guild).commands.delete(c.id);
            console.log(`Deleted guild (${(guild ?? interaction.guild).id}) command: ${c.name} (${c.id})`.red);
          } else {
            appCmds.delete(c.id);
            console.log(`Deleted global command: ${c.name} (${c.id})`.red);
          }
        });

        client.splitedCmds = client.splitCmds(await appCmds.fetch());
        await client.updateMowundDescription();

        const cmdMap = (cmds, guildOnly = false) =>
            cmds
              .filter(o => (guildOnly ? o.guildId : !o.guildId))
              .map(o =>
                (guildOnly ? o.guildId : !o.guildId)
                  ? `**${
                      o.type === ApplicationCommandType.Message
                        ? st.__('GENERIC.MESSAGE')
                        : o.type === ApplicationCommandType.User
                        ? st.__('GENERIC.USER')
                        : st.__('GENERIC.CHAT')
                    }**: \`${o.name}\``
                  : '',
              )
              .join('\n'),
          updCmdGlobal = cmdMap(updCmds),
          updCmdGuild = cmdMap(updCmds, true),
          delCmdGlobal = cmdMap(delCmds),
          delCmdGuild = cmdMap(delCmds, true);

        if (updCmds.length > 0) {
          const e = embed({ title: st.__('MOWUND.INTERACTION.COMMANDS.UPDATED'), type: 'success' });
          if (updCmdGlobal)
            e.addField({ inline: true, name: st.__('MOWUND.INTERACTION.COMMANDS.GLOBAL'), value: updCmdGlobal });

          if (updCmdGuild) {
            e.addField({
              inline: true,
              name: guild
                ? st.__mf('MOWUND.INTERACTION.COMMANDS.SPECIFIED_GUILD', { guild: guild.name })
                : st.__('MOWUND.INTERACTION.COMMANDS.GUILD'),
              value: updCmdGuild,
            });
          }
          embs.push(e);
        }
        if (delCmds.length > 0) {
          const e = embed({ title: `🗑️ ${st.__('MOWUND.INTERACTION.COMMANDS.DELETED')}` }).setColor(colors.red);
          if (delCmdGlobal)
            e.addField({ inline: true, name: st.__('MOWUND.INTERACTION.COMMANDS.GLOBAL'), value: delCmdGlobal });

          if (delCmdGuild) {
            e.addField({
              inline: true,
              name: guild
                ? st.__mf('MOWUND.INTERACTION.COMMANDS.SPECIFIED_GUILD', { guild: guild.name })
                : st.__('MOWUND.INTERACTION.COMMANDS.GUILD'),
              value: delCmdGuild,
            });
          }
          embs.push(e);
        }

        return interaction.editReply({
          components: rows,
          embeds:
            embs.length > 0 ? embs : [embed({ type: 'warning' }).setDescription(st.__('MOWUND.INTERACTION.NO_UPDATE'))],
        });
      }
    }
    if (options?.getSubcommandGroup() === 'shard') {
      if (options?.getSubcommand() === 'respawnall') {
        const shardDelayO = options?.getInteger('shardDelay') ?? 5000,
          respawnDelayO = options?.getInteger('respawnDelay') ?? 500,
          timeoutO = options?.getInteger('timeout') ?? 30000;

        await interaction.editReply({
          components: rows,
          embeds: [embed({ type: 'warning' }).setDescription(st.__('MOWUND.SHARD.RESPAWNING'))],
        });

        client.shard.respawnAll({
          respawnDelay: respawnDelayO,
          shardDelay: shardDelayO,
          timeout: timeoutO,
        });
      }
    }
  }
}
