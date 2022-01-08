import { readdirSync } from 'node:fs';
import { MessageActionRow, MessageButton } from 'discord.js';
import { botOwners } from '../defaults.js';
import { truncate } from '../utils.js';

export const data = [
  {
    name: 'mowund',
    description: 'Bot owner only commands',
    options: [
      {
        name: 'eval',
        description: 'Executes a script (Bot owner only)',
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'script',
            description: 'The script to execute',
            type: 'STRING',
            required: true,
          },
          {
            name: 'async',
            description: 'Makes the script asynchronous (Default: True)',
            type: 'BOOLEAN',
          },
          {
            name: 'await',
            description: 'Await the script (Default: True)',
            type: 'BOOLEAN',
          },
          {
            name: 'ephemeral',
            description: 'Send reply as an ephemeral message (Default: True)',
            type: 'BOOLEAN',
          },
        ],
      },
      {
        name: 'interaction',
        description: 'Configures interactions (Bot owner only)',
        type: 'SUB_COMMAND_GROUP',
        options: [
          {
            name: 'update',
            description: 'Update bot commands (Bot owner only)',
            type: 'SUB_COMMAND',
            options: [
              {
                name: 'id',
                description: 'ID of a specific command (Default: All commands)',
                type: 'STRING',
              },
              {
                name: 'guild',
                description: 'The guild the command is at (Default: Trigger guild)',
                type: 'STRING',
              },
              {
                name: 'ephemeral',
                description: 'Send reply as an ephemeral message (Default: True)',
                type: 'BOOLEAN',
              },
            ],
          },
        ],
      },
      {
        name: 'shard',
        description: 'Configures shards (Bot owner only)',
        type: 'SUB_COMMAND_GROUP',
        options: [
          {
            name: 'respawnall',
            description: 'Respawns all shards (Bot owner only)',
            type: 'SUB_COMMAND',
            options: [
              {
                name: 'sharddelay',
                description: 'How long to wait between shards',
                type: 'INTEGER',
              },
              {
                name: 'respawndelay',
                description: "How long to wait between killing a shard's process and restarting it",
                type: 'INTEGER',
              },
              {
                name: 'timeout',
                description: 'The amount to wait for a shard to become ready before continuing to another',
                type: 'INTEGER',
              },
              {
                name: 'ephemeral',
                description: 'Send reply as an ephemeral message (Default: True)',
                type: 'BOOLEAN',
              },
            ],
          },
        ],
      },
    ],
  },
];
export async function execute(client, interaction, st, embed) {
  const { user, options } = interaction,
    ephemeralO = options?.getBoolean('ephemeral') ?? true,
    idO = options?.getString('id'),
    guildO = options?.getString('guild');

  if (interaction.isCommand()) {
    await interaction.deferReply({ ephemeral: ephemeralO });

    const rows = !ephemeralO
      ? [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
              .setEmoji('🧹')
              .setStyle('DANGER')
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

    let emb = [];

    if (options?.getSubcommand() === 'eval') {
      const scriptO = options?.getString('script'),
        asyncO = options?.getBoolean('async') ?? true,
        awaitO = options?.getBoolean('await') ?? true,
        script = asyncO ? `(async () => {${scriptO}})()` : scriptO;

      try {
        let evaled = awaitO ? await eval(script) : eval(script);
        const evaledType = typeof evaled;

        if (evaledType !== 'string') {
          evaled = require('node:util').inspect(evaled);
        }

        emb = embed({ type: 'success' })
          .addField(st.__('GENERIC.OUTPUT'), `\`\`\`js\n${truncate(evaled, 1012)}\`\`\``)
          .addField(st.__('GENERIC.TYPE'), `\`\`\`js\n${evaledType}\`\`\``);
        return interaction.editReply({
          components: rows,
          embeds: [emb],
        });
      } catch (err) {
        emb = embed({ type: 'error' }).addField(st.__('GENERIC.OUTPUT'), `\`\`\`js\n${err}\`\`\``);
        return interaction.editReply({
          components: rows,
          embeds: [emb],
        });
      }
    }
    if (options?.getSubcommandGroup() === 'interaction') {
      const appCmds = client.application.commands,
        fAppCmds = await appCmds.fetch();
      let fGdCmds;
      if (guild ?? interaction.guild) {
        fGdCmds = await appCmds.fetch({ guildId: (guild ?? interaction.guild).id });
      }

      if (options?.getSubcommand() === 'update') {
        let updCmds = [],
          delCmds = [];

        fAppCmds.each(c => (delCmds = delCmds.concat(c)));
        if (fGdCmds) {
          fGdCmds.each(c => (delCmds = delCmds.concat(c)));
        }

        try {
          const interactionFiles = readdirSync('./interactions').filter(f => f.endsWith('.js'));
          for (const file of interactionFiles) {
            const event = require(`../interactions/${file}`);
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
                  if (idO) {
                    delCmds = delCmds.filter(c => c.name === dt.name);
                  }
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
                  if (idO) {
                    delCmds = delCmds.filter(c => c.name === dt.name);
                  }
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
          console.error('An error occured while reloading an application command:\n'.red, err);
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
        const cmdMap = (cmds, guildOnly = false) =>
            cmds
              .filter(o => (guildOnly ? o.guildId : !o.guildId))
              .map(o =>
                (guildOnly ? o.guildId : !o.guildId)
                  ? `**${
                      o.type === 'MESSAGE'
                        ? st.__('GENERIC.MESSAGE')
                        : o.type === 'USER'
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
          if (updCmdGlobal) {
            e.addField(st.__('MOWUND.INTERACTION.COMMANDS.GLOBAL'), updCmdGlobal, true);
          }
          if (updCmdGuild) {
            e.addField(
              guild
                ? st.__('MOWUND.INTERACTION.COMMANDS.SPECIFIED_GUILD', guild.name)
                : st.__('MOWUND.INTERACTION.COMMANDS.GUILD'),
              updCmdGuild,
              true,
            );
          }
          emb = emb.concat(e);
        }
        if (delCmds.length > 0) {
          const e = embed({ title: `🗑️ ${st.__('MOWUND.INTERACTION.COMMANDS.DELETED')}` }).setColor('FF0000');
          if (delCmdGlobal) {
            e.addField(st.__('MOWUND.INTERACTION.COMMANDS.GLOBAL'), delCmdGlobal, true);
          }
          if (delCmdGuild) {
            e.addField(
              guild
                ? st.__('MOWUND.INTERACTION.COMMANDS.SPECIFIED_GUILD', guild.name)
                : st.__('MOWUND.INTERACTION.COMMANDS.GUILD'),
              delCmdGuild,
              true,
            );
          }
          emb = emb.concat(e);
        }

        return interaction.editReply({
          components: rows,
          embeds:
            emb.length > 0 ? emb : [embed({ type: 'warning' }).setDescription(st.__('MOWUND.INTERACTION.NO_UPDATE'))],
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
          shardDelay: shardDelayO,
          respawnDelay: respawnDelayO,
          timeout: timeoutO,
        });
      }
    }
  }
}
