const { Collection } = require('discord.js');
const fs = require('node:fs');
const { botOwners } = require('../botdefaults');

module.exports = {
  data: [
    {
      name: 'config',
      description: 'Configure the bot. (Bot owner only)',
      options: [
        {
          name: 'interaction',
          description: 'Configura as interações. (Bot owner only)',
          type: 'SUB_COMMAND_GROUP',
          options: [
            {
              name: 'delete',
              description: 'Deletes an interaction. (Bot owner only)',
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'id',
                  description: 'Interaction ID.',
                  type: 'STRING',
                  required: true,
                },
                {
                  name: 'server',
                  description: 'Server ID. Defaults to global command.',
                  type: 'STRING',
                  required: false,
                },
                {
                  name: 'ephemeral',
                  description:
                    'Send reply as an ephemeral message. Defaults to true.',
                  type: 'BOOLEAN',
                  required: false,
                },
              ],
            },
            {
              name: 'list',
              description:
                'Lists all interactions and their IDs. (Bot owner only)',
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'server',
                  description: 'Server ID. Defaults to global commands',
                  type: 'STRING',
                  required: false,
                },
                {
                  name: 'ephemeral',
                  description:
                    'Send reply as an ephemeral message. Defaults to true.',
                  type: 'BOOLEAN',
                  required: false,
                },
              ],
            },
            {
              name: 'permission',
              description:
                'Configura a permissão de uma interação. (Bot owner only)',
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'id',
                  description: 'ID da interação.',
                  type: 'STRING',
                  required: true,
                },
                {
                  name: 'restriction',
                  description: 'O cargo ou usuário que pode usar.',
                  type: 'MENTIONABLE',
                  required: false,
                },
                {
                  name: 'server',
                  description: 'Server ID. Defaults to global commands.',
                  type: 'STRING',
                  required: false,
                },
                {
                  name: 'ephemeral',
                  description:
                    'Send reply as an ephemeral message. Defaults to true.',
                  type: 'BOOLEAN',
                  required: false,
                },
              ],
            },
            {
              name: 'update',
              description: 'Update bot commands. (Bot owner only)',
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'id',
                  description:
                    'Id of a specific command. Defaults to all commands.',
                  type: 'STRING',
                  required: false,
                },
                {
                  name: 'guildonly',
                  description:
                    'If guild only or not (global only). Defaults to both.',
                  type: 'BOOLEAN',
                  required: false,
                },
                {
                  name: 'ephemeral',
                  description:
                    'Send reply as an ephemeral message. Defaults to true.',
                  type: 'BOOLEAN',
                  required: false,
                },
              ],
            },
          ],
        },
        {
          name: 'bot',
          description: 'Configura o bot. (Bot owner only)',
          type: 'SUB_COMMAND_GROUP',
          options: [
            {
              name: 'power',
              description: 'Desliga ou reinicia o bot. (Bot owner only)',
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'option',
                  description: 'Opções.',
                  type: 'STRING',
                  choices: [
                    {
                      name: 'Restart',
                      value: 'restart',
                    },
                    {
                      name: 'Shutdown',
                      value: 'shutdown',
                    },
                  ],
                  required: true,
                },
                {
                  name: 'ephemeral',
                  description:
                    'Send reply as an ephemeral message. Defaults to true.',
                  type: 'BOOLEAN',
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  guildOnly: '420007989261500418',
  async execute(client, interaction, getTS, emb) {
    var { guild, user, options } = interaction;
    if (!botOwners.includes(user.id))
      return interaction.reply('Somente o dono do bot pode usar esse comando.');

    var userO = options?.getUser('user') ?? user;
    var idO = options?.getString('id');
    var guildO = options?.getBoolean('guild');
    var guildOnlyO = options?.getBoolean('guildonly');
    var ephemeralO = options?.getBoolean('ephemeral') ?? true;

    var appCmds = client.application.commands;
    var updCmds = [];

    if (interaction.isCommand()) {
      if (options?.getSubcommandGroup() === 'interaction')
        if (options?.getSubcommand() === 'delete') {
          client.application.commands.delete(idO, guildO);
        } else if (options?.getSubcommand() === 'list') {
        } else if (options?.getSubcommand() === 'update') {
          await interaction.deferReply({ ephemeral: ephemeralO });

          try {
            const interactionFiles = fs
              .readdirSync('./interactions')
              .filter((file) => file.endsWith('.js'));

            console.log('Started reloading application commands.'.yellow);
            for (const file of interactionFiles) {
              const event = require('../interactions/' + file);
              const guild = await client.guilds.fetch(event.guildOnly);
              for (const data of event.data) {
                var findCmd = idO
                  ? appCmds.fetch(idO, guild?.id)?.name
                  : data.name;
                if (data.name == findCmd) {
                  if (
                    event.guildOnly &&
                    (guildOnlyO == null || guildOnlyO == true)
                  ) {
                    await appCmds.create(data, guild?.id);
                    updCmds = updCmds.concat([[data.name, true, data.type]]);
                    console.log(('Updated: ' + data.name + ' command').green);
                  } else if (
                    !event.guildOnly &&
                    (guildOnlyO == null || guildOnlyO == false)
                  ) {
                    await appCmds.create(data);
                    updCmds = updCmds.concat([[data.name, false, data.type]]);
                    console.log(('Updated: ' + data.name + ' command').red);
                  }
                }
              }
            }

            var updCmdGlobal = updCmds
              .filter((a) => (!a[1] ? true : false))
              .map((a) => {
                if (!a[1])
                  return (
                    '**' +
                    (a[2] == 'MESSAGE'
                      ? 'Message'
                      : a[2] == 'USER'
                      ? 'User'
                      : 'Chat') +
                    '**: `' +
                    a[0] +
                    '`'
                  );
              })
              .join('\n');
            var updCmdGuild = updCmds
              .filter((a) => (a[1] ? true : false))
              .map((a) => {
                if (a[1])
                  return (
                    '**' +
                    (a[2] == 'MESSAGE'
                      ? 'Message'
                      : a[2] == 'USER'
                      ? 'User'
                      : 'Chat') +
                    '**: `' +
                    a[0] +
                    '`'
                  );
              })
              .join('\n');

            console.log('Successfully reloaded application commands.'.green);
          } catch (err) {
            console.error(
              'An error occured while reloading a application command:\n'.red,
              err
            );
            return interaction.editReply({
              embeds: [
                emb({
                  error:
                    'An error occured while reloading a application command.',
                }),
              ],
            });
          }

          if (updCmds.length != 0) {
            emb = emb().setColor('00ff00').setTitle('Updated commands');

            if (updCmdGlobal) {
              emb().addField('Global Commands', updCmdGlobal, true);
            }
            if (updCmdGuild) {
              emb().addField('Guild Commands', updCmdGuild, true);
            }
          } else {
            emb = emb({ type: 'error' }).setDescription('Unknown command.');
          }

          interaction.editReply({
            embeds: [emb],
          });
        }
    }
  },
};
