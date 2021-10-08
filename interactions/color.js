const Discord = require('discord.js');
const tc = require('tinycolor2');
const utils = require('../utils.js');
const chalk = require('chalk');
const { getColorFromURL } = require('color-thief-node');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { botOwners } = require('../botdefaults.js');
require('colors');
require('log-timestamp');

module.exports = {
  data: [
    new SlashCommandBuilder()
      .setName('color')
      .setDescription('Role color system.')
      .addSubcommand((sub) =>
        sub
          .setName('change')
          .setDescription('Changes the color of a color role.')
          .addStringOption((opt) =>
            opt.setName('color').setDescription('Any supported color.')
          )
          .addUserOption((opt) =>
            opt
              .setName('user')
              .setDescription('An user. (Requires: Manage roles)')
          )
          .addBooleanOption((opt) =>
            opt
              .setName('ephemeral')
              .setDescription(
                'Send reply as an ephemeral message. Defaults to true.'
              )
          )
      )
      .addSubcommand((sub) =>
        sub
          .setName('current')
          .setDescription('The current color of a color role.')
          .addUserOption((opt) =>
            opt.setName('user').setDescription('An user.')
          )
          .addBooleanOption((opt) =>
            opt
              .setName('ephemeral')
              .setDescription(
                'Send reply as an ephemeral message. Defaults to true.'
              )
          )
      )
      .addSubcommand((sub) =>
        sub
          .setName('remove')
          .setDescription('Deletes a color role.')
          .addUserOption((opt) =>
            opt
              .setName('user')
              .setDescription('An user. (Requires: Manage roles)')
          )
          .addBooleanOption((opt) =>
            opt
              .setName('ephemeral')
              .setDescription(
                'Send reply as an ephemeral message. Defaults to true.'
              )
          )
      ),
  ],
  guildOnly: '420007989261500418',
  async execute(client, interaction, getTS, emb) {
    var { user, guild, options } = interaction;
    var userO = options?.getUser('user') ?? user;
    var memberO = guild?.members.cache.get(userO.id) ?? userO;
    var tRoleN = userO ? `USER-${userO.id}` : '';
    var tRole = guild.roles.cache.find((x) => x.name == tRoleN);
    var pos = guild.roles.botRoleFor(client.user.id).position;

    if (!interaction.inGuild())
      return interaction.reply({
        embeds: [emb({ type: 'error' }).setDescription(getTS(['ERROR', 'DM']))],
        ephemeral: true,
      });

    if (!botOwners.includes(user.id))
      return interaction.reply({
        embeds: [emb({ type: 'wip' })],
        ephemeral: true,
      });

    console.log(pos);
    function dftCF(disabled) {
      if (!disabled) {
        var disabled = [];
      }
      function getValue(id) {
        return typeof disabled.find((item) => item.id === id) != 'undefined'
          ? disabled.find((item) => item.id === id).value
          : false;
      }
      return [
        {
          type: 'SUB_COMMAND',
          components: [
            {
              type: 'SUB_COMMAND_GROUP',
              style: 2,
              emoji: {
                name: '⛔',
              },
              custom_id: 'color_cancel',
              disabled: getValue('cancel'),
            },
            {
              type: 'SUB_COMMAND_GROUP',
              style: 2,
              emoji: {
                name: '✅',
              },
              custom_id: 'color_confirm',
              disabled: getValue('confirm'),
            },
            {
              type: 'SUB_COMMAND_GROUP',
              style: 2,
              emoji: {
                name: '📝',
              },
              custom_id: 'color_edit',
              disabled: getValue('edit'),
            },
            {
              type: 'SUB_COMMAND_GROUP',
              style: 2,
              emoji: {
                name: '🔍',
              },
              custom_id: 'color_preview',
              disabled: getValue('preview'),
            },
          ],
        },
        {
          type: 'SUB_COMMAND',
          components: [
            {
              type: 'SUB_COMMAND_GROUP',
              style: 2,
              emoji: {
                name: '🔁',
              },
              custom_id: 'color_random',
              disabled: getValue('random'),
            },
            {
              type: 'SUB_COMMAND_GROUP',
              style: 2,
              emoji: {
                name: '⚪',
              },
              custom_id: 'color_lighten',
              disabled: getValue('ligthen'),
            },
            {
              type: 'SUB_COMMAND_GROUP',
              style: 2,
              emoji: {
                name: '⚫',
              },
              custom_id: 'color_darken',
              disabled: getValue('darken'),
            },
            {
              type: 'SUB_COMMAND_GROUP',
              style: 2,
              emoji: {
                name: '🎨',
              },
              custom_id: 'color_mix',
              disabled: getValue('mix'),
            },
          ],
        },
      ];
    }
    var dftC = dftCF();
    if (!tRole) {
      dftC = dftCF([{ id: 'preview', value: true }]);
    }

    if (interaction.isCommand()) {
      //var alwCH = database.get(guild, 'color_allowed_channels');
      //if (!alwCH || !alwCH.includes(channelI.id))
      //  return utils.iCP(
      //    client,
      //    0,
      //    interaction,
      //    [0, getTS(['ERROR', 'UNALLOWED', 'CHAT'])],
      //    1,
      //    0,
      //    1
      //  );

      if (options?.getSubcommand('change')) {
        var color = options?.getString('color');
        var pColor = [];
        if (tRole) {
          pColor = tc(tRole.hexColor).toHex();
        }
        var eTitle = getTS('COLOR_SPECIFIED');
        if (!color) {
          var [r, g, b] = await getColorFromURL(
            userO.avatarURL({ format: 'png' })
          );
          color = tc(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex();
          eTitle = getTS('COLOR_AVATAR_ESTIMATED');
        }
        if (tc(color).isValid()) {
          var color = tc(color).toHex();
        } else {
          return utils.iCP(
            client,
            0,
            interaction,
            0,
            1,
            0,
            await utils.diEmb(client, 2, interaction, userO)
          );
        }

        var color = color.replace('000000', '000001');

        interaction.reply(
          await utils.diEmb(
            client,
            2,
            interaction,
            userO,
            [pColor],
            color,
            eTitle,
            0
          ),
          dftC
        );
      } else if (options?.getSubcommand('current')) {
        if (tRole) {
          var color = tc(tRole.hexColor).toHex();
          utils.iCP(
            client,
            0,
            interaction,
            0,
            1,
            0,
            await utils.diEmb(
              client,
              2,
              interaction,
              userO,
              [userO.id, tc(tRole.hexColor).toHex()],
              color,
              getTS('COLOR_CURRENT'),
              0
            )
          );
        }
      } else {
        utils.iCP(
          client,
          0,
          interaction,
          0,
          1,
          0,
          await utils.diEmb(
            client,
            2,
            interaction,
            userO,
            [],
            0,
            getTS('COLOR_NO_ROLE'),
            0
          )
        );
      }
    }
    if (interaction.isButton()) {
      var component_id = interaction.data.custom_id;
      if (!component_id.startsWith('color_')) return;
      var message = interaction.message;
      var embIURL = new URL(message.embeds[0].image.url).pathname.split(
        /[\/&]/
      );
      var embAURL = new URL(message.embeds[0].footer.icon_url).pathname.split(
        /[\/&]/
      );
      color = embIURL[2];
      var diEV = [embAURL[2], embIURL[4]];

      if (userO.id != diEV[0]) {
        return utils.iCP(client, 0, interaction, 0, 1, 0, 1);
      }
      if (component_id == 'color_cancel') {
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(
            client,
            2,
            interaction,
            userO,
            1,
            color,
            getTS('COLOR_CANCELED'),
            1,
            0
          ),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 4,
                  label: getTS(['GENERIC', 'COMPONENT_MESSAGE_DELETE']),
                  emoji: {
                    name: '🧹',
                  },
                  custom_id: 'color_message_delete',
                },
              ],
            },
          ]
        );
      } else if (component_id == 'color_confirm') {
        if (tRole) {
          async function reSC() {
            eTitle = getTS('COLOR_CHANGED_ROLE');
            tRole.setPosition(pos - 1);
            tRole.setColor(color);
            setInterval(() => {
              if (tc(tRole.hexColor).toHex() != color) {
                reSC();
                console.log('Resetting Color');
              }
            }, 1500);
          }
          reSC();
        } else {
          async function reCR() {
            eTitle = getTS('COLOR_CREATED_ASSIGNED_ROLE');
            guild.roles
              .create({
                data: {
                  name: tRoleN,
                  color: color,
                  position: pos,
                },
              })
              .then((tRole) => {
                function reAR() {
                  userO.roles.add(tRole);
                  setInterval(() => {
                    if (!userO.roles.cache.find((r) => r.name == tRoleN)) {
                      reAR();
                      console.log('Readding Role');
                    }
                  }, 1500);
                }
                reAR();
              });
            setInterval(() => {
              if (!guild.roles.cache.find((x) => x.name == tRoleN)) {
                reCR();
                console.log('Recreating Role');
              }
            }, 1500);
          }
          reCR();
        }

        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(
            client,
            2,
            interaction,
            userO,
            1,
            color,
            eTitle,
            1,
            0
          ),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 4,
                  label: getTS(['GENERIC', 'COMPONENT_MESSAGE_DELETE']),
                  emoji: {
                    name: '🧹',
                  },
                  custom_id: 'color_message_delete',
                },
              ],
            },
          ]
        );
      } else if (component_id == 'color_edit') {
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(
            client,
            2,
            interaction,
            userO,
            1,
            color,
            getTS('COLOR_EDIT'),
            1,
            0,
            `${color}+->`
          ),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 2,
                  emoji: {
                    name: '↩️',
                  },
                  custom_id: 'color_back',
                },
              ],
            },
          ]
        );

        var filter = (msg) => msg.author.id == userO.id;

        function fm1() {
          async function checkV() {
            message = await utils.iCP(client, 4, interaction);
            if (message.embeds[0].title == getTS('COLOR_EDIT')) {
              return 1;
            } else if (message.embeds[0].title == getTS('COLOR_EDIT_INVALID')) {
              return 2;
            } else if (
              message.embeds[0].title == getTS('COLOR_EDITED_REPEAT')
            ) {
              return 3;
            } else {
              return 0;
            }
          }

          var channel = client.channels.cache.find(
            (c) => c.id == message.channel_id
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
              if (tc(msg.content).isValid()) {
                color = tc(msg.content).toHex().replace('000000', '000001');

                utils.iCP(
                  client,
                  3,
                  interaction,
                  0,
                  0,
                  0,
                  await utils.diEmb(
                    client,
                    2,
                    interaction,
                    userO,
                    1,
                    color,
                    getTS('COLOR_EDITED_REPEAT'),
                    1,
                    0,
                    `${color}+->`
                  )
                );

                msg.delete();

                fm1();
              } else {
                utils.iCP(
                  client,
                  3,
                  interaction,
                  0,
                  0,
                  0,
                  await utils.diEmb(
                    client,
                    2,
                    interaction,
                    userO,
                    1,
                    color,
                    getTS('COLOR_EDIT_INVALID'),
                    1,
                    0,
                    `${color}+->`
                  )
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
                await utils.diEmb(
                  client,
                  2,
                  interaction,
                  userO,
                  1,
                  color,
                  getTS('COLOR_TIME_OUT'),
                  0,
                  0
                ),
                [
                  {
                    type: 'SUB_COMMAND',
                    components: [
                      {
                        type: 'SUB_COMMAND_GROUP',
                        style: 2,
                        emoji: {
                          name: '↩️',
                        },
                        custom_id: 'color_back',
                      },
                      {
                        type: 'SUB_COMMAND_GROUP',
                        style: 2,
                        emoji: {
                          name: '🔄',
                        },
                        custom_id: 'color_edit',
                      },
                    ],
                  },
                ]
              );
            });
        }
        fm1();
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(
            client,
            2,
            interaction,
            userO,
            1,
            color,
            getTS('COLOR_EDIT'),
            1,
            0,
            `${color}+->`
          ),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 2,
                  emoji: {
                    name: '↩️',
                  },
                  custom_id: 'color_back',
                },
              ],
            },
          ]
        );
      } else if (component_id == 'color_preview') {
        function reSPC() {
          tRole.setColor(color);
          setInterval(() => {
            if (tc(tRole.hexColor).toHex() != color) {
              reSPC();
              console.log('Resetting Preview Color');
            }
          }, 1500);
        }
        reSPC();

        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(
            client,
            2,
            interaction,
            userO,
            1,
            color,
            getTS('COLOR_PREVIEW'),
            1
          ),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 2,
                  emoji: {
                    name: '↩️',
                  },
                  custom_id: 'color_back_preview',
                },
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 2,
                  emoji: {
                    name: '✅',
                  },
                  custom_id: 'color_confirm',
                },
              ],
            },
          ]
        );
      } else if (component_id == 'color_random') {
        color = tc.random().toHex().replace('000000', '000001');
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(
            client,
            2,
            interaction,
            userO,
            1,
            color,
            getTS('COLOR_LIKE'),
            1
          ),
          dftC
        );
      } else if (component_id == 'color_lighten') {
        color = tc(color).brighten(10).toHex().replace('000000', '000001');
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(
            client,
            2,
            interaction,
            userO,
            1,
            color,
            getTS('COLOR_LIKE'),
            1
          ),
          dftC
        );
      } else if (component_id == 'color_darken') {
        color = tc(color).darken(10).toHex().replace('000000', '000001');
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(
            client,
            2,
            interaction,
            userO,
            1,
            color,
            getTS('COLOR_LIKE'),
            1
          ),
          dftC
        );
      } else if (component_id == 'color_mix') {
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(
            client,
            2,
            interaction,
            userO,
            1,
            color,
            getTS('COLOR_MIX'),
            1,
            0,
            `${color}+＋`
          ),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 2,
                  emoji: {
                    name: '↩️',
                  },
                  custom_id: 'color_back',
                },
              ],
            },
          ]
        );

        var filter = (msg) => msg.author.id == userO.id;

        async function fm1() {
          async function checkV() {
            message = await utils.iCP(client, 4, interaction);
            if (message.embeds[0].title == getTS('COLOR_MIX')) {
              return 1;
            } else if (message.embeds[0].title == getTS('COLOR_MIXED_REPEAT')) {
              return 2;
            } else if (message.embeds[0].title == getTS('COLOR_MIX_INVALID')) {
              return 3;
            } else {
              return 0;
            }
          }

          var channel = client.channels.cache.find(
            (c) => c.id == message.channel_id
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
              if (tc(msg.content).isValid()) {
                color = tc
                  .mix(color, msg.content, (amount = 50))
                  .toHex()
                  .replace('000000', '000001');

                utils.iCP(
                  client,
                  3,
                  interaction,
                  0,
                  0,
                  0,
                  await utils.diEmb(
                    client,
                    2,
                    interaction,
                    userO,
                    1,
                    color,
                    getTS('COLOR_MIXED_REPEAT'),
                    1,
                    0,
                    `${color}+＋`
                  )
                );

                msg.delete();

                fm1();
              } else {
                utils.iCP(
                  client,
                  3,
                  interaction,
                  0,
                  0,
                  0,
                  await utils.diEmb(
                    client,
                    2,
                    interaction,
                    userO,
                    1,
                    color,
                    getTS('COLOR_MIX_INVALID'),
                    1,
                    0,
                    `${color}+＋`
                  )
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
                await utils.diEmb(
                  client,
                  2,
                  interaction,
                  userO,
                  1,
                  color,
                  getTS('COLOR_TIME_OUT'),
                  0,
                  0
                ),
                [
                  {
                    type: 'SUB_COMMAND',
                    components: [
                      {
                        type: 'SUB_COMMAND_GROUP',
                        style: 2,
                        emoji: {
                          name: '↩️',
                        },
                        custom_id: 'color_back',
                      },
                      {
                        type: 'SUB_COMMAND_GROUP',
                        style: 2,
                        emoji: {
                          name: '🔄',
                        },
                        custom_id: 'color_mix',
                      },
                    ],
                  },
                ]
              );
            });
        }
        fm1();
      } else if (component_id.startsWith('color_back')) {
        if (component_id == 'color_back_preview') {
          function reSBPC() {
            tRole.setColor(diEV[1]);
            setInterval(() => {
              if (tc(tRole.hexColor).toHex() != diEV[1]) {
                reSBPC();
                console.log('Resetting Back Previous Color');
              }
            }, 1500);
          }
          reSBPC();
        }
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(
            client,
            2,
            interaction,
            userO,
            1,
            color,
            getTS('COLOR_LIKE'),
            1
          ),
          dftC
        );
      } else if (component_id == 'color_message_delete') {
        utils.iCP(client, 5, interaction);
      }
    }
  },
};
