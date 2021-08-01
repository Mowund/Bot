const Discord = require('discord.js');
const tc = require('tinycolor2');
const utils = require('../../utils/utils.js');
const chalk = require('chalk');
const colorSchema = require('../../schemas/color-schema');
const { getColorFromURL } = require('color-thief-node');
require('colors');
require('log-timestamp');

module.exports = async (client, instance) => {
  client.ws.on('INTERACTION_CREATE', async (interaction) => {
    const guildI = client.guilds.cache.get(interaction.guild_id);
    const channelI = guildI.channels.cache.get(interaction.channel_id);
    const uI = guildI.members.cache.get(interaction.member.user.id);
    const uIF = await client.users.fetch(uI.id);
    function getTS(path, values) {
      return utils.getTSE(instance, guildI, path, values);
    }

    var tRoleN = `USER-${uI.id}`;
    var tRole = guildI.roles.cache.find((x) => x.name == tRoleN);
    var pos = guildI.me.roles.highest.position;

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
        cS = await colorSchema.findOne();
        if (!cS.cI.includes(channelI.id))
          return utils.iCP(
            instance,
            client,
            0,
            interaction,
            [0, getTS('GENERIC_UNALLOWED_CHAT')],
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
          var eTitle = getTS('COLOR_SPECIFIED');
          if (color) {
            if (color.options.find((arg) => arg.name == 'color')) {
              color = color.options.find((arg) => arg.name == 'color').value;
            }
          } else {
            var [r, g, b] = await getColorFromURL(
              uIF.avatarURL({ format: 'png' })
            );
            color = tc(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex();
            eTitle = getTS('COLOR_AVATAR_ESTIMATED');
          }
          if (tc(color).isValid()) {
            var color = tc(color).toHex();
          } else {
            return utils.iCP(
              instance,
              client,
              0,
              interaction,
              0,
              1,
              0,
              utils.diEmb(instance, client, 2, interaction, uIF)
            );
          }

          var color = color.replace('000000', '000001');

          utils.iCP(
            instance,
            client,
            0,
            interaction,
            0,
            0,
            0,
            utils.diEmb(
              instance,
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
              instance,
              client,
              0,
              interaction,
              0,
              1,
              0,
              utils.diEmb(
                instance,
                client,
                2,
                interaction,
                uIF,
                [uIF.id, tc(tRole.hexColor).toHex()],
                color,
                getTS('COLOR_CURRENT'),
                0
              )
            );
          }
        } else {
          utils.iCP(
            instance,
            client,
            0,
            interaction,
            0,
            1,
            0,
            utils.diEmb(
              instance,
              client,
              2,
              interaction,
              uIF,
              [],
              0,
              getTS('COLOR_NO_ROLE'),
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
        return utils.iCP(instance, client, 0, interaction, 0, 1, 0, 1);
      }
      if (component_id == 'color_cancel') {
        utils.iCP(
          instance,
          client,
          3,
          interaction,
          0,
          0,
          0,
          utils.diEmb(
            instance,
            client,
            2,
            interaction,
            uIF,
            1,
            color,
            getTS('COLOR_CANCELED'),
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
                  label: getTS('GENERIC_COMPONENT_MESSAGE_DELETE'),
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
          function reSC() {
            eTitle = getTS('COLOR_CHANGED_ROLE');
            tRole.setPosition(pos - 1);
            tRole.setColor(color);
            client.setTimeout(() => {
              if (tc(tRole.hexColor).toHex() != color) {
                reSC();
                console.log('Resetting Color');
              }
            }, 1500);
          }
          reSC();
        } else {
          function reCR() {
            eTitle = getTS('COLOR_CREATED_ASSIGNED_ROLE');
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
                  client.setTimeout(() => {
                    if (!uI.roles.cache.find((r) => r.name == tRoleN)) {
                      reAR();
                      console.log('Readding Role');
                    }
                  }, 1500);
                }
                reAR();
              });
            client.setTimeout(() => {
              if (!guildI.roles.cache.find((x) => x.name == tRoleN)) {
                reCR();
                console.log('Recreating Role');
              }
            }, 1500);
          }
          reCR();
        }

        utils.iCP(
          instance,
          client,
          3,
          interaction,
          0,
          0,
          0,
          utils.diEmb(
            instance,
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
                  label: getTS('GENERIC_COMPONENT_MESSAGE_DELETE'),
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
          instance,
          client,
          3,
          interaction,
          0,
          0,
          0,
          utils.diEmb(
            instance,
            client,
            2,
            interaction,
            uIF,
            1,
            color,
            getTS('COLOR_EDIT'),
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
            message = await utils.iCP(instance, client, 4, interaction);
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
                  instance,
                  client,
                  3,
                  interaction,
                  0,
                  0,
                  0,
                  utils.diEmb(
                    instance,
                    client,
                    2,
                    interaction,
                    uIF,
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
                  instance,
                  client,
                  3,
                  interaction,
                  0,
                  0,
                  0,
                  utils.diEmb(
                    instance,
                    client,
                    2,
                    interaction,
                    uIF,
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
                instance,
                client,
                3,
                interaction,
                0,
                0,
                0,
                utils.diEmb(
                  instance,
                  client,
                  2,
                  interaction,
                  uIF,
                  1,
                  color,
                  getTS('COLOR_TIME_OUT'),
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
          instance,
          client,
          3,
          interaction,
          0,
          0,
          0,
          utils.diEmb(
            instance,
            client,
            2,
            interaction,
            uIF,
            1,
            color,
            getTS('COLOR_EDIT'),
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
          client.setTimeout(() => {
            if (tc(tRole.hexColor).toHex() != color) {
              reSPC();
              console.log('Resetting Preview Color');
            }
          }, 1500);
        }
        reSPC();

        utils.iCP(
          instance,
          client,
          3,
          interaction,
          0,
          0,
          0,
          utils.diEmb(
            instance,
            client,
            2,
            interaction,
            uIF,
            1,
            color,
            getTS('COLOR_PREVIEW'),
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
          instance,
          client,
          3,
          interaction,
          0,
          0,
          0,
          utils.diEmb(
            instance,
            client,
            2,
            interaction,
            uIF,
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
          instance,
          client,
          3,
          interaction,
          0,
          0,
          0,
          utils.diEmb(
            instance,
            client,
            2,
            interaction,
            uIF,
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
          instance,
          client,
          3,
          interaction,
          0,
          0,
          0,
          utils.diEmb(
            instance,
            client,
            2,
            interaction,
            uIF,
            1,
            color,
            getTS('COLOR_LIKE'),
            1
          ),
          dftC
        );
      } else if (component_id == 'color_mix') {
        utils.iCP(
          instance,
          client,
          3,
          interaction,
          0,
          0,
          0,
          utils.diEmb(
            instance,
            client,
            2,
            interaction,
            uIF,
            1,
            color,
            getTS('COLOR_MIX'),
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
            message = await utils.iCP(instance, client, 4, interaction);
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
                  instance,
                  client,
                  3,
                  interaction,
                  0,
                  0,
                  0,
                  utils.diEmb(
                    instance,
                    client,
                    2,
                    interaction,
                    uIF,
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
                  instance,
                  client,
                  3,
                  interaction,
                  0,
                  0,
                  0,
                  utils.diEmb(
                    instance,
                    client,
                    2,
                    interaction,
                    uIF,
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
                instance,
                client,
                3,
                interaction,
                0,
                0,
                0,
                utils.diEmb(
                  instance,
                  client,
                  2,
                  interaction,
                  uIF,
                  1,
                  color,
                  getTS('COLOR_TIME_OUT'),
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
            client.setTimeout(() => {
              if (tc(tRole.hexColor).toHex() != diEV[1]) {
                reSBPC();
                console.log('Resetting Back Previous Color');
              }
            }, 1500);
          }
          reSBPC();
        }
        utils.iCP(
          instance,
          client,
          3,
          interaction,
          0,
          0,
          0,
          utils.diEmb(
            instance,
            client,
            2,
            interaction,
            uIF,
            1,
            color,
            getTS('COLOR_LIKE'),
            1
          ),
          dftC
        );
      } else if (component_id == 'color_message_delete') {
        utils.iCP(instance, client, 5, interaction);
      }
    }
  });
};

module.exports.config = {
  displayName: 'Color Interaction',
  dbName: 'ColorI',
  loadDBFirst: true,
};
