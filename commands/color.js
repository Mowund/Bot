const botconfig = require('../botconfig.json');
const errors = require('../utils/errors.js');
const utils = require('../utils/utils.js');
const Discord = require('discord.js');
const tc = require('tinycolor2');
const { getColorFromURL } = require('color-thief-node');
const chalk = require('chalk');
const colorSchema = require('../schemas/color-schema');

module.exports = {
  name: 'color',
  category: 'Utils',
  description: 'Altera a sua cor.',
  expectedArgs: 'change (cor)',
  minArgs: 1,
  callback: async ({ message, args, client }) => {
    cS = await colorSchema.findOne();
    if (!cS.cI.includes(message.channel.id)) return;

    var roleO = message.guild.members.cache.get(message.author.id);
    var eTiI = 'Você gostaria dessa cor?';
    var cMen = [];

    if (args[1]) {
      eTiI = 'Cor especificada';
      if (!tc(args[1]).isValid()) {
        var uID = args[1].replace(/[\\<>@#&!]/g, '');
        roleO = message.guild.members.cache.get(uID);
      }
    }

    var roleC = tc(args.slice(1).join(' ')).toHex();

    if (message.guild.members.cache.get(uID)) {
      var uIDF = await client.users.fetch(roleO.id);
      var prC = await getColorFromURL(uIDF.avatarURL({ format: 'png' }));
      var [r, g, b] = prC;
      roleC = tc(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex();
      eTiI = `Cor predominante no avatar de ${uIDF.username}`;
      cMen = `${uIDF} também pode interagir com o sistema.`;

      if (tc(args[2]).isValid()) {
        eTiI = 'Cor especificada';
      }
    } else if (!args[1]) {
      var prC = await getColorFromURL(
        message.author.avatarURL({ format: 'png' })
      );
      var [r, g, b] = prC;
      roleC = tc(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex();
      eTiI = 'Cor predominante no seu avatar';
    }

    var roleN = `USER-${message.author.id}`;
    var role = message.guild.roles.cache.find((x) => x.name == roleN);

    if (args[0] === 'convert') {
      var roleC = tc(args[1]).toHex();
      var IDerr = 'Você não tem um cargo de cor.';

      if (!tc(args[1]).isValid()) {
        roleN = `USER-${roleO.id}`;
        role = message.guild.roles.cache.find((x) => x.name == roleN);
        IDerr = `O usuário mencionado não tem um cargo de cor.`;
        roleC = tc(role.hexColor).toHex();

        if (!role) return message.channel.send(`${IDerr}`);
      }

      var cvRgb = tc(roleC).toRgbString();
      var RgbLk = encodeURI(cvRgb);

      utils.diEmb(
        1,
        message,
        message.author,
        roleC,
        'Convertido para RGB',
        0,
        cvRgb,
        RgbLk,
        roleC
      );
    }

    if (args[0] === 'current') {
      var IDerr = 'Você não tem um cargo de cor.';

      if (args[1]) {
        roleN = `USER-${roleO.id}`;
        role = message.guild.roles.cache.find((x) => x.name == roleN);
        IDerr = `O usuário mencionado não tem um cargo de cor.`;
      }

      if (!role) return message.channel.send(`${IDerr}`);

      roleC = tc(role.hexColor).toHex();

      if (roleO.id === message.author.id) {
        eTiI = 'Cor atual';
      } else {
        eTiI = `Cor atual de ${uIDF.username}`;
      }
      utils.diEmb(1, message, message.author, roleC, eTiI);
    }

    if (args[0] === 'remove') {
      var IDerr = 'Você já não tem um cargo de cor.';

      if (args[1]) {
        if (!message.member.hasPermission('MANAGE_ROLES'))
          return errors.noPerms(message, 'Gerenciar Cargos');
        roleN = `USER-${roleO.id}`;
        role = message.guild.roles.cache.find((x) => x.name == roleN);
        IDerr = 'O usuário mencionado já não tem um cargo de cor.';
      }

      if (!role) return message.channel.send(`${IDerr}`);

      roleC = tc(role.hexColor).toHex();

      function reRC() {
        role = message.guild.roles.cache.find((x) => x.name == roleN);
        role.delete();

        setTimeout(function () {
          if (message.guild.roles.cache.find((x) => x.name == roleN)) {
            reRC();
          }
        }, 1500);
      }

      reRC();
      if (roleO.id === message.author.id) {
        eTiI = 'Cor deletada';
      } else {
        eTiI = `Cor de ${uIDF.username} deletada`;
      }
      utils.diEmb(1, message, message.author, roleC, eTiI);
    }

    if (args[0] === 'change') {
      var aN = 1;

      if (message.guild.members.cache.get(uID)) {
        aN = 2;
        if (!message.member.hasPermission('MANAGE_ROLES'))
          return errors.noPerms(message, 'Gerenciar Cargos');
        roleN = `USER-${roleO.id}`;
        role = message.guild.roles.cache.find((x) => x.name == roleN);

        if (args[2]) {
          roleC = tc(args.slice(2).join(' ')).toHex();
        }
      }

      if (roleC === '000000') {
        roleC = '000001';
      }

      if (tc(args.slice(aN).join(' ')).isValid() || !args[aN]) {
        const reactions = ['⛔', '🔁', '✅', '⚪', '⚫', '🎨', '📝'];

        message.channel
          .send(utils.diEmb(0, message, message.author, roleC, eTiI, 0, cMen))
          .then((msg) => {
            reactions.forEach((r) => msg.react(r));

            const filter = (reaction, user) => {
              return (
                reactions.includes(reaction.emoji.name) &&
                (user.id === message.author.id || user.id === roleO.id)
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
                  var fRU = message.guild.members.cache.get(rU.id);

                  if (reaction.emoji.name === '⛔') {
                    msg.reactions.removeAll();
                    utils.diEmb(
                      msg,
                      message,
                      fRU.user,
                      roleC,
                      'Cancelado',
                      1,
                      0,
                      'Cancelado'
                    );
                  } else if (reaction.emoji.name === '🔁') {
                    roleC = tc.random().toHex().replace('000000', '000001');

                    reaction.users.remove(rU.id);
                    utils.diEmb(
                      msg,
                      message,
                      fRU.user,
                      roleC,
                      'Você gostaria dessa cor?',
                      1,
                      cMen
                    );

                    f1();
                  } else if (reaction.emoji.name === '✅') {
                    var pos = message.guild.me.roles.highest.position;

                    if (!role) {
                      function reRC() {
                        message.guild.roles.create({
                          data: {
                            name: roleN,
                            color: roleC,
                            position: pos,
                          },
                        });

                        setTimeout(function () {
                          var role = message.guild.roles.cache.find(
                            (x) => x.name == roleN
                          );
                          if (!role) {
                            reRC();
                          } else {
                            function reRA() {
                              roleO.roles.add(role.id);

                              setTimeout(function () {
                                if (
                                  !message.member.roles.cache.some(
                                    (r) => r.id === role.id
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
                      if (roleO.id === message.author.id) {
                        eTiI = 'Cor criada e atribuída';
                      } else {
                        eTiI = `Cor criada e atribuída à ${uIDF.username}`;
                      }

                      utils.diEmb(msg, message, fRU.user, roleC, eTiI, 1);
                    } else {
                      pos = pos - 1;

                      function reSR() {
                        role.setColor(roleC);

                        setTimeout(function () {
                          if (role.hexColor !== '#' + roleC) {
                            reSR();
                          } else {
                            function reSP() {
                              role.setPosition(pos);

                              setTimeout(function () {
                                if (role.position !== pos) {
                                  reSP();
                                }
                              }, 1500);
                            }
                            reSP();
                          }
                        }, 1500);
                      }

                      reSR();
                      if (roleO.roles.cache.some((r) => r.id === role.id)) {
                        if (roleO.id === message.author.id) {
                          eTiI = 'Cor alterada';
                        } else {
                          eTiI = `Cor de ${uIDF.username} alterada`;
                        }
                      } else {
                        roleO.roles.add(role.id);
                        if (roleO.id === message.author.id) {
                          eTiI = 'Cor alterada e atribuída';
                        } else {
                          eTiI = `Cor de ${uIDF.username} alterada e atribuída`;
                        }
                      }

                      utils.diEmb(msg, message, fRU.user, roleC, eTiI, 1);
                    }
                    msg.reactions.removeAll();
                  } else if (reaction.emoji.name === '⚪') {
                    roleC = tc(roleC)
                      .brighten(10)
                      .toHex()
                      .replace('000000', '000001');

                    utils.diEmb(
                      msg,
                      message,
                      fRU.user,
                      roleC,
                      'Você gostaria dessa cor?',
                      1,
                      cMen
                    );
                    reaction.users.remove(message.author.id);
                    reaction.users.remove(roleO.id);

                    f1();
                  } else if (reaction.emoji.name === '⚫') {
                    roleC = tc(roleC)
                      .darken(10)
                      .toHex()
                      .replace('000000', '000001');

                    utils.diEmb(
                      msg,
                      message,
                      fRU.user,
                      roleC,
                      'Você gostaria dessa cor?',
                      1,
                      cMen
                    );
                    reaction.users.remove(message.author.id);
                    reaction.users.remove(roleO.id);

                    f1();
                  } else if (reaction.emoji.name === '🎨') {
                    utils.diEmb(
                      msg,
                      message,
                      fRU.user,
                      roleC,
                      'Digite uma cor para misturar',
                      1,
                      cMen,
                      `${roleC}+＋`
                    );

                    msg.reactions.removeAll();

                    var filter = (m) => m.author.id === rU.id;

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
                              msg,
                              message,
                              fRU.user,
                              roleC,
                              'Cor misturada',
                              1,
                              cMen
                            );

                            reactions.forEach((r) => msg.react(r));
                            message.delete();

                            f1();
                          } else {
                            utils.diEmb(
                              msg,
                              message,
                              fRU.user,
                              roleC,
                              'Cor inválida, digite uma cor válida para misturar',
                              1,
                              cMen,
                              `${roleC}+＋`
                            );

                            msg.reactions.removeAll();
                            message.delete();

                            fm1();
                          }
                        })
                        .catch(() => {
                          utils.diEmb(
                            msg,
                            message,
                            message.author,
                            roleC,
                            'Tempo esgotado',
                            0,
                            0,
                            'Tempo%20esgotado'
                          );
                        });
                    }
                    fm1();
                  } else {
                    utils.diEmb(
                      msg,
                      message,
                      fRU.user,
                      roleC,
                      'Digite uma nova cor',
                      1,
                      cMen,
                      `${roleC}+->`
                    );

                    msg.reactions.removeAll();

                    var filter = (m) => m.author.id === rU.id;

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
                              msg,
                              message,
                              fRU.user,
                              roleC,
                              'Cor editada',
                              1,
                              cMen
                            );

                            reactions.forEach((r) => msg.react(r));
                            message.delete();

                            f1();
                          } else {
                            utils.diEmb(
                              msg,
                              message,
                              fRU.user,
                              roleC,
                              'Cor inválida, digite uma nova cor válida',
                              1,
                              cMen,
                              `${roleC}+->`
                            );

                            msg.reactions.removeAll();
                            message.delete();

                            fe1();
                          }
                        })
                        .catch(() => {
                          utils.diEmb(
                            msg,
                            message,
                            message.author,
                            roleC,
                            'Tempo esgotado',
                            0,
                            0,
                            'Tempo%20esgotado'
                          );
                        });
                    }
                    fe1();
                  }
                })
                .catch((err) => {
                  console.error(err);

                  utils.diEmb(
                    msg,
                    message,
                    message.author,
                    roleC,
                    'Tempo esgotado',
                    0,
                    0,
                    'Tempo%20esgotado'
                  );
                  msg.reactions.removeAll();
                });
            }
            f1();
          });
      } else {
        utils.diEmb(1, message, message.author);
      }
    }
  },
};

module.exports.config = {
  loadDBFirst: true,
};
