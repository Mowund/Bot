import { readdirSync } from 'node:fs';
import { inspect } from 'node:util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ApplicationCommandOptionType, ApplicationCommandType, BaseInteraction, Colors, Guild } from 'discord.js';
import { Command, CommandArgs } from '../../lib/structures/Command.js';
import { botOwners } from '../defaults.js';
import { truncate } from '../utils.js';

export default class Owner extends Command {
  constructor() {
    super(
      [
        {
          defaultMemberPermissions: '0',
          description: 'OWNER.DESCRIPTION',
          name: 'OWNER.NAME',
          options: [
            {
              description: 'OWNER.OPTIONS.EVAL.DESCRIPTION',
              name: 'OWNER.OPTIONS.EVAL.NAME',
              options: [
                {
                  description: 'OWNER.OPTIONS.EVAL.OPTIONS.SCRIPT.DESCRIPTION',
                  name: 'OWNER.OPTIONS.EVAL.OPTIONS.SCRIPT.NAME',
                  required: true,
                  type: ApplicationCommandOptionType.String,
                },
                {
                  description: 'OWNER.OPTIONS.EVAL.OPTIONS.ASYNC.DESCRIPTION',
                  name: 'OWNER.OPTIONS.EVAL.OPTIONS.ASYNC.NAME',
                  type: ApplicationCommandOptionType.Boolean,
                },
                {
                  description: 'OWNER.OPTIONS.EVAL.OPTIONS.AWAIT.DESCRIPTION',
                  name: 'OWNER.OPTIONS.EVAL.OPTIONS.AWAIT.NAME',
                  type: ApplicationCommandOptionType.Boolean,
                },
              ],
              type: ApplicationCommandOptionType.Subcommand,
            },
            {
              description: 'OWNER.OPTIONS.COMMAND.DESCRIPTION',
              name: 'OWNER.OPTIONS.COMMAND.NAME',
              options: [
                {
                  description: 'OWNER.OPTIONS.COMMAND.OPTIONS.UPDATE.DESCRIPTION',
                  name: 'OWNER.OPTIONS.COMMAND.OPTIONS.UPDATE.NAME',
                  options: [
                    {
                      description: 'OWNER.OPTIONS.COMMAND.OPTIONS.UPDATE.OPTIONS.ID.DESCRIPTION',
                      name: 'OWNER.OPTIONS.COMMAND.OPTIONS.UPDATE.OPTIONS.ID.NAME',
                      type: ApplicationCommandOptionType.String,
                    },
                    {
                      description: 'OWNER.OPTIONS.COMMAND.OPTIONS.UPDATE.OPTIONS.GUILD.DESCRIPTION',
                      name: 'OWNER.OPTIONS.COMMAND.OPTIONS.UPDATE.OPTIONS.GUILD.NAME',
                      type: ApplicationCommandOptionType.String,
                    },
                  ],
                  type: ApplicationCommandOptionType.Subcommand,
                },
              ],
              type: ApplicationCommandOptionType.SubcommandGroup,
            },
            {
              description: 'OWNER.OPTIONS.SHARD.DESCRIPTION',
              name: 'OWNER.OPTIONS.SHARD.NAME',
              options: [
                {
                  description: 'OWNER.OPTIONS.SHARD.OPTIONS.RESPAWN_ALL.DESCRIPTION',
                  name: 'OWNER.OPTIONS.SHARD.OPTIONS.RESPAWN_ALL.NAME',
                  options: [
                    {
                      description: 'OWNER.OPTION.SHARD.OPTIONS.RESPAWN_ALL.OPTIONS.SHARD_DELAY.DESCRIPTION',
                      name: 'OWNER.OPTION.SHARD.OPTIONS.RESPAWN_ALL.OPTIONS.SHARD_DELAY.NAME',
                      type: ApplicationCommandOptionType.Integer,
                    },
                    {
                      description: 'OWNER.OPTION.SHARD.OPTIONS.RESPAWN_ALL.OPTIONS.RESPAWN_DELAY.DESCRIPTION',
                      name: 'OWNER.OPTION.SHARD.OPTIONS.RESPAWN_ALL.OPTIONS.RESPAWN_DELAY.NAME',
                      type: ApplicationCommandOptionType.Integer,
                    },
                    {
                      description: 'OWNER.OPTION.SHARD.OPTIONS.RESPAWN_ALL.OPTIONS.TIMEOUT.DESCRIPTION',
                      name: 'OWNER.OPTION.SHARD.OPTIONS.RESPAWN_ALL.OPTIONS.TIMEOUT.NAME',
                      type: ApplicationCommandOptionType.Integer,
                    },
                  ],
                  type: ApplicationCommandOptionType.Subcommand,
                },
              ],
              type: ApplicationCommandOptionType.SubcommandGroup,
            },
          ],
        },
      ],
      {
        guildOnly: ['420007989261500418'],
      },
    );
  }

