const botconfig = require("../botconfig.json");
const errors = require("../utils/errors.js");
const utils = require("../utils/utils.js")
const Discord = require("discord.js");
var tinycolor = require("tinycolor2");
const { getColorFromURL } = require('color-thief-node');
const chalk = require('chalk');
let pr = (botconfig.prefix);

module.exports.run = async (bot, message, args) => {

if (!['467133077475557376', '599375425445036049', '422236981586690048', '697454249067413519', '780208029999431701', '697878736657186936'].includes(message.channel.id)) return;

        if(!args[0])
          return message.channel.send(`Uso correto: \`${pr}color change (cor)\``);

        var eTiI = 'Você gostaria dessa cor?'

        if(args[1]) {
          var uID = args[1].replace(/[\\<>@#&!]/g, '');
          eTiI = 'Cor especificada';
        }

        var roleC = tinycolor(args.slice(1).join(" ")).toHex();

        if(message.guild.members.cache.get(uID)) {

          var uIDF = await bot.users.fetch(uID)
          var prC = await getColorFromURL(uIDF.avatarURL({format:'png'}));
          var [r, g, b] = prC
          roleC = tinycolor(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex(); 
          eTiI = 'Cor predominante no avatar mencionado'

        } else if(!args[1]) {

          var prC = await getColorFromURL(message.author.avatarURL({format:'png'}));
          var [r, g, b] = prC
          roleC = tinycolor(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex();
          eTiI = 'Cor predominante no seu avatar'
        };

        if(roleC === "000000") {
          roleC = "000001"
        }

        var roleCE = roleC
        if(roleCE === "ffffff") {
          roleCE = "fffffe"
        }
      
        var roleL = "000000"
        if(tinycolor(roleC).isDark()) {
          roleL = "ffffff"
        }
      
        var roleN = `USER-${message.author.id}`;
        var role = message.guild.roles.cache.find(x => x.name == roleN);

  if(args[0] === 'convert') {

    var tcvColor = tinycolor(args[1]).toHex();

    if(!tinycolor(args[1]).isValid()) {

  let IDerr = 'Você não tem um cargo de cor.'

    roleN = `USER-${uID}`;
    role = message.guild.roles.cache.find(x => x.name == roleN);
    IDerr = 'O usuário mencionado não tem um cargo de cor.';

  if(!role) return message.channel.send(`${IDerr}`);

  var tcvColor = tinycolor(role.color).toHex();
     };

    var cvRgb = tinycolor(tcvColor).toRgbString();
    var RgbLk = encodeURI(cvRgb);
    var cColorL = "000000"
    if(tinycolor(tcvColor).isDark()) {
      cColorL = "ffffff"
    };

    utils.diEmb(0, message, roleCE, 'Convertido para RGB', `${tcvColor}`, `${cColorL}`, `${RgbLk}`, `${cvRgb}`);
  };

if(args[0] === "current") {

  let IDerr = 'Você não tem um cargo de cor.'

  if(args[1]) {
    roleN = `USER-${uID}`;
    role = message.guild.roles.cache.find(x => x.name == roleN);
    IDerr = 'O usuário mencionado não tem um cargo de cor.';
  }

  if(!role) return message.channel.send(`${IDerr}`);

  roleC = role.hexColor.replace('#', '');

  roleCE = roleC
  if(roleCE === "ffffff") {
    roleCE = "fffffe"
  } 

  roleL = "000000"
  if(tinycolor(roleC).isDark()) {
    roleL = "ffffff"
  };

  utils.diEmb(0, message, roleCE, 'Cor atual', `${roleC}`, `${roleL}`, `${roleC}`);
}

if(args[0] === "remove") {

  let IDerr = 'Você já não tem um cargo de cor.'

  if(args[1]) {
    if (!message.member.hasPermission("MANAGE_ROLES")) return errors.noPerms(message, "Gerenciar Cargos");
    roleN = `USER-${uID}`;
    role = message.guild.roles.cache.find(x => x.name == roleN);
    IDerr = 'O usuário mencionado já não tem um cargo de cor.';
  }

  if(!role) return message.channel.send(`${IDerr}`);

  roleC = role.hexColor.replace('#', '');

  roleCE = roleC
  if(roleCE === "ffffff") {
    roleCE = "fffffe"
  } 

  roleL = "000000"
  if(tinycolor(roleC).isDark()) {
    roleL = "ffffff"
  }

  utils.diEmb(0, message, roleCE, 'Cor deletada', `${roleC}`, `${roleL}`, `${roleC}`);
  role.delete();
}

if(args[0] === "change") {

    var roleO = message.member;
    var aN = 1;
 
    if(message.guild.members.cache.get(uID)) {
      aN = 2;
      if (!message.member.hasPermission("MANAGE_ROLES")) return errors.noPerms(message, "Gerenciar Cargos");
      roleN = `USER-${uID}`;
      role = message.guild.roles.cache.find(x => x.name == roleN);

      if(args[2]) {
        roleC = tinycolor(args.slice(2).join(" ")).toHex();
      }    
      if(roleC === "000000") {
        roleC = "000001"

      var roleCE = roleC
      if(roleCE === "ffffff") {
        roleCE = "fffffe"
      }

      }

      var roleL = "000000"
        if(tinycolor(roleC).isDark()) {
      roleL = "ffffff"
      }

      roleO = message.guild.members.cache.get(uID);
    };

   if(tinycolor(args.slice(aN).join(" ")).isValid() || !args[aN]) {
    
  const reactions = ['⛔', '🔁', '✅', '⚪', '⚫', '🎨', '📝']
  
  let uEmb = new Discord.MessageEmbed()
  .setColor(parseInt(roleCE, 16))
  .setTitle(eTiI)
  .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+${roleC}`);
  message.channel.send(uEmb).then((msg) => {
    reactions.forEach(r => msg.react(r));

const filter = (reaction, user) => {
    return reactions.includes(reaction.emoji.name) && user.id === message.author.id;
};

function f1() {
msg.awaitReactions(filter, {max: 1, time: 60000, errors: ['time']})
    .then(collected => {
        const reaction = collected.first();

        if (reaction.emoji.name === '⛔') {

          if(roleC === "000000") {
            roleC = "000001"
          }
  
          var roleCE = roleC
          if(roleCE === "ffffff") {
            roleCE = "fffffe"
          }

          var roleL = "000000"
          if(tinycolor(roleC).isDark()) {
            roleL = "ffffff"
          }

          utils.diEmb(msg, message, roleCE, 'Cancelado', `${roleC}`, `${roleL}`, 'Cancelado');
          msg.reactions.removeAll();
        
        } else if (reaction.emoji.name === '🔁') {

          roleC = tinycolor.random().toHex();
          
          if(roleC === "000000") {
            roleC = "000001"
          }
  
          var roleCE = roleC
          if(roleCE === "ffffff") {
            roleCE = "fffffe"
          }

          var roleL = "000000"
          if(tinycolor(roleC).isDark()) {
            roleL = "ffffff"
          }

          utils.diEmb(msg, message, roleCE, 'Você gostaria dessa cor?', `${roleC}`, `${roleL}`, `${roleC}`);
          reaction.users.remove(message.author.id);

          f1();

        } else if (reaction.emoji.name === '✅') {
          
          if(roleC === "000000") {
            roleC = "000001"
          }
  
          var roleCE = roleC
          if(roleCE === "ffffff") {
            roleCE = "fffffe"
          }

          var roleL = "000000"
          if(tinycolor(roleC).isDark()) {
            roleL = "ffffff"
          }

          var pos = message.guild.me.roles.highest.position;
  
            if(!role) {
 
                message.guild.roles.create({
                  data: {
                    name: roleN,
                    color: roleC,
                    position: pos
                  }
                });
                    
                setTimeout(function(){
                  var role = message.guild.roles.cache.find(x => x.name == roleN)
                  roleO.roles.add(role.id).catch(err => console.error(err))
                }, 2500);
              
               } else {

                pos = pos - 1
                
                function reSR() {
                  role.setColor(roleC)
                  console.log('color set')

                  setTimeout(function(){
                    if (!role.color === roleC) {
                      reSR()
                      console.log('resetting color')
                    } else {
                      function reSP() {
                        role.setPosition(pos)
                        console.log('position set')

                        setTimeout(function(){
                          if (!role.position === pos) {
                            reSP();
                            console.log('resetting position')
                          }
                        }, 1500)
                      }
                    }
                  }, 1500)
                }

                reSR();
                roleO.roles.add(role.id).catch(err => console.error(err));

            }
            utils.diEmb(msg, message, roleCE, 'Cor alterada', `${roleC}`, `${roleL}`, `${roleC}`);
            msg.reactions.removeAll()

          } else if (reaction.emoji.name === '⚪') {

            roleC = tinycolor(roleC).brighten(10).toHex();

            if(roleC === "000000") {
              roleC = "000001"
            }
    
            var roleCE = roleC
            if(roleCE === "ffffff") {
              roleCE = "fffffe"
            }
  
            var roleL = "000000"
            if(tinycolor(roleC).isDark()) {
              roleL = "ffffff"
            }
  
            utils.diEmb(msg, message, roleCE, 'Você gostaria dessa cor?', `${roleC}`, `${roleL}`, `${roleC}`);
            reaction.users.remove(message.author.id);
  
            f1();
  
          } else if (reaction.emoji.name === '⚫') {

            roleC = tinycolor(roleC).darken(10).toHex();

            if(roleC === "000000") {
              roleC = "000001"
            }
    
            var roleCE = roleC
            if(roleCE === "ffffff") {
              roleCE = "fffffe"
            }
  
            var roleL = "000000"
            if(tinycolor(roleC).isDark()) {
              roleL = "ffffff"
            }
  
            utils.diEmb(msg, message, roleCE, 'Você gostaria dessa cor?', `${roleC}`, `${roleL}`, `${roleC}`);
            reaction.users.remove(message.author.id);
  
            f1();

          } else if (reaction.emoji.name === '🎨') {

            if(roleC === "000000") {
              roleC = "000001"
            }
    
            var roleCE = roleC
            if(roleCE === "ffffff") {
              roleCE = "fffffe"
            }
  
            var roleL = "000000"
            if(tinycolor(roleC).isDark()) {
              roleL = "ffffff"
            }

            utils.diEmb(msg, message, roleCE, 'Digite uma cor para misturar', `${roleC}`, `${roleL}`, `${roleC}+＋`);
            
            msg.reactions.removeAll();

            let filter = m => m.author.id === message.author.id;

            function fm1 () {
            message.channel.awaitMessages(filter, {
                max: 1,
                time: 60000,
                errors: ['time']
              })
              .then(message => {
                message = message.first()
                if (tinycolor(message.content).isValid()) {

                  roleC = tinycolor.mix(roleC, message.content, amount = 50).toHex();

                  if(roleC === "000000") {
                    roleC = "000001"
                  }
          
                  var roleCE = roleC
                  if(roleCE === "ffffff") {
                    roleCE = "fffffe"
                  }
        
                  var roleL = "000000"
                  if(tinycolor(roleC).isDark()) {
                    roleL = "ffffff"
                  }

                  utils.diEmb(msg, message, roleCE, 'Cor misturada', `${roleC}`, `${roleL}`, `${roleC}`);

                  reactions.forEach(r => msg.react(r));
                  message.delete();

                  f1();
                } else {
                  utils.diEmb(msg, message, '000000', 'Cor inválida, digite uma cor válida para misturar', '000000', 'ffffff', `${roleC}+＋`);

                  msg.reactions.removeAll();
                  message.delete();

                  fm1();
                }
              })
              .catch(() => {
                var roleCE = roleC
                if(roleCE === "ffffff") {
                  roleCE = "fffffe"
                }
          
                var roleL = "000000"
                if(tinycolor(roleC).isDark()) {
                  roleL = "ffffff"
                }

                utils.diEmb(msg, message, roleCE, 'Tempo esgotado', roleC, roleL, 'Tempo%20esgotado');
              });
            } fm1();

          } else {

            if(roleC === "000000") {
              roleC = "000001"
            }
    
            var roleCE = roleC
            if(roleCE === "ffffff") {
              roleCE = "fffffe"
            }
  
            var roleL = "000000"
            if(tinycolor(roleC).isDark()) {
              roleL = "ffffff"
            }

            utils.diEmb(msg, message, roleCE, 'Digite uma nova cor', `${roleC}`, `${roleL}`, `${roleC}+->`);

            msg.reactions.removeAll();

            let filter = m => m.author.id === message.author.id;

            function fe1 () {
            message.channel.awaitMessages(filter, {
                max: 1,
                time: 60000,
                errors: ['time']
              })
              .then(message => {
                message = message.first()
                
                if (tinycolor(message.content).isValid()) {

                  roleC = tinycolor(message.content).toHex();

                  if(roleC === "000000") {
                    roleC = "000001"
                  }
          
                  var roleCE = roleC
                  if(roleCE === "ffffff") {
                    roleCE = "fffffe"
                  }
        
                  var roleL = "000000"
                  if(tinycolor(roleC).isDark()) {
                    roleL = "ffffff"
                  }

                  utils.diEmb(msg, message, roleCE, 'Cor editada', `${roleC}`, `${roleL}`, `${roleC}`);

                  reactions.forEach(r => msg.react(r));
                  message.delete();

                  f1();
                } else {
                  utils.diEmb(msg, message, '000000', 'Cor inválida, digite uma nova cor válida', '000000', 'ffffff', `${roleC}+->`);

                  msg.reactions.removeAll();
                  message.delete();

                  fe1();
                }
              })
              .catch(() => {
                var roleCE = roleC
                if(roleCE === "ffffff") {
                  roleCE = "fffffe"
                }
          
                var roleL = "000000"
                if(tinycolor(roleC).isDark()) {
                  roleL = "ffffff"
                }

                utils.diEmb(msg, message, roleCE, 'Tempo esgotado', roleC, roleL, 'Tempo%20esgotado');
              });
            } fe1()
          } 
    })
    .catch(() => {
      var roleCE = roleC
      if(roleCE === "ffffff") {
        roleCE = "fffffe"
      }

      var roleL = "000000"
      if(tinycolor(roleC).isDark()) {
        roleL = "ffffff"
      }

      utils.diEmb(msg, message, roleCE, 'Tempo esgotado', roleC, roleL, 'Tempo%20esgotado');
      msg.reactions.removeAll();
    });

} f1(); });
} else {
  utils.diEmb(0, message, '000000', 'Cor inválida', '000000', 'ffffff', 'Inválido');
}}
}

module.exports.help = {
  name:"color"
}
