const Discord = require('discord.js');
const tc = require('tinycolor2');
const utils = require('../utils/utils.js');
const chalk = require('chalk');
const { getColorFromURL } = require('color-thief-node');
require('colors');
require('log-timestamp');

module.exports = {
  name: 'INTERACTION_CREATE',
  async execute(client, interaction) {
    function getTS(path, values) {
      return utils.getTSE(interaction.guild_id, path, values);
    }
    var guildI = client.guilds.cache.get(interaction.guild_id);
    if (guildI) {
      var uI = guildI.members.cache.get(interaction.member.user.id);
      var uIF = await client.users.fetch(interaction.member.user.id);
      var channelI = guildI.channels.cache.get(interaction.channel_id);
      var tRoleN = uI ? `USER-${uI.id}` : '';
      var tRole = guildI.roles.cache.find((x) => x.name == tRoleN);
      var pos = guildI.me.roles.highest.position;
    }

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
          type: 1,
          components: [
            {
              type: 2,
              style: 2,
              emoji: {
                name: '⛔',
              },
              custom_id: 'color_cancel',
              disabled: getValue('cancel'),
            },
            {
              type: 2,
              style: 2,
              emoji: {
                name: '✅',
              },
              custom_id: 'color_confirm',
              disabled: getValue('confirm'),
            },
            {
              type: 2,
              style: 2,
              emoji: {
                name: '📝',
              },
              custom_id: 'color_edit',
              disabled: getValue('edit'),
            },
            {
              type: 2,
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
          type: 1,
          components: [
            {
              type: 2,
              style: 2,
              emoji: {
                name: '🔁',
              },
              custom_id: 'color_random',
              disabled: getValue('random'),
            },
            {
              type: 2,
              style: 2,
              emoji: {
                name: '⚪',
              },
              custom_id: 'color_lighten',
              disabled: getValue('ligthen'),
            },
            {
              type: 2,
              style: 2,
              emoji: {
                name: '⚫',
              },
              custom_id: 'color_darken',
              disabled: getValue('darken'),
            },
            {
              type: 2,
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

    if (interaction.data.name) {
      var command = interaction.data.name.toLowerCase();
      var args = interaction.data.options;

      if (command == 'color') {
        if (!guildI)
          return utils.iCP(
            client,
            0,
            interaction,
            [0, await getTS(['GENERIC', 'NO_DM'])],
            1,
            0,
            1
          );

        var alwCH = db.get(guildI, 'color_allowed_channels');
        if (!alwCH || !alwCH.includes(channelI.id))
          return utils.iCP(
            client,
            0,
            interaction,
            [0, await getTS(['GENERIC', 'UNALLOWED_CHAT'])],
            1,
            0,
            1
          );

        if (args.find((arg) => arg.name == 'change')) {
          var color = args.find((arg) => arg['options']);
          var pColor = [];
          if (tRole) {
            pColor = tc(tRole.hexColor).toHex();
          }
          var eTitle = await getTS('COLOR_SPECIFIED');
          if (color) {
            if (color.options.find((arg) => arg.name == 'color')) {
              color = color.options.find((arg) => arg.name == 'color').value;
            }
          } else {
            var [r, g, b] = await getColorFromURL(
              uIF.avatarURL({ format: 'png' })
            );
            color = tc(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex();
            eTitle = await getTS('COLOR_AVATAR_ESTIMATED');
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
              await utils.diEmb(client, 2, interaction, uIF)
            );
          }

          var color = color.replace('000000', '000001');

          utils.iCP(
            client,
            0,
            interaction,
            0,
            0,
            0,
            await utils.diEmb(
              client,
              2,
              interaction,
              uIF,
              [pColor],
              color,
              eTitle,
              0
            ),
            dftC
          );
        } else if (args.find((arg) => arg.name == 'current')) {
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
                uIF,
                [uIF.id, tc(tRole.hexColor).toHex()],
                color,
                await getTS('COLOR_CURRENT'),
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
              uIF,
              [],
              0,
              await getTS('COLOR_NO_ROLE'),
              0
            )
          );
        }
      }
    }
    if (interaction.data.custom_id) {
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

      if (uIF.id != diEV[0]) {
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
            uIF,
            1,
            color,
            await getTS('COLOR_CANCELED'),
            1,
            0
          ),
          [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 4,
                  label: await getTS(['GENERIC', 'COMPONENT_MESSAGE_DELETE']),
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
            eTitle = await getTS('COLOR_CHANGED_ROLE');
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
            eTitle = await getTS('COLOR_CREATED_ASSIGNED_ROLE');
            guildI.roles
              .create({
                data: {
                  name: tRoleN,
                  color: color,
                  position: pos,
                },
              })
              .then((tRole) => {
                function reAR() {
                  uI.roles.add(tRole);
                  setInterval(() => {
                    if (!uI.roles.cache.find((r) => r.name == tRoleN)) {
                      reAR();
                      console.log('Readding Role');
                    }
                  }, 1500);
                }
                reAR();
              });
            setInterval(() => {
              if (!guildI.roles.cache.find((x) => x.name == tRoleN)) {
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
            uIF,
            1,
            color,
            eTitle,
            1,
            0
          ),
          [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 4,
                  label: await getTS(['GENERIC', 'COMPONENT_MESSAGE_DELETE']),
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
            uIF,
            1,
            color,
            await getTS('COLOR_EDIT'),
            1,
            0,
            `${color}+->`
          ),
          [
            {
              type: 1,
              components: [
                {
                  type: 2,
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

        var filter = (msg) => msg.author.id == uI.id;

        function fm1() {
          async function checkV() {
            message = await utils.iCP(client, 4, interaction);
            if (message.embeds[0].title == (await getTS('COLOR_EDIT'))) {
              return 1;
            } else if (
              message.embeds[0].title == (await getTS('COLOR_EDIT_INVALID'))
            ) {
              return 2;
            } else if (
              message.embeds[0].title == (await getTS('COLOR_EDITED_REPEAT'))
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
                    uIF,
                    1,
                    color,
                    await getTS('COLOR_EDITED_REPEAT'),
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
                    uIF,
                    1,
                    color,
                    await getTS('COLOR_EDIT_INVALID'),
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
                  uIF,
                  1,
                  color,
                  await getTS('COLOR_TIME_OUT'),
                  0,
                  0
                ),
                [
                  {
                    type: 1,
                    components: [
                      {
                        type: 2,
                        style: 2,
                        emoji: {
                          name: '↩️',
                        },
                        custom_id: 'color_back',
                      },
                      {
                        type: 2,
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
            uIF,
            1,
            color,
            await getTS('COLOR_EDIT'),
            1,
            0,
            `${color}+->`
          ),
          [
            {
              type: 1,
              components: [
                {
                  type: 2,
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
            uIF,
            1,
            color,
            await getTS('COLOR_PREVIEW'),
            1
          ),
          [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 2,
                  emoji: {
                    name: '↩️',
                  },
                  custom_id: 'color_back_preview',
                },
                {
                  type: 2,
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
            uIF,
            1,
            color,
            await getTS('COLOR_LIKE'),
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
            uIF,
            1,
            color,
            await getTS('COLOR_LIKE'),
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
            uIF,
            1,
            color,
            await getTS('COLOR_LIKE'),
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
            uIF,
            1,
            color,
            await getTS('COLOR_MIX'),
            1,
            0,
            `${color}+＋`
          ),
          [
            {
              type: 1,
              components: [
                {
                  type: 2,
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

        var filter = (msg) => msg.author.id == uI.id;

        async function fm1() {
          async function checkV() {
            message = await utils.iCP(client, 4, interaction);
            if (message.embeds[0].title == (await getTS('COLOR_MIX'))) {
              return 1;
            } else if (
              message.embeds[0].title == (await getTS('COLOR_MIXED_REPEAT'))
            ) {
              return 2;
            } else if (
              message.embeds[0].title == (await getTS('COLOR_MIX_INVALID'))
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
                    uIF,
                    1,
                    color,
                    await getTS('COLOR_MIXED_REPEAT'),
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
                    uIF,
                    1,
                    color,
                    await getTS('COLOR_MIX_INVALID'),
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
                  uIF,
                  1,
                  color,
                  await getTS('COLOR_TIME_OUT'),
                  0,
                  0
                ),
                [
                  {
                    type: 1,
                    components: [
                      {
                        type: 2,
                        style: 2,
                        emoji: {
                          name: '↩️',
                        },
                        custom_id: 'color_back',
                      },
                      {
                        type: 2,
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
            uIF,
            1,
            color,
            await getTS('COLOR_LIKE'),
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
