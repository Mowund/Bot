const botconfig = require('../botconfig.json');
const errors = require('../utils/errors.js');
const utils = require('../utils/utils.js');
const Discord = require('discord.js');
const tinycolor = require('tinycolor2');
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
      if (!tinycolor(args[1]).isValid()) {
        var uID = args[1].replace(/[\\<>@#&!]/g, '');
        roleO = message.guild.members.cache.get(uID);
      }
    }

    var roleC = tinycolor(args.slice(1).join(' ')).toHex();

    if (message.guild.members.cache.get(uID)) {
      var uIDF = await client.users.fetch(roleO.id);
      var prC = await getColorFromURL(uIDF.avatarURL({ format: 'png' }));
      var [r, g, b] = prC;
      roleC = tinycolor(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex();
      eTiI = `Cor predominante no avatar de ${uIDF.username}`;
      cMen = `${uIDF} também pode interagir com o sistema.`;

      if (tinycolor(args[2]).isValid()) {
        eTiI = 'Cor especificada';
      }
    } else if (!args[1]) {
      var prC = await getColorFromURL(
        message.author.avatarURL({ format: 'png' })
      );
      var [r, g, b] = prC;
      roleC = tinycolor(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex();
      eTiI = 'Cor predominante no seu avatar';
    }

    if (roleC === '000000') {
      roleC = '000001';
    }

    var roleCE = roleC;
    if (roleCE === 'ffffff') {
      roleCE = 'fffffe';
    }

    var roleL = '000000';
    if (tinycolor(roleC).isDark()) {
      roleL = 'ffffff';
    }

    var roleN = `USER-${message.author.id}`;
    var role = message.guild.roles.cache.find((x) => x.name == roleN);

    if (args[0] === 'convert') {
      var tcvColor = tinycolor(args[1]).toHex();
      var IDerr = 'Você não tem um cargo de cor.';

      if (!tinycolor(args[1]).isValid()) {
        roleN = `USER-${roleO.id}`;
        role = message.guild.roles.cache.find((x) => x.name == roleN);
        IDerr = `O usuário mencionado não tem um cargo de cor.`;
        tcvColor = tinycolor(role.hexColor).toHex();
        roleCE = role.hexColor.replace('#', '');

        if (!role) return message.channel.send(`${IDerr}`);
      }

      var cvRgb = tinycolor(tcvColor).toRgbString();
      var RgbLk = encodeURI(cvRgb);

      roleCE = tcvColor;
      if (roleCE === 'ffffff') {
        roleCE = 'fffffe';
      }
      var cColorL = '000000';
      if (tinycolor(tcvColor).isDark()) {
        cColorL = 'ffffff';
      }

      utils.diEmb(
        1,
        message,
        message.author,
        roleCE,
        'Convertido para RGB',
        `${tcvColor}`,
        `${cColorL}`,
        `${RgbLk}`,
        0,
        `${cvRgb}`
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

      roleC = role.hexColor.replace('#', '');

      roleCE = roleC;
      if (roleCE === 'ffffff') {
        roleCE = 'fffffe';
      }

      roleL = '000000';
      if (tinycolor(roleC).isDark()) {
        roleL = 'ffffff';
      }

      if (roleO.id === message.author.id) {
        eTiI = 'Cor atual';
      } else {
        eTiI = `Cor atual de ${uIDF.username}`;
      }
      utils.diEmb(
        1,
        message,
        message.author,
        roleCE,
        eTiI,
        `${roleC}`,
        `${roleL}`,
        `${roleC}`
      );
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

      roleC = role.hexColor.replace('#', '');

      roleCE = roleC;
      if (roleCE === 'ffffff') {
        roleCE = 'fffffe';
      }

      roleL = '000000';
      if (tinycolor(roleC).isDark()) {
        roleL = 'ffffff';
      }

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
      utils.diEmb(
        1,
        message,
        message.author,
        roleCE,
        eTiI,
        `${roleC}`,
        `${roleL}`,
        `${roleC}`
      );
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
          roleC = tinycolor(args.slice(2).join(' ')).toHex();
        }
        if (roleC === '000000') {
          roleC = '000001';

          var roleCE = roleC;
          if (roleCE === 'ffffff') {
            roleCE = 'fffffe';
          }
        }

        var roleL = '000000';
        if (tinycolor(roleC).isDark()) {
          roleL = 'ffffff';
        }
      }

      if (tinycolor(args.slice(aN).join(' ')).isValid() || !args[aN]) {
        const reactions = ['⛔', '🔁', '✅', '⚪', '⚫', '🎨', '📝'];

        message.channel
          .send(
            utils.diEmb(
              0,
              message,
              message.author,
              roleCE,
              eTiI,
              `${roleC}`,
              `${roleL}`,
              `${roleC}`,
              0,
              cMen
            )
          )
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
                    if (roleC === '000000') {
                      roleC = '000001';
                    }

                    var roleCE = roleC;
                    if (roleCE === 'ffffff') {
                      roleCE = 'fffffe';
                    }

                    var roleL = '000000';
                    if (tinycolor(roleC).isDark()) {
                      roleL = 'ffffff';
                    }

                    msg.reactions.removeAll();
                    utils.diEmb(
                      msg,
                      message,
                      fRU.user,
                      roleCE,
                      'Cancelado',
                      `${roleC}`,
                      `${roleL}`,
                      'Cancelado',
                      1
                    );
                  } else if (reaction.emoji.name === '🔁') {
                    roleC = tinycolor.random().toHex();

                    if (roleC === '000000') {
                      roleC = '000001';
                    }

                    var roleCE = roleC;
                    if (roleCE === 'ffffff') {
                      roleCE = 'fffffe';
                    }

                    var roleL = '000000';
                    if (tinycolor(roleC).isDark()) {
                      roleL = 'ffffff';
                    }

                    reaction.users.remove(rU.id);
                    utils.diEmb(
                      msg,
                      message,
                      fRU.user,
                      roleCE,
                      'Você gostaria dessa cor?',
                      `${roleC}`,
                      `${roleL}`,
                      `${roleC}`,
                      1,
                      cMen
                    );

                    f1();
                  } else if (reaction.emoji.name === '✅') {
                    if (roleC === '000000') {
                      roleC = '000001';
                    }

                    var roleCE = roleC;
                    if (roleCE === 'ffffff') {
                      roleCE = 'fffffe';
                    }

                    var roleL = '000000';
                    if (tinycolor(roleC).isDark()) {
                      roleL = 'ffffff';
                    }

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

                      utils.diEmb(
                        msg,
                        message,
                        fRU.user,
                        roleCE,
                        eTiI,
                        `${roleC}`,
                        `${roleL}`,
                        `${roleC}`,
                        1
                      );
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

                      utils.diEmb(
                        msg,
                        message,
                        fRU.user,
                        roleCE,
                        eTiI,
                        `${roleC}`,
                        `${roleL}`,
                        `${roleC}`,
                        1
                      );
                    }
                    msg.reactions.removeAll();
                  } else if (reaction.emoji.name === '⚪') {
                    roleC = tinycolor(roleC).brighten(10).toHex();

                    if (roleC === '000000') {
                      roleC = '000001';
                    }

                    var roleCE = roleC;
                    if (roleCE === 'ffffff') {
                      roleCE = 'fffffe';
                    }

                    var roleL = '000000';
                    if (tinycolor(roleC).isDark()) {
                      roleL = 'ffffff';
                    }

                    utils.diEmb(
                      msg,
                      message,
                      fRU.user,
                      roleCE,
                      'Você gostaria dessa cor?',
                      `${roleC}`,
                      `${roleL}`,
                      `${roleC}`,
                      1,
                      cMen
                    );
                    reaction.users.remove(message.author.id);
                    reaction.users.remove(roleO.id);

                    f1();
                  } else if (reaction.emoji.name === '⚫') {
                    roleC = tinycolor(roleC).darken(10).toHex();

                    if (roleC === '000000') {
                      roleC = '000001';
                    }

                    var roleCE = roleC;
                    if (roleCE === 'ffffff') {
                      roleCE = 'fffffe';
                    }

                    var roleL = '000000';
                    if (tinycolor(roleC).isDark()) {
                      roleL = 'ffffff';
                    }

                    utils.diEmb(
                      msg,
                      message,
                      fRU.user,
                      roleCE,
                      'Você gostaria dessa cor?',
                      `${roleC}`,
                      `${roleL}`,
                      `${roleC}`,
                      1,
                      cMen
                    );
                    reaction.users.remove(message.author.id);
                    reaction.users.remove(roleO.id);

                    f1();
                  } else if (reaction.emoji.name === '🎨') {
                    if (roleC === '000000') {
                      roleC = '000001';
                    }

                    let roleCE = roleC;
                    if (roleCE === 'ffffff') {
                      roleCE = 'fffffe';
                    }

                    let roleL = '000000';
                    if (tinycolor(roleC).isDark()) {
                      roleL = 'ffffff';
                    }

                    utils.diEmb(
                      msg,
                      message,
                      fRU.user,
                      roleCE,
                      'Digite uma cor para misturar',
                      `${roleC}`,
                      `${roleL}`,
                      `${roleC}+＋`,
                      1,
                      cMen
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
                          if (tinycolor(message.content).isValid()) {
                            roleC = tinycolor
                              .mix(roleC, message.content, (amount = 50))
                              .toHex();

                            if (roleC === '000000') {
                              roleC = '000001';
                            }

                            roleCE = roleC;
                            if (roleCE === 'ffffff') {
                              roleCE = 'fffffe';
                            }

                            roleL = '000000';
                            if (tinycolor(roleC).isDark()) {
                              roleL = 'ffffff';
                            }

                            utils.diEmb(
                              msg,
                              message,
                              fRU.user,
                              roleCE,
                              'Cor misturada',
                              `${roleC}`,
                              `${roleL}`,
                              `${roleC}`,
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
                              roleCE,
                              'Cor inválida, digite uma cor válida para misturar',
                              `${roleC}`,
                              `${roleL}`,
                              `${roleC}+＋`,
                              1,
                              cMen
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
                            roleCE,
                            'Tempo esgotado',
                            roleC,
                            roleL,
                            'Tempo%20esgotado'
                          );
                        });
                    }
                    fm1();
                  } else {
                    if (roleC === '000000') {
                      roleC = '000001';
                    }

                    let roleCE = roleC;
                    if (roleCE === 'ffffff') {
                      roleCE = 'fffffe';
                    }

                    let roleL = '000000';
                    if (tinycolor(roleC).isDark()) {
                      roleL = 'ffffff';
                    }

                    utils.diEmb(
                      msg,
                      message,
                      fRU.user,
                      roleCE,
                      'Digite uma nova cor',
                      `${roleC}`,
                      `${roleL}`,
                      `${roleC}+->`,
                      1,
                      cMen
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

                          if (tinycolor(message.content).isValid()) {
                            roleC = tinycolor(message.content).toHex();

                            if (roleC === '000000') {
                              roleC = '000001';
                            }

                            roleCE = roleC;
                            if (roleCE === 'ffffff') {
                              roleCE = 'fffffe';
                            }

                            roleL = '000000';
                            if (tinycolor(roleC).isDark()) {
                              roleL = 'ffffff';
                            }

                            utils.diEmb(
                              msg,
                              message,
                              fRU.user,
                              roleCE,
                              'Cor editada',
                              `${roleC}`,
                              `${roleL}`,
                              `${roleC}`,
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
                              roleCE,
                              'Cor inválida, digite uma nova cor válida',
                              `${roleC}`,
                              `${roleL}`,
                              `${roleC}+->`,
                              1,
                              cMen
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
                            roleCE,
                            'Tempo esgotado',
                            roleC,
                            roleL,
                            'Tempo%20esgotado'
                          );
                        });
                    }
                    fe1();
                  }
                })
                .catch((err) => {
                  console.error(err);
                  var roleCE = roleC;
                  if (roleCE === 'ffffff') {
                    roleCE = 'fffffe';
                  }

                  var roleL = '000000';
                  if (tinycolor(roleC).isDark()) {
                    roleL = 'ffffff';
                  }

                  utils.diEmb(
                    msg,
                    message,
                    message.author,
                    roleCE,
                    'Tempo esgotado',
                    roleC,
                    roleL,
                    'Tempo%20esgotado'
                  );
                  msg.reactions.removeAll();
                });
            }
            f1();
          });
      } else {
        utils.diEmb(
          1,
          message,
          message.author,
          '000000',
          'Cor inválida',
          '000000',
          'ffffff',
          'Inválido'
        );
      }
    }
  },
};

module.exports.config = {
  loadDBFirst: true, // Wait for the database connection to be present
};
