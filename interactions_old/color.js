/* eslint-disable */

// Old bullshit
const chalk = require('chalk'),
  //FIXME: { getColorFromURL } = require('color-thief-node'),
  Discord = require('discord.js'),
  tc = require('tinycolor2'),
  utils = require('../utils.js');
require('colors');
require('log-timestamp');

module.exports = {
  name: '',
  async execute(client, interaction) {
    function getTS(path, values) {
      return utils.getTSE(interaction.guild_id, path, values);
    }
    const guildI = client.guilds.cache.get(interaction.guild_id);
    if (guildI) {
      var uI = guildI.members.cache.get(interaction.member.user.id),
        uIF = await client.users.fetch(interaction.member.user.id),
        channelI = guildI.channels.cache.get(interaction.channel_id),
        tRoleN = uI ? `USER-${uI.id}` : '',
        tRole = guildI.roles.cache.find(x => x.name == tRoleN),
        pos = guildI.me.roles.highest.position;
    }

    function dftCF(disabled) {
      if (!disabled) {
        var disabled = [];
      }
      function getValue(id) {
        return typeof disabled.find(item => item.id === id) !== 'undefined'
          ? disabled.find(item => item.id === id).value
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
              custom_id: ['COLOR', 'EDIT'],
              disabled: getValue('edit'),
            },
            {
              type: 'SUB_COMMAND_GROUP',
              style: 2,
              emoji: {
                name: '🔍',
              },
              custom_id: ['COLOR', 'PREVIEW'],
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
              custom_id: ['COLOR', 'MIX'],
              disabled: getValue('mix'),
            },
          ],
        },
      ];
    }
    let dftC = dftCF();
    if (!tRole) {
      dftC = dftCF([{ id: 'preview', value: true }]);
    }

    if (interaction.data.name) {
      const command = interaction.data.name.toLowerCase(),
        args = interaction.data.options;

      if (command == 'color') {
        if (!guildI) {
          return utils.iCP(client, 0, interaction, [0, getTS(['ERROR', 'DM'])], 1, 0, 1);
        }

        const alwCH = db.get(guildI, 'color_allowed_channels');
        if (!alwCH || !alwCH.includes(channelI.id)) {
          return utils.iCP(client, 0, interaction, [0, getTS(['ERROR', 'UNALLOWED', 'CHAT'])], 1, 0, 1);
        }

        if (args.find(arg => arg.name == 'change')) {
          var color = args.find(arg => arg.options);
          const pColor = tRole ? tc(tRole.hexColor).toHex() : [];
          var eTitle = getTS(['COLOR', 'SPECIFIED']);
          if (color) {
            if (color.options?.find(arg => arg.name == 'color')) {
              color = color.options?.find(arg => arg.name == 'color').value;
            }
          } else {
            const [r, g, b] = await getColorFromURL(uIF.avatarURL({ format: 'png' }));
            color = tc(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex();
            eTitle = getTS(['COLOR', 'AVATAR_ESTIMATED']);
          }
          if (tc(color).isValid()) {
            var color = tc(color).toHex();
          } else {
            return utils.iCP(client, 0, interaction, 0, 1, 0, await utils.diEmb(client, 2, interaction, uIF));
          }

          var color = color.replace('000000', '000001');

          utils.iCP(
            client,
            0,
            interaction,
            0,
            0,
            0,
            await utils.diEmb(client, 2, interaction, uIF, [pColor], color, eTitle, 0),
            dftC,
          );
        } else if (args.find(arg => arg.name == 'current')) {
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
                getTS(['COLOR', 'CURRENT']),
                0,
              ),
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
            await utils.diEmb(client, 2, interaction, uIF, [], 0, getTS(['COLOR', 'NO_ROLE']), 0),
          );
        }
      }
    }
    if (interaction.data.custom_id) {
      const component_id = interaction.data.custom_id;
      if (!component_id.startsWith('color_')) return;
      let message = interaction.message;
      const embIURL = new URL(message.embeds[0].image.url).pathname.split(/[\/&]/),
        embAURL = new URL(message.embeds[0].footer.icon_url).pathname.split(/[\/&]/);
      color = embIURL[2];
      const diEV = [embAURL[2], embIURL[4]];

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
          await utils.diEmb(client, 2, interaction, uIF, 1, color, getTS(['COLOR', 'CANCELED']), 1, 0),
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
                  custom_id: 'color_message_delete',
                },
              ],
            },
          ],
        );
      } else if (component_id == 'color_confirm') {
        if (tRole) {
          async function reSC() {
            eTitle = getTS(['COLOR', 'CHANGED_ROLE']);
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
            eTitle = getTS(['COLOR', 'CREATED_ASSIGNED_ROLE']);
            guildI.roles
              .create({
                data: {
                  name: tRoleN,
                  color: color,
                  position: pos,
                },
              })
              .then(tRole => {
                function reAR() {
                  uI.roles.add(tRole);
                  setInterval(() => {
                    if (!uI.roles.cache.find(r => r.name == tRoleN)) {
                      reAR();
                      console.log('Readding Role');
                    }
                  }, 1500);
                }
                reAR();
              });
            setInterval(() => {
              if (!guildI.roles.cache.find(x => x.name == tRoleN)) {
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
          await utils.diEmb(client, 2, interaction, uIF, 1, color, eTitle, 1, 0),
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
                  custom_id: 'color_message_delete',
                },
              ],
            },
          ],
        );
      } else if (component_id == ['COLOR', 'EDIT']) {
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(client, 2, interaction, uIF, 1, color, getTS(['COLOR', 'EDIT']), 1, 0, `${color}+->`),
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
          ],
        );

        var filter = msg => msg.author.id == uI.id;

        function fm1() {
          async function checkV() {
            message = await utils.iCP(client, 4, interaction);
            if (message.embeds[0].title == getTS(['COLOR', 'EDIT'])) {
              return 1;
            }
            if (message.embeds[0].title == getTS(['COLOR', 'EDIT_INVALID'])) {
              return 2;
            }
            if (message.embeds[0].title == getTS(['COLOR', 'EDITED_REPEAT'])) {
              return 3;
            }

            return 0;
          }

          const channel = client.channels.cache.find(c => c.id == message.channel_id);
          channel
            .awaitMessages(filter, {
              max: 1,
              time: 60000,
              errors: ['time'],
            })
            .then(async msg => {
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
                    getTS(['COLOR', 'EDITED_REPEAT']),
                    1,
                    0,
                    `${color}+->`,
                  ),
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
                    getTS(['COLOR', 'EDIT_INVALID']),
                    1,
                    0,
                    `${color}+->`,
                  ),
                );

                msg.delete();

                fm1();
              }
            })
            .catch(async err => {
              if ((await checkV()) == 0) return;
              utils.iCP(
                client,
                3,
                interaction,
                0,
                0,
                0,
                await utils.diEmb(client, 2, interaction, uIF, 1, color, getTS('COLOR_TIME_OUT'), 0, 0),
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
                        custom_id: ['COLOR', 'EDIT'],
                      },
                    ],
                  },
                ],
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
          await utils.diEmb(client, 2, interaction, uIF, 1, color, getTS(['COLOR', 'EDIT']), 1, 0, `${color}+->`),
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
          ],
        );
      } else if (component_id == ['COLOR', 'PREVIEW']) {
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
          await utils.diEmb(client, 2, interaction, uIF, 1, color, getTS(['COLOR', 'PREVIEW']), 1),
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
          ],
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
          await utils.diEmb(client, 2, interaction, uIF, 1, color, getTS(['COLOR', 'LIKE']), 1),
          dftC,
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
          await utils.diEmb(client, 2, interaction, uIF, 1, color, getTS(['COLOR', 'LIKE']), 1),
          dftC,
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
          await utils.diEmb(client, 2, interaction, uIF, 1, color, getTS(['COLOR', 'LIKE']), 1),
          dftC,
        );
      } else if (component_id == ['COLOR', 'MIX']) {
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(client, 2, interaction, uIF, 1, color, getTS(['COLOR', 'MIX']), 1, 0, `${color}+＋`),
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
          ],
        );

        var filter = msg => msg.author.id == uI.id;

        async function fm1() {
          async function checkV() {
            message = await utils.iCP(client, 4, interaction);
            if (message.embeds[0].title == getTS(['COLOR', 'MIX'])) {
              return 1;
            }
            if (message.embeds[0].title == getTS(['COLOR', 'MIXED_REPEAT'])) {
              return 2;
            }
            if (message.embeds[0].title == getTS(['COLOR', 'MIX_INVALID'])) {
              return 3;
            }

            return 0;
          }

          const channel = client.channels.cache.find(c => c.id == message.channel_id);
          channel
            .awaitMessages(filter, {
              max: 1,
              time: 60000,
              errors: ['time'],
            })
            .then(async msg => {
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
                    getTS(['COLOR', 'MIXED_REPEAT']),
                    1,
                    0,
                    `${color}+＋`,
                  ),
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
                    getTS(['COLOR', 'MIX_INVALID']),
                    1,
                    0,
                    `${color}+＋`,
                  ),
                );

                msg.delete();

                fm1();
              }
            })
            .catch(async err => {
              if ((await checkV()) == 0) return;
              utils.iCP(
                client,
                3,
                interaction,
                0,
                0,
                0,
                await utils.diEmb(client, 2, interaction, uIF, 1, color, getTS('COLOR_TIME_OUT'), 0, 0),
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
                        custom_id: ['COLOR', 'MIX'],
                      },
                    ],
                  },
                ],
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
          await utils.diEmb(client, 2, interaction, uIF, 1, color, getTS(['COLOR', 'LIKE']), 1),
          dftC,
        );
      } else if (component_id == 'color_message_delete') {
        utils.iCP(client, 5, interaction);
      }
    }
  },
};
