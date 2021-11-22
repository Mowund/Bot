/* eslint-disable no-inner-declarations */

'use strict';

// Old bullshit
const chalk = require('chalk'),
  { getColorFromURL } = require('color-thief-node'),
  tc = require('tinycolor2'),
  { botOwners } = require('../defaults.js'),
  utils = require('../utils.js');
require('colors');
require('log-timestamp');

module.exports = {
  data: [
    {
      name: 'color',
      description: 'Role color system.',
      options: [
        {
          name: 'change',
          description: 'Changes the color of a color role.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'color',
              description: 'Any supported color.',
              type: 'STRING',
            },
            {
              name: 'user',
              description: 'An user. (Requires: Manage roles)',
              type: 'USER',
            },
            {
              name: 'ephemeral',
              description: 'Send reply as an ephemeral message. (Default: True)',
              type: 'BOOLEAN',
            },
          ],
        },
        {
          name: 'current',
          description: 'The current color of a color role.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user',
              description: 'An user. (Requires: Manage roles)',
              type: 'USER',
            },
            {
              name: 'ephemeral',
              description: 'Send reply as an ephemeral message. (Default: True)',
              type: 'BOOLEAN',
            },
          ],
        },
        {
          name: 'remove',
          description: 'Deletes a color role.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user',
              description: 'An user. (Requires: Manage roles)',
              type: 'USER',
            },
            {
              name: 'ephemeral',
              description: 'Send reply as an ephemeral message. (Default: True)',
              type: 'BOOLEAN',
            },
          ],
        },
      ],
    },
  ],
  guildOnly: ['420007989261500418'],
  async execute(client, interaction, st, emb) {
    const { user, guild, options } = interaction,
      userO = options?.getUser('user') ?? user,
      tRoleN = userO ? `USER-${userO.id}` : '',
      tRole = guild.roles.cache.find(x => x.name === tRoleN),
      pos = guild.roles.botRoleFor(client.user.id).position;

    if (!interaction.inGuild()) {
      return interaction.reply({
        embeds: [emb({ type: 'error' }).setDescription(st.__('ERROR.DM'))],
        ephemeral: true,
      });
    }

    if (!botOwners.includes(user.id)) {
      return interaction.reply({
        embeds: [emb({ type: 'wip' })],
        ephemeral: true,
      });
    }

    console.log(pos);
    function dftCF(disabled) {
      if (!disabled) {
        disabled = [];
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

    if (interaction.isCommand()) {
      // Let alwCH = database.get(guild, 'color_allowed_channels');
      // if (!alwCH || !alwCH.includes(channelI.id))
      //  return utils.iCP(
      //    client,
      //    0,
      //    interaction,
      //    [0, st.__('ERROR.UNALLOWED.CHAT')],
      //    1,
      //    0,
      //    1
      //  );

      if (options?.getSubcommand('change')) {
        let color = options?.getString('color'),
          pColor = [];
        if (tRole) {
          pColor = tc(tRole.hexColor).toHex();
        }
        let eTitle = st.__('COLOR.SPECIFIED');
        if (!color) {
          const [r, g, b] = await getColorFromURL(userO.avatarURL({ format: 'png' }));
          color = tc(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex();
          eTitle = st.__('COLOR.AVATAR_ESTIMATED');
        }
        if (tc(color).isValid()) {
          color = tc(color).toHex();
        } else {
          return utils.iCP(client, 0, interaction, 0, 1, 0, await utils.diEmb(client, 2, interaction, userO));
        }

        color = color.replace('000000', '000001');

        interaction.reply(await utils.diEmb(client, 2, interaction, userO, [pColor], color, eTitle, 0), dftC);
      } else if (options?.getSubcommand('current')) {
        if (tRole) {
          const color = tc(tRole.hexColor).toHex();
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
              st.__('COLOR.CURRENT'),
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
          await utils.diEmb(client, 2, interaction, userO, [], 0, st.__('COLOR.NO_ROLE'), 0),
        );
      }
    }
    if (interaction.isButton()) {
      const component_id = interaction.data.custom_id;
      if (!component_id.startsWith('color_')) return;
      let message = interaction.message;
      const embIURL = new URL(message.embeds[0].image.url).pathname.split(/[/&]/),
        embAURL = new URL(message.embeds[0].footer.icon_url).pathname.split(/[/&]/);
      let color = embIURL[2],
        eTitle;
      const diEV = [embAURL[2], embIURL[4]];

      if (userO.id !== diEV[0]) {
        return utils.iCP(client, 0, interaction, 0, 1, 0, 1);
      }
      if (component_id === 'color_cancel') {
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.CANCELED'), 1, 0),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 4,
                  label: st.__('GENERIC.COMPONENT.MESSAGE_DELETE'),
                  emoji: {
                    name: '🧹',
                  },
                  custom_id: 'color_message_delete',
                },
              ],
            },
          ],
        );
      } else if (component_id === 'color_confirm') {
        if (tRole) {
          function reSC() {
            eTitle = st.__('COLOR.CHANGED_ROLE');
            tRole.setPosition(pos - 1);
            tRole.setColor(color);
            setInterval(() => {
              if (tc(tRole.hexColor).toHex() !== color) {
                reSC();
                console.log('Resetting Color');
              }
            }, 1500);
          }
          reSC();
        } else {
          function reCR() {
            eTitle = st.__('COLOR.CREATED_ASSIGNED_ROLE');
            guild.roles
              .create({
                data: {
                  name: tRoleN,
                  color: color,
                  position: pos,
                },
              })
              .then(role => {
                function reAR() {
                  userO.roles.add(role);
                  setInterval(() => {
                    if (!userO.roles.cache.find(r => r.name === tRoleN)) {
                      reAR();
                      console.log('Readding Role');
                    }
                  }, 1500);
                }
                reAR();
              });
            setInterval(() => {
              if (!guild.roles.cache.find(x => x.name === tRoleN)) {
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
          await utils.diEmb(client, 2, interaction, userO, 1, color, eTitle, 1, 0),
          [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 4,
                  label: st.__('GENERIC.COMPONENT.MESSAGE_DELETE'),
                  emoji: {
                    name: '🧹',
                  },
                  custom_id: 'color_message_delete',
                },
              ],
            },
          ],
        );
      } else if (component_id === ['COLOR', 'EDIT']) {
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.EDIT'), 1, 0, `${color}+->`),
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

        const filter = msg => msg.author.id === userO.id;

        function fm1() {
          async function checkV() {
            message = await utils.iCP(client, 4, interaction);
            if (message.embeds[0].title === st.__('COLOR.EDIT')) {
              return 1;
            }
            if (message.embeds[0].title === st.__('COLOR.EDIT_INVALID')) {
              return 2;
            }
            if (message.embeds[0].title === st.__('COLOR.EDITED_REPEAT')) {
              return 3;
            }
            return 0;
          }

          const channel = client.channels.cache.find(c => c.id === message.channel_id);
          channel
            .awaitMessages(filter, {
              max: 1,
              time: 60000,
              errors: ['time'],
            })
            .then(async msg => {
              if ((await checkV()) === 0) return;
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
                    st.__('COLOR.EDITED_REPEAT'),
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
                    userO,
                    1,
                    color,
                    st.__('COLOR.EDIT_INVALID'),
                    1,
                    0,
                    `${color}+->`,
                  ),
                );

                msg.delete();

                fm1();
              }
            })
            .catch(async () => {
              if ((await checkV()) === 0) return;
              utils.iCP(
                client,
                3,
                interaction,
                0,
                0,
                0,
                await utils.diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.TIME_OUT'), 0, 0),
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
          await utils.diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.EDIT'), 1, 0, `${color}+->`),
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
      } else if (component_id === ['COLOR', 'PREVIEW']) {
        function reSPC() {
          tRole.setColor(color);
          setInterval(() => {
            if (tc(tRole.hexColor).toHex() !== color) {
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
          await utils.diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.PREVIEW'), 1),
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
      } else if (component_id === 'color_random') {
        color = tc.random().toHex().replace('000000', '000001');
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.LIKE'), 1),
          dftC,
        );
      } else if (component_id === 'color_lighten') {
        color = tc(color).brighten(10).toHex().replace('000000', '000001');
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.LIKE'), 1),
          dftC,
        );
      } else if (component_id === 'color_darken') {
        color = tc(color).darken(10).toHex().replace('000000', '000001');
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.LIKE'), 1),
          dftC,
        );
      } else if (component_id === ['COLOR', 'MIX']) {
        utils.iCP(
          client,
          3,
          interaction,
          0,
          0,
          0,
          await utils.diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.MIX'), 1, 0, `${color}+＋`),
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

        const filter = msg => msg.author.id === userO.id;

        function fm1() {
          async function checkV() {
            message = await utils.iCP(client, 4, interaction);
            if (message.embeds[0].title === st.__('COLOR.MIX')) {
              return 1;
            }
            if (message.embeds[0].title === st.__('COLOR.MIXED_REPEAT')) {
              return 2;
            }
            if (message.embeds[0].title === st.__('COLOR.MIX_INVALID')) {
              return 3;
            }
            return 0;
          }

          const channel = client.channels.cache.find(c => c.id === message.channel_id);
          channel
            .awaitMessages(filter, {
              max: 1,
              time: 60000,
              errors: ['time'],
            })
            .then(async msg => {
              if ((await checkV()) === 0) return;
              msg = msg.first();
              if (tc(msg.content).isValid()) {
                color = tc.mix(color, msg.content, 50).toHex().replace('000000', '000001');

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
                    st.__('COLOR.MIXED_REPEAT'),
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
                    userO,
                    1,
                    color,
                    st.__('COLOR.MIX_INVALID'),
                    1,
                    0,
                    `${color}+＋`,
                  ),
                );

                msg.delete();

                fm1();
              }
            })
            .catch(async () => {
              if ((await checkV()) === 0) return;
              utils.iCP(
                client,
                3,
                interaction,
                0,
                0,
                0,
                await utils.diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.TIME_OUT'), 0, 0),
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
        if (component_id === 'color_back_preview') {
          function reSBPC() {
            tRole.setColor(diEV[1]);
            setInterval(() => {
              if (tc(tRole.hexColor).toHex() !== diEV[1]) {
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
          await utils.diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.LIKE'), 1),
          dftC,
        );
      } else if (component_id === 'color_message_delete') {
        utils.iCP(client, 5, interaction);
      }
    }
  },
};
