import { readdirSync } from 'node:fs';
import { inspect } from 'node:util';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { botOwners, colors } from '../defaults.js';
import { truncate } from '../utils.js';

export const data = [
  {
    default_member_permissions: '0',
    description: 'Bot owner only commands',
    description_localizations: { 'pt-BR': 'Comandos apenas para o dono do bot' },
    name: 'owner',
    name_localizations: { 'pt-BR': 'dono' },
    options: [
      {
        description: 'Executes a script (Bot owner only)',
        description_localizations: { 'pt-BR': 'Executa um script (Apenas para o dono do bot)' },
        name: 'eval',
        name_localizations: {},
        options: [
          {
            description: 'The script to execute',
            description_localizations: { 'pt-BR': 'O script para executar' },
            name: 'script',
            name_localizations: {},
            required: true,
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'Makes the script asynchronous (Default: True)',
            description_localizations: { 'pt-BR': 'Torna o script assíncrono (Padrão: Verdadeiro)' },
            name: 'async',
            name_localizations: { 'pt-BR': 'assíncrono' },
            type: ApplicationCommandOptionType.Boolean,
          },
          {
            description: 'Await the script (Default: True)',
            description_localizations: { 'pt-BR': 'Aguarda o script (Padrão: Verdadeiro)' },
            name: 'await',
            name_localizations: { 'pt-BR': 'aguardar' },
            type: ApplicationCommandOptionType.Boolean,
          },
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
      {
        description: 'Configures interactions (Bot owner only)',
        description_localizations: { 'pt-BR': 'Configura interações (Apenas para o dono do bot)' },
        name: 'interaction',
        name_localizations: { 'pt-BR': 'interação' },
        options: [
          {
            description: 'Update bot commands (Bot owner only)',
            description_localizations: { 'pt-BR': 'Atualiza comandos do bot (Apenas para o dono do bot)' },
            name: 'update',
            name_localizations: { 'pt-BR': 'atualizar' },
            options: [
              {
                description: 'ID of a specific command (Default: All commands)',
                description_localizations: { 'pt-BR': 'ID de um comando específico (Padrão: Todos os comandos)' },
                name: 'id',
                name_localizations: {},
                type: ApplicationCommandOptionType.String,
              },
              {
                description: 'The guild the command is at (Default: Invoked guild)',
                description_localizations: { 'pt-BR': 'O servidor em que o comando está (Padrão: Servidor invocado)' },
                name: 'guild',
                name_localizations: { 'pt-BR': 'servidor' },
                type: ApplicationCommandOptionType.String,
              },
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
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
        type: ApplicationCommandOptionType.SubcommandGroup,
      },
      {
        description: 'Configures shards (Bot owner only)',
        description_localizations: {
          'pt-BR': 'Configura shards (Apenas para o dono do bot)',
        },
        name: 'shard',
        name_localizations: {},
        options: [
          {
            description: 'Respawns all shards (Bot owner only)',
            description_localizations: {
              'pt-BR': 'Renasce todas as shards (Apenas para o dono do bot)',
            },
            name: 'respawn-all',
            name_localizations: { 'pt-BR': 'renascer-todas' },
            options: [
              {
                description: 'Wait time between shards',
                description_localizations: {
                  'pt-BR': 'Tempo de espera entre as shards',
                },
                name: 'shard-delay',
                name_localizations: { 'pt-BR': 'atraso-shard' },
                type: ApplicationCommandOptionType.Integer,
              },
              {
                description: "Wait time between killing a shard's process and restarting it",
                description_localizations: {
                  'pt-BR': 'Tempo de espera entre matar o processo de uma shard e reiniciá-la',
                },
                name: 'respawn-delay',
                name_localizations: { 'pt-BR': 'atraso-renascer' },
                type: ApplicationCommandOptionType.Integer,
              },
              {
                description: 'Wait time for a shard to become ready before continuing to another',
                description_localizations: {
                  'pt-BR': 'Tempo de espera para uma shard ficar pronta antes de continuar outra',
                },
                name: 'timeout',
                name_localizations: { 'pt-BR': 'intervalo' },
                type: ApplicationCommandOptionType.Integer,
              },
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
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
        type: ApplicationCommandOptionType.SubcommandGroup,
      },
    ],
  },
];
export const guildOnly = ['420007989261500418'];
export async function execute({ chalk, embed, interaction, st }) {
  const { client, options, user } = interaction,
    ephemeralO = options?.getBoolean('ephemeral') ?? true,
    idO = options?.getString('id'),
    guildO = options?.getString('guild');

  if (interaction.isChatInputCommand()) {
    await interaction.deferReply({ ephemeral: ephemeralO });

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

    switch (options?.getSubcommand()) {
      case 'eval': {
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
              embed({ type: 'success' }).addFields([
                { name: st.__('GENERIC.OUTPUT'), value: `\`\`\`js\n${truncate(evaled, 1012)}\`\`\`` },
                { name: st.__('GENERIC.TYPE'), value: `\`\`\`js\n${evaledType}\`\`\`` },
              ]),
            ],
          });
        } catch (err) {
          return interaction.editReply({
            components: rows,
            embeds: [
              embed({ type: 'error' }).addFields([{ name: st.__('GENERIC.OUTPUT'), value: `\`\`\`js\n${err}\`\`\`` }]),
            ],
          });
        }
      }
    }

    switch (options?.getSubcommandGroup()) {
      case 'interaction': {
        const appCmds = client.application.commands,
          fAppCmds = await appCmds.fetch({ withLocalizations: true }),
          embs = [];
        let fGdCmds;
        if (guild ?? interaction.guild)
          fGdCmds = await appCmds.fetch({ guildId: (guild ?? interaction.guild).id, withLocalizations: true });

        switch (options?.getSubcommand()) {
          case 'update': {
            let updCmds = [],
              delCmds = [];

            fAppCmds.each(c => (delCmds = delCmds.concat(c)));
            if (fGdCmds) fGdCmds.each(c => (delCmds = delCmds.concat(c)));

            try {
              const interactionFiles = readdirSync('./interactions').filter(f => f.endsWith('.js'));
              for (const file of interactionFiles) {
                const event = await import(`../interactions/${file}`);
                for (const dt of event.data) {
                  const gOnly = event.guildOnly?.find(i => i === (guild ?? interaction.guild)?.id),
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
                    if (interaction.inGuild() && event.guildOnly) {
                      if (idO) delCmds = delCmds.filter(c => c.name === dt.name);

                      const found = delCmds.find(c => c.name === dt.name);
                      delCmds =
                        found && event.guildOnly?.includes(found?.guildId)
                          ? delCmds.filter(c => c.name !== dt.name)
                          : delCmds;

                      if ((!dataEquals || idO) && gOnly) {
                        const cmd = await appCmds.create(dt, guild?.id || gOnly);
                        updCmds = updCmds.concat(cmd);
                        console.log(
                          chalk.green(`Updated guild (${guild?.id || gOnly}) command: ${cmd.name} (${cmd.id})`),
                        );
                      }
                    } else if (!event.guildOnly) {
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
                    `${st.__('ERROR.RELOADING_APPLICATION_COMMAND')}\n\`\`\`js\n${err}\`\`\``,
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

            client.splitedCmds = client.splitCmds(await appCmds.fetch());
            await client.updateMowundDescription();

            const cmdMap = (cmds, gOnly = false) =>
                cmds
                  .filter(o => (gOnly ? o.guildId : !o.guildId))
                  .map(o =>
                    (gOnly ? o.guildId : !o.guildId)
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

            if (updCmds.length) {
              const e = embed({ title: st.__('MOWUND.INTERACTION.COMMANDS.UPDATED'), type: 'success' });
              if (updCmdGlobal)
                e.addFields([{ inline: true, name: st.__('MOWUND.INTERACTION.COMMANDS.GLOBAL'), value: updCmdGlobal }]);

              if (updCmdGuild) {
                e.addFields([
                  {
                    inline: true,
                    name: guild
                      ? st.__mf('MOWUND.INTERACTION.COMMANDS.SPECIFIED_GUILD', { guildName: guild.name })
                      : st.__('MOWUND.INTERACTION.COMMANDS.GUILD'),
                    value: updCmdGuild,
                  },
                ]);
              }
              embs.push(e);
            }
            if (delCmds.length) {
              const e = embed({ title: `🗑️ ${st.__('MOWUND.INTERACTION.COMMANDS.DELETED')}` }).setColor(colors.red);
              if (delCmdGlobal)
                e.addFields([{ inline: true, name: st.__('MOWUND.INTERACTION.COMMANDS.GLOBAL'), value: delCmdGlobal }]);

              if (delCmdGuild) {
                e.addFields([
                  {
                    inline: true,
                    name: guild
                      ? st.__mf('MOWUND.INTERACTION.COMMANDS.SPECIFIED_GUILD', { guildName: guild.name })
                      : st.__('MOWUND.INTERACTION.COMMANDS.GUILD'),
                    value: delCmdGuild,
                  },
                ]);
              }
              embs.push(e);
            }

            return interaction.editReply({
              components: rows,
              embeds: embs.length
                ? embs
                : [embed({ type: 'warning' }).setDescription(st.__('MOWUND.INTERACTION.NO_UPDATE'))],
            });
          }
        }
        break;
      }
      case 'shard': {
        switch (options?.getSubcommand()) {
          case 'respawn-all': {
            const shardDelayO = options?.getInteger('shard-delay') ?? 5000,
              respawnDelayO = options?.getInteger('respawn-delay') ?? 500,
              timeoutO = options?.getInteger('timeout') ?? 30000;

            await interaction.editReply({
              components: rows,
              embeds: [embed({ type: 'warning' }).setDescription(st.__('MOWUND.SHARD.RESPAWNING'))],
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
