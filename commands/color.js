const botconfig = require('../botconfig.json');
const errors = require('../utils/errors.js');
const utils = require('../utils/utils.js');
const Discord = require('discord.js');
const tc = require('tinycolor2');
const { getColorFromURL } = require('color-thief-node');
const chalk = require('chalk');
const colorSchema = require('../schemas/color-schema');
const url = require('url');

module.exports = {
  name: 'color',
  category: 'Utils',
  description: 'Altera a sua cor.',
  expectedArgs: 'change (cor)',
  minArgs: 1,
  callback: async ({ message, args, client, instance }) => {
    if (!message) return;
    if (!message.guild) return errors.disDM(message.channel);

    cS = await colorSchema.findOne();
    if (!cS.cI.includes(message.channel.id)) return;

    var { guild } = message;

    function getTS(path, values) {
      return utils.getTSE(instance, guild, path, values);
    }

    var roleO = guild.members.cache.get(message.author.id);
    var eTiI = getTS(message, 'COLOR_LIKE');
    var cMsg = [];

    if (args[1]) {
      eTiI = getTS('COLOR_SPECIFIED');
      if (!tc(args[1]).isValid()) {
        var uID = args[1].replace(/[\\<>@#&!]/g, '');
        roleO = guild.members.cache.get(uID);
      }
    }

    var roleC = tc(args.slice(1).join(' ')).toHex();

    if (guild.members.cache.get(uID)) {
      var uIDF = await client.users.fetch(roleO.id);
      var prC = await getColorFromURL(uIDF.avatarURL({ format: 'png' }));
      var [r, g, b] = prC;
      roleC = tc(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex();
      eTiI = getTS('COLOR_TARGET_AVATAR_ESTIMATED', {
        USER: uIDF.username,
      });

      if (uIDF == message.author.id) {
        cMsg = getTS('COLOR_SAME_USER_CAN_INTERACT', {
          USER: uIDF,
        });
      } else {
        cMsg = getTS('COLOR_USER_CAN_INTERACT', {
          USER: uIDF,
        });
      }

      if (tc(args[2]).isValid()) {
        eTiI = getTS('COLOR_SPECIFIED');
      }
    } else if (!args[1]) {
      var prC = await getColorFromURL(
        message.author.avatarURL({ format: 'png' })
      );
      var [r, g, b] = prC;
      roleC = tc(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex();
      eTiI = getTS('COLOR_AVATAR_ESTIMATED');
    }

    var roleN = `USER-${message.author.id}`;
    var role = guild.roles.cache.find((x) => x.name == roleN);

    if (args[0] == 'convert') {
      var roleC = tc(args[1]).toHex();
      var IDerr = getTS('COLOR_NO_ROLE');

      if (!tc(args[1]).isValid()) {
        roleN = `USER-${roleO.id}`;
        role = guild.roles.cache.find((x) => x.name == roleN);
        IDerr = getTS('COLOR_TARGET_NO_ROLE');
        roleC = tc(role.hexColor).toHex();

        if (!role) return message.channel.send(`${IDerr}`);
      }

      var cvRgb = tc(roleC).toRgbString();
      var RgbLk = encodeURI(cvRgb);

      utils.diEmb(
        instance,
        client,
        1,
        message,
        message.author,
        roleC,
        getTS('COLOR_RGB_CONVERT'),
        0,
        cvRgb,
        getTS('GENERIC_DEPRECATED', { COMMAND: '/color convert' }) +
          '\n' +
          RgbLk,
        roleC
      );
    }

    if (args[0] == 'current') {
      var IDerr = getTS('COLOR_NO_ROLE');

      if (args[1]) {
        roleN = `USER-${roleO.id}`;
        role = guild.roles.cache.find((x) => x.name == roleN);
        IDerr = getTS('COLOR_TARGET_NO_ROLE');
      }

      if (!role) return message.channel.send(`${IDerr}`);

      roleC = tc(role.hexColor).toHex();

      if (roleO.id == message.author.id) {
        eTiI = getTS('COLOR_CURRENT');
      } else {
        eTiI = getTS('COLOR_TARGET_CURRENT', { USER: uIDF.username });
      }
      utils.diEmb(
        instance,
        client,
        1,
        message,
        message.author,
        0,
        roleC,
        eTiI,
        0,
        getTS('GENERIC_DEPRECATED', { COMMAND: '/color current' })
      );
    }

    if (args[0] == 'remove') {
      var IDerr = getTS('COLOR_ALREADY_NO_ROLE');

      if (args[1]) {
        if (!message.member.hasPermission('MANAGE_ROLES'))
          return errors.noPerms(message, getTS(['PERMS', 'MANAGE_ROLES']));
        roleN = `USER-${roleO.id}`;
        role = guild.roles.cache.find((x) => x.name == roleN);
        IDerr = getTS('COLOR_TARGET_ALREADY_NO_ROLE');
      }

      if (!role) return message.channel.send(`${IDerr}`);

      roleC = tc(role.hexColor).toHex();

      function reRC() {
        role = guild.roles.cache.find((x) => x.name == roleN);
        role.delete();
        console.log('Deletando cor.');

        client.setTimeout(() => {
          if (guild.roles.cache.find((x) => x.name == roleN)) {
            reRC();
          }
        }, 1500);
      }

      reRC();
      if (roleO.id == message.author.id) {
        eTiI = getTS('COLOR_DELETED_ROLE');
      } else {
        eTiI = getTS('COLOR_TARGET_DELETED_ROLE', { USER: uIDF.username });
      }
      utils.diEmb(
        instance,
        client,
        1,
        message,
        message.author,
        0,
        roleC,
        eTiI,
        0,
        getTS('GENERIC_DEPRECATED', { COMMAND: '/color remove' })
      );
    }

    if (args[0] == 'change') {
      var aN = 1;

      if (guild.members.cache.get(uID)) {
        aN = 2;
        if (!message.member.hasPermission('MANAGE_ROLES'))
          return errors.noPerms(message, getTS(['PERMS', 'MANAGE_ROLES']));
        roleN = `USER-${roleO.id}`;
        role = guild.roles.cache.find((x) => x.name == roleN);

        if (args[2]) {
          roleC = tc(args.slice(2).join(' ')).toHex();
        }
      }

      if (roleC == '000000') {
        roleC = '000001';
      }

      if (tc(args.slice(aN).join(' ')).isValid() || !args[aN]) {
        var embReacts = ['⛔', '🔁', '✅', '⚪', '⚫', '🎨', '📝'];

        message.channel
          .send(
            utils.diEmb(
              instance,
              client,
              0,
              message,
              message.author,
              0,
              roleC,
              eTiI,
              0,
              getTS('GENERIC_DEPRECATED', { COMMAND: '/color change' }) +
                '\n' +
                cMsg
            )
          )
          .then((msg) => {
            embReacts.forEach((r) => msg.react(r));

            const filter = (reaction, user) => {
              return (
                embReacts.includes(reaction.emoji.name) &&
                (user.id == message.author.id || user.id == roleO.id)
              );
            };

            function f1() {
              msg
                .awaitReactions(filter, {
                  max: 1,
                  time: 60000,
                  errors: ['time'],
                })
                .then((collected) => {
                  const reaction = collected.first();

                  var rU = reaction.users.cache.get(roleO.id);
                  if (!rU) {
                    rU = reaction.users.cache.get(message.author.id);
                  }
                  var fRU = guild.members.cache.get(rU.id);

                  if (reaction.emoji.name == '⛔') {
                    msg.reactions.removeAll();
                    utils.diEmb(
                      instance,
                      client,
                      msg,
                      message,
                      fRU.user,
                      0,
                      roleC,
                      getTS('COLOR_CANCELED'),
                      1,
                      0
                    );
                  } else if (reaction.emoji.name == '🔁') {
                    roleC = tc.random().toHex().replace('000000', '000001');

                    reaction.users.remove(rU.id);
                    utils.diEmb(
                      instance,
                      client,
                      msg,
                      message,
                      fRU.user,
                      0,
                      roleC,
                      getTS('COLOR_LIKE'),
                      1,
                      getTS('GENERIC_DEPRECATED', {
                        COMMAND: '/color change',
                      }) +
                        '\n' +
                        cMsg
                    );

                    f1();
                  } else if (reaction.emoji.name == '✅') {
                    function saveCol() {
                      var pos = guild.me.roles.highest.position;

                      if (!role) {
                        function reRC() {
                          guild.roles.create({
                            data: {
                              name: roleN,
                              color: roleC,
                              position: pos,
                            },
                          });

                          client.setTimeout(() => {
                            var role = guild.roles.cache.find(
                              (x) => x.name == roleN
                            );
                            console.log('Procurando cor.');
                            if (!role) {
                              reRC();
                            } else {
                              function reRA() {
                                roleO.roles.add(role.id);
                                console.log('Adicionando cor.');

                                client.setTimeout(() => {
                                  if (
                                    !message.member.roles.cache.some(
                                      (r) => r.id == role.id
                                    )
                                  ) {
                                    reRA();
                                  }
                                }, 1500);
                              }
                              reRA();
                            }
                          }, 1500);
                        }

                        reRC();
                        if (roleO.id == message.author.id) {
                          eTiI = getTS('COLOR_CREATED_ASSIGNED_ROLE');
                        } else {
                          eTiI = getTS('COLOR_TARGET_CREATED_ASSIGNED_ROLE', {
                            USER: uIDF.username,
                          });
                        }

                        utils.diEmb(
                          instance,
                          client,
                          msg,
                          message,
                          fRU.user,
                          0,
                          roleC,
                          eTiI,
                          1,
                          getTS('GENERIC_DEPRECATED', {
                            COMMAND: '/color change',
                          })
                        );
                      } else {
                        pos = pos - 1;

                        function reSR() {
                          role.setColor(roleC);
                          console.log('Setando cor.');

                          client.setTimeout(() => {
                            if (role.hexColor != '#' + roleC) {
                              reSR();
                            } else {
                              function reSP() {
                                role.setPosition(pos);
                                console.log('Posicionando cor.');

                                client.setTimeout(() => {
                                  if (role.position != pos) {
                                    reSP();
                                  }
                                }, 1500);
                              }
                              reSP();
                            }
                          }, 1500);
                        }

                        reSR();
                        if (roleO.roles.cache.some((r) => r.id == role.id)) {
                          if (roleO.id == message.author.id) {
                            eTiI = getTS('COLOR_CHANGED_ROLE');
                          } else {
                            eTiI = getTS('COLOR_TARGET_CHANGED_ROLE', {
                              USER: uIDF.username,
                            });
                          }
                        } else {
                          roleO.roles.add(role.id);
                          if (roleO.id == message.author.id) {
                            eTiI = getTS('COLOR_CHANGED_ASSIGNED_ROLE');
                          } else {
                            eTiI = getTS('COLOR_TARGET_CHANGED_ASSIGNED_ROLE', {
                              USER: uIDF.username,
                            });
                          }
                        }

                        utils.diEmb(
                          instance,
                          client,
                          msg,
                          message,
                          fRU.user,
                          0,
                          roleC,
                          eTiI,
                          1,
                          getTS('GENERIC_DEPRECATED', {
                            COMMAND: '/color change',
                          })
                        );
                      }
                      msg.reactions.removeAll();
                    }
                    saveCol();
                  } else if (reaction.emoji.name == '⚪') {
                    roleC = tc(roleC)
                      .brighten(10)
                      .toHex()
                      .replace('000000', '000001');

                    utils.diEmb(
                      instance,
                      client,
                      msg,
                      message,
                      fRU.user,
                      0,
                      roleC,
                      getTS('COLOR_LIKE'),
                      1,
                      getTS('GENERIC_DEPRECATED', {
                        COMMAND: '/color change',
                      }) +
                        '\n' +
                        cMsg
                    );
                    reaction.users.remove(message.author.id);
                    reaction.users.remove(roleO.id);

                    f1();
                  } else if (reaction.emoji.name == '⚫') {
                    roleC = tc(roleC)
                      .darken(10)
                      .toHex()
                      .replace('000000', '000001');

                    utils.diEmb(
                      instance,
                      client,
                      msg,
                      message,
                      fRU.user,
                      0,
                      roleC,
                      getTS('COLOR_LIKE'),
                      1,
                      getTS('GENERIC_DEPRECATED', {
                        COMMAND: '/color change',
                      }) +
                        '\n' +
                        cMsg
                    );
                    reaction.users.remove(message.author.id);
                    reaction.users.remove(roleO.id);

                    f1();
                  } else if (reaction.emoji.name == '🎨') {
                    utils.diEmb(
                      instance,
                      client,
                      msg,
                      message,
                      fRU.user,
                      0,
                      roleC,
                      getTS('COLOR_MIX'),
                      1,
                      getTS('GENERIC_DEPRECATED', {
                        COMMAND: '/color change',
                      }) +
                        '\n' +
                        cMsg,
                      `${roleC}+＋`
                    );

                    msg.reactions.removeAll();

                    var filter = (m) => m.author.id == rU.id;

                    function fm1() {
                      message.channel
                        .awaitMessages(filter, {
                          max: 1,
                          time: 60000,
                          errors: ['time'],
                        })
                        .then((message) => {
                          message = message.first();
                          if (tc(message.content).isValid()) {
                            roleC = tc
                              .mix(roleC, message.content, (amount = 50))
                              .toHex()
                              .replace('000000', '000001');

                            utils.diEmb(
                              instance,
                              client,
                              msg,
                              message,
                              fRU.user,
                              roleC,
                              getTS('COLOR_MIXED'),
                              1,
                              getTS('GENERIC_DEPRECATED', {
                                COMMAND: '/color change',
                              }) +
                                '\n' +
                                cMsg
                            );

                            embReacts.forEach((r) => msg.react(r));
                            message.delete();

                            f1();
                          } else {
                            utils.diEmb(
                              instance,
                              client,
                              msg,
                              message,
                              fRU.user,
                              roleC,
                              getTS('COLOR_MIX_INVALID'),
                              1,
                              getTS('GENERIC_DEPRECATED', {
                                COMMAND: '/color change',
                              }) +
                                '\n' +
                                cMsg +
                                '\n' +
                                invMsg,
                              `${roleC}+＋`
                            );

                            msg.reactions.removeAll();
                            message.delete();

                            fm1();
                          }
                        })
                        .catch(() => {
                          utils.diEmb(
                            instance,
                            client,
                            msg,
                            message,
                            message.author,
                            roleC,
                            getTS('GENERIC_TIME_OUT'),
                            0,
                            0
                          );
                        });
                    }
                    fm1();
                  } else if (reaction.emoji.name == '📝') {
                    utils.diEmb(
                      instance,
                      client,
                      msg,
                      message,
                      fRU.user,
                      0,
                      roleC,
                      getTS('COLOR_EDIT'),
                      1,
                      getTS('GENERIC_DEPRECATED', {
                        COMMAND: '/color change',
                      }) +
                        '\n' +
                        cMsg,
                      `${roleC}+->`
                    );

                    msg.reactions.removeAll();

                    var filter = (m) => m.author.id == rU.id;

                    function fe1() {
                      message.channel
                        .awaitMessages(filter, {
                          max: 1,
                          time: 60000,
                          errors: ['time'],
                        })
                        .then((message) => {
                          message = message.first();

                          if (tc(message.content).isValid()) {
                            roleC = tc(message.content)
                              .toHex()
                              .replace('000000', '000001');

                            utils.diEmb(
                              instance,
                              client,
                              msg,
                              message,
                              fRU.user,
                              roleC,
                              getTS('COLOR_EDITED'),
                              1,
                              getTS('GENERIC_DEPRECATED', {
                                COMMAND: '/color change',
                              }) +
                                '\n' +
                                cMsg
                            );

                            embReacts.forEach((r) => msg.react(r));
                            message.delete();

                            f1();
                          } else {
                            utils.diEmb(
                              instance,
                              client,
                              msg,
                              message,
                              fRU.user,
                              roleC,
                              getTS('COLOR_EDIT_INVALID'),
                              1,
                              getTS('GENERIC_DEPRECATED', {
                                COMMAND: '/color change',
                              }) +
                                '\n' +
                                `${cMsg}\n${invMsg}`,
                              `${roleC}+->`
                            );

                            msg.reactions.removeAll();
                            message.delete();

                            fe1();
                          }
                        })
                        .catch(() => {
                          utils.diEmb(
                            instance,
                            client,
                            msg,
                            message,
                            message.author,
                            roleC,
                            getTS('GENERIC_TIME_OUT'),
                            0,
                            0
                          );
                        });
                    }
                    fe1();
                  } /* else if (reaction.emoji.name == '👁️') {
                    embReacts = ['⛔', '✅'];
                    msg
                      .edit(
                        utils.diEmb(
                          instance,
                          client,
                          0,
                          message,
                          fRU.user,
                          roleC,
                          'Você está experimentando a cor.',
                          1,
                          getTS('GENERIC_DEPRECATED', {COMMAND: '/color change'}) + '\n' + cMsg,
                          `${roleC}`
                        )
                      )
                      .then((message) => {
                        embReacts.forEach((r) => message.react(r));

                        const filter = (reaction, user) => {
                          return (
                            embReacts.includes(reaction.emoji.name) &&
                            (user.id == rU.id || user.id == roleO.id)
                          );
                        };

                        function f1() {
                          message
                            .awaitReactions(filter, {
                              max: 1,
                              time: 60000,
                              errors: ['time'],
                            })
                            .then((collected) => {
                              const reaction = collected.first();

                              var rU = reaction.users.cache.get(roleO.id);
                              if (!rU) {
                                rU = reaction.users.cache.get(rU.id);
                              }
                              var fRU = guild.members.cache.get(rU.id);

                              if (reaction.emoji.name == '⛔') {
                              } else {
                                saveCol();
                              }
                            });
                        }
                        f1();
                      });

                    msg.reactions.removeAll();
                  }*/
                })
                .catch((err) => {
                  console.log(err);
                  utils.diEmb(
                    instance,
                    client,
                    msg,
                    message,
                    message.author,
                    roleC,
                    getTS('GENERIC_TIME_OUT'),
                    0,
                    0
                  );
                  msg.reactions.removeAll();
                });
            }
            f1();
          });
      } else {
        utils.diEmb(instance, client, 1, message, message.author);
      }
    }
  },
};

module.exports.config = {
  loadDBFirst: true,
};