  async run(args: CommandArgs, interaction: BaseInteraction<'cached'>): Promise<any> {
    if (!interaction.isChatInputCommand()) return;

    const { client, embed } = args,
      { chalk, i18n } = client,
      { options, user } = interaction,
      ephemeralO = options.getBoolean('ephemeral') ?? true,
      idO = options.getString('id'),
      guildO = options.getString('guild'),
      __filename = fileURLToPath(import.meta.url),
      __dirname = dirname(__filename);

    await interaction.deferReply({ ephemeral: ephemeralO });

    if (!botOwners.includes(user.id)) {
      return interaction.editReply({
        embeds: [embed({ type: 'error' }).setDescription(i18n.__('ERROR.DEVELOPERS_ONLY'))],
      });
    }

    const guild = (await client.shard
      .broadcastEval((c, { id }) => c.guilds.cache.get(id), {
        context: {
          id: guildO,
        },
      })
      .then(gA => gA.find(g => g))) as Guild;

    if (guildO && !guild) {
      return interaction.editReply({
        embeds: [embed({ type: 'error' }).setDescription(i18n.__('ERROR.GUILD_NOT_FOUND'))],
      });
    }

    switch (options.getSubcommand()) {
      case 'eval': {
        const scriptO = options.getString('script'),
          asyncO = options.getBoolean('async') ?? true,
          awaitO = options.getBoolean('await') ?? true,
          script = asyncO ? `(async () => {${scriptO}})()` : scriptO;

        try {
          let evaled = awaitO ? await eval(script) : eval(script);
          const evaledType = typeof evaled;

          if (evaledType !== 'string') evaled = inspect(evaled);

          return interaction.editReply({
            embeds: [
              embed({ type: 'success' }).addFields(
                { name: i18n.__('GENERIC.OUTPUT'), value: `\`\`\`js\n${truncate(evaled, 1012)}\`\`\`` },
                { name: i18n.__('GENERIC.TYPE'), value: `\`\`\`js\n${evaledType}\`\`\`` },
              ),
            ],
          });
        } catch (err) {
          console.log(err);
          return interaction.editReply({
            embeds: [
              embed({ type: 'error' }).addFields({
                name: i18n.__('GENERIC.OUTPUT'),
                value: `\`\`\`js\n${err}\`\`\``,
              }),
            ],
          });
        }
      }
    }

    switch (options.getSubcommandGroup()) {
      case 'command': {
        switch (options.getSubcommand()) {
          case 'update': {
            const appCmds = client.application.commands,
              fAppCmds = await appCmds.fetch({ withLocalizations: true }),
              embs = [];
            let fGdCmds,
              updCmds = [],
              delCmds = [];

            if (guild ?? interaction.guild)
              fGdCmds = await appCmds.fetch({ guildId: (guild ?? interaction.guild).id, withLocalizations: true });

            fAppCmds.each(c => (delCmds = delCmds.concat(c)));
            if (fGdCmds) fGdCmds.each(c => (delCmds = delCmds.concat(c)));

            try {
              for (const file of readdirSync(__dirname).filter(f => f.endsWith('.js'))) {
                const event = new (await import(`./${file}`)).default() as Command;
                for (const dt of event.structure) {
                  client.autoLocalizeCommand(dt);

                  const gOnly = event.options?.guildOnly?.find(i => i === (guild ?? interaction.guild)?.id),
                    findCmd = idO
                      ? (await appCmds.fetch(idO, {
                          guildId: (guild ?? interaction.guild).id,
                          withLocalizations: true,
                        })) ?? (await appCmds.fetch(idO, { withLocalizations: true }))
                      : dt,
                    searchCmd =
                      fGdCmds?.find(c => c.name === findCmd.name) ?? fAppCmds.find(c => c.name === findCmd.name),
                    dataEquals = searchCmd?.equals(dt, true);

                  if (dt.name === findCmd.name) {
                    if (interaction.inGuild() && event.options?.guildOnly) {
                      if (idO) delCmds = delCmds.filter(c => c.name === dt.name);

                      const found = delCmds.find(c => c.name === dt.name);
                      delCmds =
                        found && event.options?.guildOnly?.includes(found?.guildId)
                          ? delCmds.filter(c => c.name !== dt.name)
                          : delCmds;

                      if ((!dataEquals || idO) && gOnly) {
                        const cmd = await appCmds.create(dt, guild?.id || gOnly);
                        updCmds = updCmds.concat(cmd);
                        console.log(
                          chalk.green(`Updated guild (${guild?.id || gOnly}) command: ${cmd.name} (${cmd.id})`),
                        );
                      }
                    } else if (!event.options?.guildOnly) {
                      if (idO) delCmds = delCmds.filter(c => c.name === dt.name);

                      const found = delCmds.find(c => c.name === dt.name);
                      delCmds = found ? delCmds.filter(c => c.name !== dt.name || c.guildId) : delCmds;

                      if ((!dataEquals || idO) && !guild) {
                        const cmd = await appCmds.create(dt);
                        updCmds = updCmds.concat(cmd);
                        console.log(chalk.yellow(`Updated global command: ${cmd.name} (${cmd.id})`));
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
                    `${i18n.__('ERROR.RELOADING_APPLICATION_COMMAND')}\n\`\`\`js\n${err}\`\`\``,
                  ),
                ],
              });
            }

            delCmds.forEach(c => {
              if (c.guildId) {
                (guild ?? interaction.guild).commands.delete(c.id);
                console.log(`Deleted guild (${(guild ?? interaction.guild).id}) command: ${c.name} (${c.id})`);
              } else {
                appCmds.delete(c.id);
                console.log(chalk.red(`Deleted global command: ${c.name} (${c.id})`));
              }
            });

            client.globalCommandCount = client.countCommands(await appCmds.fetch());

            const cmdMap = (cmds, gOnly = false) =>
                cmds
                  .filter(o => (gOnly ? o.guildId : !o.guildId))
                  .map(o =>
                    (gOnly ? o.guildId : !o.guildId)
                      ? `**${
                          o.type === ApplicationCommandType.Message
                            ? i18n.__('GENERIC.MESSAGE')
                            : o.type === ApplicationCommandType.User
                            ? i18n.__('GENERIC.USER')
                            : i18n.__('GENERIC.CHAT')
                        }**: \`${o.name}\``
                      : '',
                  )
                  .join('\n'),
              updCmdGlobal = cmdMap(updCmds),
              updCmdGuild = cmdMap(updCmds, true),
              delCmdGlobal = cmdMap(delCmds),
              delCmdGuild = cmdMap(delCmds, true);

            if (updCmds.length) {
              const e = embed({ title: i18n.__('OWNER.COMMAND.COMMANDS.UPDATED'), type: 'success' });
              if (updCmdGlobal) {
                e.addFields({
                  inline: true,
                  name: i18n.__('OWNER.COMMAND.COMMANDS.GLOBAL'),
                  value: updCmdGlobal,
                });
              }

              if (updCmdGuild) {
                e.addFields({
                  inline: true,
                  name: guild
                    ? i18n.__mf('OWNER.COMMAND.COMMANDS.SPECIFIED_GUILD', { guildName: guild.name })
                    : i18n.__('OWNER.COMMAND.COMMANDS.GUILD'),
                  value: updCmdGuild,
                });
              }
              embs.push(e);
            }
            if (delCmds.length) {
              const e = embed({ title: `🗑️ ${i18n.__('OWNER.COMMAND.COMMANDS.DELETED')}` }).setColor(Colors.Red);
              if (delCmdGlobal) {
                e.addFields({
                  inline: true,
                  name: i18n.__('OWNER.COMMAND.COMMANDS.GLOBAL'),
                  value: delCmdGlobal,
                });
              }

              if (delCmdGuild) {
                e.addFields({
                  inline: true,
                  name: guild
                    ? i18n.__mf('OWNER.COMMAND.COMMANDS.SPECIFIED_GUILD', { guildName: guild.name })
                    : i18n.__('OWNER.COMMAND.COMMANDS.GUILD'),
                  value: delCmdGuild,
                });
              }
              embs.push(e);
            }

            return interaction.editReply({
              embeds: embs.length
                ? embs
                : [embed({ type: 'warning' }).setDescription(i18n.__('OWNER.COMMAND.NO_UPDATE'))],
            });
          }
        }
        break;
      }
      case 'shard': {
        switch (options.getSubcommand()) {
          case 'respawn-all': {
            const shardDelayO = options.getInteger('shard-delay') ?? 5000,
              respawnDelayO = options.getInteger('respawn-delay') ?? 500,
              timeoutO = options.getInteger('timeout') ?? 30000;

            await interaction.editReply({
              embeds: [embed({ type: 'warning' }).setDescription(i18n.__('OWNER.SHARD.RESPAWNING'))],
            });

            return client.shard.respawnAll({
              respawnDelay: respawnDelayO,
              shardDelay: shardDelayO,
              timeout: timeoutO,
            });
          }
        }
      }
    }
  }
}
