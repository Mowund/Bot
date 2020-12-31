const botconfig = require("../botconfig.json");
const errors = require("../utils/errors.js");
const Discord = require("discord.js");
var tinycolor = require("tinycolor2");
const { getColorFromURL } = require('color-thief-node');
const chalk = require('chalk');
let pr = (botconfig.prefix);

module.exports.run = async (bot, message, args) => {

if (!['467133077475557376', '599375425445036049', '422236981586690048', '697454249067413519', '780208029999431701'].includes(message.channel.id)) return;

        if(!args[0])
          return message.channel.send(`Uso correto: \`${pr}color change (cor)\``);

        if(args[1]) {
          var uID = args[1].replace(/[\\<>@#&!]/g, '');
        }

        var roleC = tinycolor(args.slice(1).join(" ")).toHex();

        if(message.guild.members.cache.get(uID)) {

          var uIDF = await bot.users.fetch(uID)
          var prC = await getColorFromURL(uIDF.avatarURL({format:'png'}));
          var [r, g, b] = prC
          roleC = tinycolor(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex(); 

        } else if(!args[1]) {

          var prC = await getColorFromURL(message.author.avatarURL({format:'png'}));
          var [r, g, b] = prC
          roleC = tinycolor(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex();
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


        var iEmb = new Discord.MessageEmbed()
         .setColor(parseInt('000000', 16))
         .setTitle('Cor inválida')
         .setImage(`https://dummyimage.com/300x100/000000/ffffff&text=+Inválido`);


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
    
    let rEmb = new Discord.MessageEmbed()
    .setColor(parseInt(tcvColor, 16))
    .setTitle('Convertido em RGB')
    .setImage(`https://dummyimage.com/300x100/${tcvColor}/${cColorL}&text=+${RgbLk}`)
    .setFooter(`${cvRgb}`);
  
    message.channel.send(rEmb);
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

  let rEmb = new Discord.MessageEmbed()
  .setColor(parseInt(roleCE, 16))
  .setTitle('Cor atual')
  .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+${roleC}`);

  message.channel.send(rEmb);
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

  let rEmb = new Discord.MessageEmbed()
  .setColor(parseInt(roleCE, 16))
  .setTitle('Cor removida')
  .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+${roleC}`);

  message.channel.send(rEmb);
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
  .setTitle('Você gostaria dessa cor?')
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

          var roleL = "000000"
          if(tinycolor(roleC).isDark()) {
            roleL = "ffffff"
          }

          let nEmb = new Discord.MessageEmbed()
          .setColor(parseInt(roleC, 16))
          .setTitle('Cancelado')
          .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+Cancelado`);
          
          msg.edit(nEmb);
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

          let aEmb = new Discord.MessageEmbed()
          .setColor(parseInt(roleCE, 16))
          .setTitle('Você gostaria dessa cor?')
          .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+${roleC}`);
          msg.edit(aEmb);
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
              setTimeout(function(){
                role.setColor(roleC);
                role.setPosition(pos - 1);
                roleO.roles.add(role.id).catch(err => console.error(err));
              }, 2500);

            }
            let cEmb = new Discord.MessageEmbed()
            .setColor(parseInt(roleCE, 16))
            .setTitle('Cor alterada')
            .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+${roleC}`);

            msg.edit(cEmb);
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
  
            let aEmb = new Discord.MessageEmbed()
            .setColor(parseInt(roleCE, 16))
            .setTitle('Você gostaria dessa cor?')
            .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+${roleC}`);
            msg.edit(aEmb);
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
  
            let aEmb = new Discord.MessageEmbed()
            .setColor(parseInt(roleCE, 16))
            .setTitle('Você gostaria dessa cor?')
            .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+${roleC}`);
            msg.edit(aEmb);
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

            let aEmb = new Discord.MessageEmbed()
            .setColor(parseInt(roleCE, 16))
            .setTitle('Digite uma cor para misturar')
            .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+${roleC}+＋`);
            msg.edit(aEmb);
            msg.reactions.removeAll();

            let filter = m => m.author.id === message.author.id;

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

                  let aEmb = new Discord.MessageEmbed()
                  .setColor(parseInt(roleCE, 16))
                  .setTitle('Cor misturada.')
                  .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+${roleC}`);
                  msg.edit(aEmb);
                  reactions.forEach(r => msg.react(r));

                  message.delete();

                  f1();
                } else {
                  msg.edit(iEmb)
                  msg.reactions.removeAll();
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

                let tEmb = new Discord.MessageEmbed()
                .setColor(parseInt(roleCE, 16))
                .setTitle('Tempo esgotado')
                .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+Tempo%20esgotado`);

                msg.edit(tEmb);
              });

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

            let aEmb = new Discord.MessageEmbed()
            .setColor(parseInt(roleCE, 16))
            .setTitle('Digite uma nova cor')
            .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+${roleC}+->`);
            msg.edit(aEmb);
            msg.reactions.removeAll();

            let filter = m => m.author.id === message.author.id;

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

                  let aEmb = new Discord.MessageEmbed()
                  .setColor(parseInt(roleCE, 16))
                  .setTitle('Você gostaria dessa cor?')
                  .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+${roleC}`);
                  msg.edit(aEmb);
                  reactions.forEach(r => msg.react(r));

                  message.delete();
                  
                  f1();
                } else {
                  msg.edit(iEmb)
                  msg.reactions.removeAll();
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

                let tEmb = new Discord.MessageEmbed()
                .setColor(parseInt(roleCE, 16))
                .setTitle('Tempo esgotado')
                .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+Tempo%20esgotado`);

                msg.edit(tEmb);
              });
          };
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

      let tEmb = new Discord.MessageEmbed()
      .setColor(parseInt(roleCE, 16))
      .setTitle('Tempo esgotado')
      .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+Tempo%20esgotado`);
      
      msg.edit(tEmb);
      msg.reactions.removeAll();
    });

} f1(); });
} else {
    message.channel.send(iEmb);
}}
}

module.exports.help = {
  name:"color"
}
