/* eslint-disable */

// Old bullshit
const { MessageEmbed, Permissions, Util } = require('discord.js');
const utils = require('../utils.js');

module.exports = {
  name: '',
  async execute(client, interaction) {
    
    function getTS(path, values) {
      return utils.getTSE(interaction.guild_id, path, values);
    }
    const guildI = client.guilds.cache.get(interaction.guild_id);
    if (guildI) {
      var uI = guildI.members.cache.get(interaction.member.user.id);
      var uIF = await client.users.fetch(interaction.member.user.id);
    }

    var emjFR = [];
    let disEdit = false;
    if (interaction.data.name) {
      const command = interaction.data.name.toLowerCase();
      const args = interaction.data.options;

      if (command == 'emoji') {
        if (!guildI) {
          return utils.iCP(
            client,
            0,
            interaction,
            [0, getTS(['ERROR', 'DM'])],
            1,
            0,
            1,
          );
        }

        var emj = args
          .find((arg) => arg['options'])
          .options?.find((arg) => arg.name == 'emoji')
          .value.match(/^\S*/g)
          .toString();

        if (guildI.emojis.cache.find((q) => q.name == emj)) {
          emj = guildI.emojis.cache.find((q) => q.name == emj);
          emj = '<:' + emj.name + ':' + emj.id + '>';
        }

        const emjNID = emj.match(/<(a|):.+?:\d+>/g)
          ? emj.match(/<(a|):.+?:\d+>/g).toString()
          : '';

        var emjID = emjNID.match(/(?<=:)\d+/g)
          ? emjNID.match(/(?<=:)\d+/g).toString()
          : null;

        var emjName = emjNID.match(/(?<=:).+(?=:)/g)
          ? emjNID.match(/(?<=:).+(?=:)/g).toString()
          : null;

        let onlyID = false;
        if (!emjNID && emj.match(/^[0-9]*$/g)) {
          emjID = emj;
          onlyID = true;
        }

        emj = client.emojis.cache.find((emj) => emj.id == emjID);
        let emjVal = true;
        let emjURL = 'https://cdn.discordapp.com/emojis/' + emjID;
        if (await utils.checkImage(emjURL + '.gif')) {
          emjURL = emjURL + '.gif';
        }
        else if (!(await utils.checkImage(emjURL))) {
          emjVal = false;
        }

        var emjFN = {
          name: getTS(['EMOJI', 'FIELD_NAME']),
          value: '`' + emjName + '`',
          inline: true,
        };
        if (emjVal) {
          if (onlyID) {
            emjFN = [];
          }
        }
        else {
          return utils.iCP(
            client,
            0,
            interaction,
            [0, 'Não contém um emoji válido.'],
            1,
            0,
            1,
          );
        }

        if (emj) {
          if (
            !uI.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS) ||
            emj.guild.id != guildI.id
          ) {
            disEdit = true;
          }

          emjName = emj.name;
          var emjRoles = Util.discordSort(emj.roles.cache)
            .map((r) => `${r}`)
            .reverse()
            .join(', ');
          emjRoles ??= '@everyone';

          emjFN = {
            name: getTS(['EMOJI', 'FIELD_NAME']),
            value: '`' + emjName + '`',
            inline: true,
          };
          emjFR = {
            name: getTS(['EMOJI', 'FIELD_ROLES']),
            value: emjRoles,
          };
        }
        else {
          disEdit = true;
        }

        if (args.find((arg) => arg.name == 'edit')) {
          var emb = new MessageEmbed()
            .setTitle(getTS(['EMOJI', 'EDIT_EDITING']))
            .addFields(
              {
                name: getTS(['EMOJI', 'FIELD_NAME']),
                value: '`' + emjName + '`',
                inline: true,
              },
              {
                name: getTS(['EMOJI', 'FIELD_ID']),
                value: '`' + emjID + '`',
                inline: true,
              },
              emjFR,
            )
            .setThumbnail(emjURL)
            .setColor('ffff00')
            .setTimestamp(Date.now())
            .setFooter(
              getTS(['GENERIC', 'REQUESTED_BY'], {
                USER: uIF.username,
              }),
              uIF.avatarURL(),
            );

          if (emj) {
            if (emj.guild.id != guildI.id) {
              return utils.iCP(
                client,
                0,
                interaction,
                [0, getTS(['EMOJI', 'UNALLOWED_SERVER'])],
                1,
                0,
                1,
              );
            }
          }
          else {
            utils.iCP(
              client,
              0,
              interaction,
              [0, getTS(['EMOJI', 'UNALLOWED_SERVER'])],
              1,
              0,
              1,
              [],
            );
          }
          if (!uI.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS)) {
            return utils.iCP(
              client,
              0,
              interaction,
              [
                '',
                getTS(['PERM', 'REQUIRES'], {
                  PERM: getTS(['PERM', 'MANAGE_EMOJIS']),
                }),
              ],
              1,
              0,
              1,
            );
          }
          utils.iCP(client, 0, interaction, 0, 0, 0, emb, [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 1,
                  label: getTS(['EMOJI', 'COMPONENT', 'VIEW']),
                  emoji: {
                    name: '🔎',
                  },
                  custom_id: 'emoji_view',
                },
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 2,
                  label: getTS(['EMOJI', 'COMPONENT', 'EDIT_NAME']),
                  emoji: {
                    name: '✏️',
                  },
                  custom_id: 'emoji_edit_name',
                },
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 2,
                  label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES']),
                  emoji: {
                    name: '📜',
                  },
                  custom_id: 'emoji_edit_role',
                },
              ],
            },
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 4,
                  label: getTS(['EMOJI', 'COMPONENT', 'EDIT_DELETE']),
                  emoji: {
                    name: '🗑️',
                  },
                  custom_id: 'emoji_edit_delete',
                },
              ],
            },
          ]);
        }
        else if (args.find((arg) => arg.name == 'view')) {
          var emb = new MessageEmbed()
            .setTitle(getTS(['EMOJI', 'VIEW_VIEWING']))
            .addFields(
              emjFN,
              {
                name: getTS(['EMOJI', 'FIELD_ID']),
                value: '`' + emjID + '`',
                inline: true,
              },
              emjFR,
            )
            .setThumbnail(emjURL)
            .setColor('00ff00')
            .setTimestamp(Date.now())
            .setFooter(
              getTS(['GENERIC', 'REQUESTED_BY'], {
                USER: uIF.username,
              }),
              uIF.avatarURL(),
            );

          utils.iCP(client, 0, interaction, 0, 0, 0, emb, [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 4,
                  label: getTS(['GENERIC', 'COMPONENT', 'MESSAGE_DELETE']),
                  emoji: {
                    name: '🧹',
                  },
                  custom_id: 'emoji_message_delete',
                },
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 1,
                  label: getTS(['EMOJI', 'COMPONENT', 'EDIT']),
                  emoji: {
                    name: '📝',
                  },
                  custom_id: 'emoji_edit',
                  disabled: disEdit,
                },
              ],
            },
          ]);
        }
      }
    }
    if (interaction.data.custom_id) {
      const component_id = interaction.data.custom_id;
      if (!component_id.startsWith('emoji_')) return;
      let message = interaction.message;
      const embEID = new URL(message.embeds[0].thumbnail.url).pathname.split(
        /[\/&\.]/,
      );
      const embAURL = new URL(message.embeds[0].footer.icon_url).pathname.split(
        /[\/&\.]/,
      );

      if (uIF.id != embAURL[2]) {
        return utils.iCP(client, 0, interaction, 0, 1, 0, 1);
      }

      var emjName;
      var emjID;

      var emj = client.emojis.cache.find((emj) => emj.id == embEID[2]);
      var emjFR = [];

      if (emj) {
        if (
          !uI.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS) ||
          emj.guild.id != guildI.id
        ) {
          disEdit = true;
        }

        emjName = emj.name;
        emjID = emj.id;
        var emjRoles = Util.discordSort(emj.roles.cache)
          .map((r) => `${r}`)
          .reverse()
          .join(', ');
        emjRoles ??= '@everyone';

        emjFN = {
          name: getTS(['EMOJI', 'FIELD_NAME]']),
          value: '`' + emjName + '`',
          inline: true,
        };
        emjFR = {
          name: getTS(['EMOJI', 'FIELD_ROLES']),
          value: emjRoles,
        };
      }
      else {
        disEdit = true;
      }

      var emb = new MessageEmbed()
        .setTitle(getTS(['EMOJI', 'EDIT_EDITING']))
        .addFields(
          {
            name: getTS(['EMOJI', 'FIELD_NAME']),
            value: '`' + emjName + '`',
            inline: true,
          },
          {
            name: getTS(['EMOJI', 'FIELD_ID']),
            value: '`' + emjID + '`',
            inline: true,
          },
          emjFR,
        )
        .setThumbnail(message.embeds[0].thumbnail.url)
        .setColor('ffff00')
        .setTimestamp(Date.now())
        .setFooter(
          getTS(['GENERIC', 'INTERACTED_BY'], {
            USER: uIF.username,
          }),
          uIF.avatarURL(),
        );

      if (
        !(
          component_id == 'emoji_view' || component_id == 'emoji_message_delete'
        ) &&
        !uI.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS)
      ) {
        return utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          emb.setTitle(getTS(['EMOJI', 'VIEW_VIEWING'])).setColor('00ff00'),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 4,
                  label: getTS(['GENERIC', 'COMPONENT', 'MESSAGE_DELETE']),
                  emoji: {
                    name: '🧹',
                  },
                  custom_id: 'emoji_message_delete',
                },
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 1,
                  label: getTS(['EMOJI', 'COMPONENT', 'EDIT']),
                  emoji: {
                    name: '📝',
                  },
                  custom_id: 'emoji_edit',
                  disabled: disEdit,
                },
              ],
            },
          ],
        );
      }

      if (component_id == 'emoji_edit') {
        utils.iCP(client, 3, interaction, 0, 0, 0, emb, [
          {
            type: 'SUB_COMMAND',
            components: [
              {
                type: 'SUB_COMMAND_GROUP',
                style: 1,
                label: getTS(['EMOJI', 'COMPONENT', 'VIEW']),
                emoji: {
                  name: '🔎',
                },
                custom_id: 'emoji_view',
              },
              {
                type: 'SUB_COMMAND_GROUP',
                style: 2,
                label: getTS(['EMOJI', 'COMPONENT', 'EDIT_NAME']),
                emoji: {
                  name: '✏️',
                },
                custom_id: 'emoji_edit_name',
              },
              {
                type: 'SUB_COMMAND_GROUP',
                style: 2,
                label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES']),
                emoji: {
                  name: '📜',
                },
                custom_id: 'emoji_edit_role',
              },
            ],
          },
          {
            type: 'SUB_COMMAND',
            components: [
              {
                type: 'SUB_COMMAND_GROUP',
                style: 4,
                label: getTS(['EMOJI', 'COMPONENT', 'EDIT_DELETE']),
                emoji: {
                  name: '🗑️',
                },
                custom_id: 'emoji_edit_delete',
              },
            ],
          },
        ]);
      }
      else if (component_id == 'emoji_view') {
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          emb.setTitle(getTS(['EMOJI', 'VIEW_VIEWING'])).setColor('00ff00'),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 4,
                  label: getTS(['GENERIC', 'COMPONENT', 'MESSAGE_DELETE']),
                  emoji: {
                    name: '🧹',
                  },
                  custom_id: 'emoji_message_delete',
                },
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 1,
                  label: getTS(['EMOJI', 'COMPONENT', 'EDIT']),
                  emoji: {
                    name: '📝',
                  },
                  custom_id: 'emoji_edit',
                  disabled: disEdit,
                },
              ],
            },
          ],
        );
      }
      else if (component_id == 'emoji_edit_name') {
        emb().fields[0] = {
          name: getTS(['EMOJI', 'FIELD_NAME']) + ' 📝',
          value: '`' + emj.name + '`',
          inline: true,
        };

        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          emb({ title: getTS(['EMOJI', 'EDIT_NAME'])}),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 1,
                  label: getTS(['GENERIC', 'COMPONENT', 'BACK']),
                  emoji: {
                    name: '↩️',
                  },
                  custom_id: 'emoji_edit',
                },
              ],
            },
          ],
        );

        var filter = (msg) => msg.author.id == uI.id;

        function fm1() {
          async function checkV() {
            message = await utils.iCP(client, 4, interaction);
            if (message.embeds[0].title == getTS(['EMOJI', 'EDIT_NAME'])) {
              return 1;
            }
            else if (
              message.embeds[0].title == getTS(['EMOJI', 'EDIT_NAME_INVALID'])
            ) {
              return 2;
            }
            else if (
              message.embeds[0].title == getTS(['EMOJI', 'EDITED_NAME_REPEAT'])
            ) {
              return 3;
            }
            else {
              return 0;
            }
          }

          const channel = client.channels.cache.find(
            (c) => c.id == message.channel_id,
          );
          channel
            .awaitMessages(filter, {
              max: 1,
              time: 60000,
              errors: ['time'],
            })
            .then(async (msg) => {
              if ((await checkV()) == 0) return;
              msg = msg.first();
              if (msg.content.length >= 2 && msg.content.length <= 32) {
                emj.edit({ name: msg.content }).then(async (emj) => {
                  emb().fields[0] = {
                    name: getTS(['EMOJI', 'FIELD_NAME']) + ' 📝',
                    value: '`' + emj.name + '`',
                    inline: true,
                  };

                  utils.iCP(
                    client,
                    3,
                    interaction,
                    0,
                    0,
                    0,
                    emb({ title: getTS(['EMOJI', 'EDITED_NAME_REPEAT'])}),
                  );
                });
                msg.delete();

                fm1();
              }
              else {
                utils.iCP(
                  client,
                  3,
                  interaction,
                  0,
                  0,
                  0,
                  emb({ title: getTS(['EMOJI', 'EDIT_NAME_INVALID'])}),
                );
                msg.delete();

                fm1();
              }
            })
            .catch(async (err) => {
              if ((await checkV()) == 0) return;
              utils.iCP(
                client,
                3,
                interaction,
                0,
                0,
                0,
                emb({ title: getTS(['ERROR', 'TIMED_OUT'])}),
                [
                  {
                    type: 'SUB_COMMAND',
                    components: [
                      {
                        type: 'SUB_COMMAND_GROUP',
                        style: 1,
                        label: getTS(['GENERIC', 'COMPONENT', 'BACK']),
                        emoji: {
                          name: '↩️',
                        },
                        custom_id: 'emoji_edit',
                      },
                      {
                        type: 'SUB_COMMAND_GROUP',
                        style: 1,
                        label: getTS(['GENERIC', 'COMPONENT', 'REPEAT']),
                        emoji: {
                          name: '🔄',
                        },
                        custom_id: 'emoji_edit_name',
                      },
                    ],
                  },
                ],
              );
            });
        }
        fm1();
        utils.iCP(client, 3, interaction, 0, 0, 0, emb, [
          {
            type: 'SUB_COMMAND',
            components: [
              {
                type: 'SUB_COMMAND_GROUP',
                style: 1,
                label: getTS(['GENERIC', 'COMPONENT', 'BACK']),
                emoji: {
                  name: '↩️',
                },
                custom_id: 'emoji_edit',
              },
            ],
          },
        ]);
      }
      else if (component_id == 'emoji_edit_role') {
        emb().fields[2] = {
          name: getTS(['EMOJI', 'FIELD_ROLES']) + ' 📝',
          value: emjRoles,
        };
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          emb({ title: getTS(['EMOJI', 'EDITING_ROLES'])}),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 1,
                  label: getTS(['GENERIC', 'COMPONENT', 'BACK']),
                  emoji: {
                    name: '↩️',
                  },
                  custom_id: 'emoji_edit',
                },
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 3,
                  label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_ADD']),
                  emoji: {
                    name: '➕',
                  },
                  custom_id: 'emoji_edit_roles_add',
                },
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 4,
                  label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_REMOVE']),
                  emoji: {
                    name: '➖',
                  },
                  custom_id: 'emoji_edit_roles_remove',
                },
              ],
            },
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 2,
                  label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_RESET']),
                  emoji: {
                    name: '🔄',
                  },
                  custom_id: 'emoji_edit_roles_reset',
                },
              ],
            },
          ],
        );
      }
      else if (component_id == 'emoji_edit_roles_add') {
        emb().fields[2] = {
          name: getTS(['EMOJI', 'FIELD_ROLES']) + ' 📝',
          value: emjRoles,
        };
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          emb({ title: getTS(['EMOJI', 'EDIT_ROLES_ADDING'])}),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 1,
                  label: getTS(['GENERIC', 'COMPONENT', 'BACK']),
                  emoji: {
                    name: '↩️',
                  },
                  custom_id: 'emoji_edit',
                },
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 3,
                  label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_ADD']),
                  emoji: {
                    name: '➕',
                  },
                  custom_id: 'emoji_edit_roles_add',
                  disabled: true,
                },
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 4,
                  label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_REMOVE']),
                  emoji: {
                    name: '➖',
                  },
                  custom_id: 'emoji_edit_roles_remove',
                },
              ],
            },
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 2,
                  label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_RESET']),
                  emoji: {
                    name: '🔄',
                  },
                  custom_id: 'emoji_edit_roles_reset',
                },
              ],
            },
          ],
        );

        var filter = (msg) => msg.author.id == uI.id;

        function fm1() {
          async function checkV() {
            message = await utils.iCP(client, 4, interaction);
            if (
              message.embeds[0].title ==
                getTS(['EMOJI', 'EDIT_ROLES_ADDING']) ||
              message.embeds[0].title ==
                getTS(['EMOJI', 'EDIT_ROLES_ADD_INVALID']) ||
              message.embeds[0].title ==
                getTS(['EMOJI', 'EDITED_ROLES_ADD_REPEAT']) ||
              message.embeds[0].title ==
                getTS(['EMOJI', 'EDIT_ROLES_ADDED_ALREADY'])
            ) {
              return 1;
            }
            else {
              return 0;
            }
          }

          const channel = client.channels.cache.find(
            (c) => c.id == message.channel_id,
          );
          channel
            .awaitMessages(filter, {
              max: 1,
              time: 60000,
              errors: ['time'],
            })
            .then(async (msg) => {
              if ((await checkV()) == 0) return;
              msg = msg.first();
              const emjR = guildI.roles.cache.find(
                (r) => r.id == msg.content.replace(/[\\<>@&]/g, ''),
              );
              if (emjR) {
                if (emj.roles.cache.has(emjR.id)) {
                  utils.iCP(
                    client,
                    3,
                    interaction,
                    0,
                    0,
                    0,
                    emb()
                      .setTitle(getTS(['EMOJI', 'EDIT_ROLES_ADDED_ALREADY']))
                      .setColor('ff0000'),
                  );
                  msg.delete();
                  return fm1();
                }
                const emjRs = emj.roles.cache.set('', emjR.id);

                emj.edit({ roles: emjRs }).then(async (emj) => {
                  let emjRoles = Util.discordSort(emj.roles.cache)
                    .map((r) => `${r}`)
                    .reverse()
                    .join(', ');
                  emjRoles ??= '@everyone';
                  emb().fields[2] = {
                    name: getTS(['EMOJI', 'FIELD_ROLES']) + ' 📝',
                    value: emjRoles,
                  };

                  utils.iCP(
                    client,
                    3,
                    interaction,
                    0,
                    0,
                    0,
                    emb()
                      .setTitle(getTS(['EMOJI', 'EDITED_ROLES_ADD_REPEAT']))
                      .setColor('ff8000'),
                  );
                });
                msg.delete();

                fm1();
              }
              else {
                utils.iCP(
                  client,
                  3,
                  interaction,
                  0,
                  0,
                  0,
                  emb()
                    .setTitle(getTS(['EMOJI', 'EDIT_ROLES_ADD_INVALID']))
                    .setColor('ff0000'),
                );
                msg.delete();

                fm1();
              }
            })
            .catch(async (err) => {
              if ((await checkV()) == 0) return;
              utils.iCP(
                client,
                3,
                interaction,
                0,
                0,
                0,
                emb({ title: getTS(['ERROR', 'TIMED_OUT'])}),
                [
                  {
                    type: 'SUB_COMMAND',
                    components: [
                      {
                        type: 'SUB_COMMAND_GROUP',
                        style: 1,
                        label: getTS(['GENERIC', 'COMPONENT', 'BACK']),
                        emoji: {
                          name: '↩️',
                        },
                        custom_id: 'emoji_edit',
                      },
                      {
                        type: 'SUB_COMMAND_GROUP',
                        style: 3,
                        label: getTS(['COMPONENTS', 'EMOJI_EDIT_ROLES_ADD']),
                        emoji: {
                          name: '➕',
                        },
                        custom_id: 'emoji_edit_roles_add',
                      },
                      {
                        type: 'SUB_COMMAND_GROUP',
                        style: 4,
                        label: getTS(['COMPONENTS', 'EMOJI_EDIT_ROLES_REMOVE']),
                        emoji: {
                          name: '➖',
                        },
                        custom_id: 'emoji_edit_roles_remove',
                      },
                    ],
                  },
                  {
                    type: 'SUB_COMMAND',
                    components: [
                      {
                        type: 'SUB_COMMAND_GROUP',
                        style: 2,
                        label: getTS(['COMPONENTS', 'EMOJI_EDIT_ROLES_RESET']),
                        emoji: {
                          name: '🔄',
                        },
                        custom_id: 'emoji_edit_roles_reset',
                      },
                    ],
                  },
                ],
              );
            });
        }
        fm1();
        utils.iCP(client, 3, interaction, 0, 0, 0, emb, [
          {
            type: 'SUB_COMMAND',
            components: [
              {
                type: 'SUB_COMMAND_GROUP',
                style: 1,
                label: getTS(['GENERIC', 'COMPONENT', 'BACK']),
                emoji: {
                  name: '↩️',
                },
                custom_id: 'emoji_edit',
              },
              {
                type: 'SUB_COMMAND_GROUP',
                style: 3,
                label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_ADD']),
                emoji: {
                  name: '➕',
                },
                custom_id: 'emoji_edit_roles_add',
                disabled: true,
              },
              {
                type: 'SUB_COMMAND_GROUP',
                style: 4,
                label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_REMOVE']),
                emoji: {
                  name: '➖',
                },
                custom_id: 'emoji_edit_roles_remove',
              },
            ],
          },
          {
            type: 'SUB_COMMAND',
            components: [
              {
                type: 'SUB_COMMAND_GROUP',
                style: 2,
                label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_RESET']),
                emoji: {
                  name: '🔄',
                },
                custom_id: 'emoji_edit_roles_reset',
              },
            ],
          },
        ]);
      }
      else if (component_id == 'emoji_edit_roles_remove') {
        emb().fields[2] = {
          name: getTS(['EMOJI', 'FIELD_ROLES']) + ' 📝',
          value: emjRoles,
        };
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          emb({ title: getTS(['EMOJI', 'EDIT_ROLES_REMOVING'])}),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 1,
                  label: getTS(['GENERIC', 'COMPONENT', 'BACK']),
                  emoji: {
                    name: '↩️',
                  },
                  custom_id: 'emoji_edit',
                },
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 3,
                  label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_ADD']),
                  emoji: {
                    name: '➕',
                  },
                  custom_id: 'emoji_edit_roles_add',
                },
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 4,
                  label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_REMOVE']),
                  emoji: {
                    name: '➖',
                  },
                  custom_id: 'emoji_edit_roles_remove',
                  disabled: true,
                },
              ],
            },
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 2,
                  label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_RESET']),
                  emoji: {
                    name: '🔄',
                  },
                  custom_id: 'emoji_edit_roles_reset',
                },
              ],
            },
          ],
        );

        var filter = (msg) => msg.author.id == uI.id;

        function fm1() {
          async function checkV() {
            message = await utils.iCP(client, 4, interaction);
            if (
              message.embeds[0].title ==
                getTS(['EMOJI', 'EDIT_ROLES_REMOVING']) ||
              message.embeds[0].title ==
                getTS(['EMOJI', 'EDIT_ROLES_REMOVE_INVALID']) ||
              message.embeds[0].title ==
                getTS(['EMOJI', 'EDITED_ROLES_REMOVE_REPEAT']) ||
              message.embeds[0].title ==
                getTS(['EMOJI', 'EDIT_ROLES_REMOVED_ALREADY'])
            ) {
              return 1;
            }
            else {
              return 0;
            }
          }

          const channel = client.channels.cache.find(
            (c) => c.id == message.channel_id,
          );
          channel
            .awaitMessages(filter, {
              max: 1,
              time: 60000,
              errors: ['time'],
            })
            .then(async (msg) => {
              if ((await checkV()) == 0) return;
              msg = msg.first();
              const emjR = guildI.roles.cache.find(
                (r) => r.id == msg.content.replace(/[\\<>@&]/g, ''),
              );
              if (emjR) {
                if (!emj.roles.cache.has(emjR.id)) {
                  utils.iCP(
                    client,
                    3,
                    interaction,
                    0,
                    0,
                    0,
                    emb()
                      .setTitle(getTS(['EMOJI', 'EDIT_ROLES_REMOVED_ALREADY']))
                      .setColor('ff0000'),
                  );
                  msg.delete();
                  return fm1();
                }

                const emjRs = emj.roles.cache;
                emjRs.delete(emjR.id);

                emj.edit({ roles: emjRs }).then(async (emj) => {
                  let emjRoles = Util.discordSort(emj.roles.cache)
                    .map((r) => `${r}`)
                    .reverse()
                    .join(', ');
                  emjRoles ??= '@everyone';
                  emb().fields[2] = {
                    name: getTS(['EMOJI', 'FIELD_ROLES']) + ' 📝',
                    value: emjRoles,
                  };

                  utils.iCP(
                    client,
                    3,
                    interaction,
                    0,
                    0,
                    0,
                    emb()
                      .setTitle(getTS(['EMOJI', 'EDITED_ROLES_REMOVE_REPEAT']))
                      .setColor('ff8000'),
                  );
                });
                msg.delete();

                fm1();
              }
              else {
                utils.iCP(
                  client,
                  3,
                  interaction,
                  0,
                  0,
                  0,
                  emb()
                    .setTitle(getTS(['EMOJI', 'EDIT_ROLES_REMOVE_INVALID']))
                    .setColor('ff0000'),
                );
                msg.delete();

                fm1();
              }
            })
            .catch(async (err) => {
              if ((await checkV()) == 0) return;
              utils.iCP(
                client,
                3,
                interaction,
                0,
                0,
                0,
                emb({ title: getTS(['ERROR', 'TIMED_OUT'])}),
                [
                  {
                    type: 'SUB_COMMAND',
                    components: [
                      {
                        type: 'SUB_COMMAND_GROUP',
                        style: 1,
                        label: getTS(['GENERIC', 'COMPONENT', 'BACK']),
                        emoji: {
                          name: '↩️',
                        },
                        custom_id: 'emoji_edit',
                      },
                      {
                        type: 'SUB_COMMAND_GROUP',
                        style: 3,
                        label: getTS(['COMPONENTS', 'EMOJI_EDIT_ROLES_ADD']),
                        emoji: {
                          name: '➕',
                        },
                        custom_id: 'emoji_edit_roles_add',
                      },
                      {
                        type: 'SUB_COMMAND_GROUP',
                        style: 4,
                        label: getTS(['COMPONENTS', 'EMOJI_EDIT_ROLES_REMOVE']),
                        emoji: {
                          name: '➖',
                        },
                        custom_id: 'emoji_edit_roles_remove',
                      },
                    ],
                  },
                  {
                    type: 'SUB_COMMAND',
                    components: [
                      {
                        type: 'SUB_COMMAND_GROUP',
                        style: 2,
                        label: getTS(['COMPONENTS', 'EMOJI_EDIT_ROLES_RESET']),
                        emoji: {
                          name: '🔄',
                        },
                        custom_id: 'emoji_edit_roles_reset',
                      },
                    ],
                  },
                ],
              );
            });
        }
        fm1();
        utils.iCP(client, 3, interaction, 0, 0, 0, emb, [
          {
            type: 'SUB_COMMAND',
            components: [
              {
                type: 'SUB_COMMAND_GROUP',
                style: 1,
                label: getTS(['GENERIC', 'COMPONENT', 'BACK']),
                emoji: {
                  name: '↩️',
                },
                custom_id: 'emoji_edit',
              },
              {
                type: 'SUB_COMMAND_GROUP',
                style: 3,
                label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_ADD']),
                emoji: {
                  name: '➕',
                },
                custom_id: 'emoji_edit_roles_add',
              },
              {
                type: 'SUB_COMMAND_GROUP',
                style: 4,
                label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_REMOVE']),
                emoji: {
                  name: '➖',
                },
                custom_id: 'emoji_edit_roles_remove',
                disabled: true,
              },
            ],
          },
          {
            type: 'SUB_COMMAND',
            components: [
              {
                type: 'SUB_COMMAND_GROUP',
                style: 2,
                label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_RESET']),
                emoji: {
                  name: '🔄',
                },
                custom_id: 'emoji_edit_roles_reset',
              },
            ],
          },
        ]);
      }
      else if (component_id == 'emoji_edit_roles_reset') {
        emj.edit({ roles: [] }).then(async (emj) => {
          let emjRoles = Util.discordSort(emj.roles.cache)
            .map((r) => `${r}`)
            .reverse()
            .join(', ');
          emjRoles ??= '@everyone';
          emb().fields[2] = {
            name: getTS(['EMOJI', 'FIELD_ROLES']) + ' 📝',
            value: emjRoles,
          };
          utils.iCP(
            client,
            3,
            interaction,
            0,
            0,
            0,
            emb()
              .setTitle(getTS(['EMOJI', 'EDIT_ROLES_RESETED']))
              .setColor('ff8000'),
            [
              {
                type: 'SUB_COMMAND',
                components: [
                  {
                    type: 'SUB_COMMAND_GROUP',
                    style: 1,
                    label: getTS(['GENERIC', 'COMPONENT', 'BACK']),
                    emoji: {
                      name: '↩️',
                    },
                    custom_id: 'emoji_edit',
                  },
                  {
                    type: 'SUB_COMMAND_GROUP',
                    style: 3,
                    label: getTS(['EMOJI', 'COMPONENT', 'EDIT_ROLES_ADD']),
                    emoji: {
                      name: '➕',
                    },
                    custom_id: 'emoji_edit_roles_add',
                  },
                  {
                    type: 'SUB_COMMAND_GROUP',
                    style: 4,
                    label: getTS(['COMPONENTS', 'EMOJI_EDIT_ROLES_REMOVE']),
                    emoji: {
                      name: '➖',
                    },
                    custom_id: 'emoji_edit_roles_remove',
                  },
                ],
              },
              {
                type: 'SUB_COMMAND',
                components: [
                  {
                    type: 'SUB_COMMAND_GROUP',
                    style: 2,
                    label: getTS(['COMPONENTS', 'EMOJI_EDIT_ROLES_RESET']),
                    emoji: {
                      name: '🔄',
                    },
                    custom_id: 'emoji_edit_roles_reset',
                  },
                ],
              },
            ],
          );
        });
      }
      else if (component_id == 'emoji_edit_delete') {
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          emb()
            .setTitle(getTS(['EMOJI', 'EDIT_DELETING']))
            .setDescription(getTS(['EMOJI', 'EDIT_DELETING_DESC']))
            .setColor('ff8000'),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 1,
                  label: getTS(['GENERIC', 'COMPONENT', 'BACK']),
                  emoji: {
                    name: '↩️',
                  },
                  custom_id: 'emoji_edit',
                },
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 3,
                  label: getTS(['COMPONENTS', 'EMOJI_EDIT_DELETE_CONFIRM']),
                  emoji: {
                    name: '✅',
                  },
                  custom_id: 'emoji_edit_delete_confirm',
                },
              ],
            },
          ],
        );
      }
      else if (component_id == 'emoji_edit_delete_confirm') {
        emj.delete();
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          emb.setTitle(getTS(['EMOJI', 'EDIT_DELETED'])).setColor('ff0000'),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 4,
                  label: getTS(['GENERIC', 'COMPONENT', 'MESSAGE_DELETE']),
                  emoji: {
                    name: '🧹',
                  },
                  custom_id: 'emoji_message_delete',
                },
              ],
            },
          ],
        );
      }
      else if (component_id == 'emoji_message_delete') {
        utils.iCP(client, 5, interaction);
      }
    }
  },
};
