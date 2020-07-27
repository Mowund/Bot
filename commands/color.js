const botconfig = require("../botconfig.json");
const errors = require("../utils/errors.js");
const Discord = require("discord.js");
var tinycolor = require("tinycolor2");
let pr = (botconfig.prefix);

module.exports.run = async (bot, message, args) => {

if (!['467133077475557376', '599375425445036049', '422236981586690048', '697454249067413519', '719962756421255269'].includes(message.channel.id)) return;

        if(!args[0])
          return message.channel.send(`Uso correto: \`${pr}color change (cor)\``);

        if(args[1]) {
          var uID = args[1].replace(/[\\<>@#&!]/g, '');
        }

        var roleC = tinycolor(args.slice(1).join(" ")).toHex();
        if(!args[1]) {
          roleC = tinycolor.random().toHex();
        }
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
        var role = message.guild.roles.find(x => x.name == roleN);


        var iEmb = new Discord.RichEmbed()
         .setColor(parseInt('000000', 16))
         .setTitle('Cor inválida')
         .setImage(`https://dummyimage.com/300x100/000000/ffffff&text=+Inválido`);


  if(args[0] === 'convert') {

    var tcvColor = tinycolor(args[1]).toHex();

    if(!tinycolor(args[1]).isValid()) {

  let IDerr = 'Você não tem um cargo de cor.'

    roleN = `USER-${uID}`;
    role = message.guild.roles.find(x => x.name == roleN);
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
    
    let rEmb = new Discord.RichEmbed()
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
    role = message.guild.roles.find(x => x.name == roleN);
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

  let rEmb = new Discord.RichEmbed()
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
    role = message.guild.roles.find(x => x.name == roleN);
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

  let rEmb = new Discord.RichEmbed()
  .setColor(parseInt(roleCE, 16))
  .setTitle('Cor removida')
  .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+${roleC}`);

  message.channel.send(rEmb);
  role.delete();
}

if(args[0] === "change") {

    var roleO = message.member;
    var aN = 1;
 
    if(message.guild.members.get(uID)) {
      aN = 2;
      if (!message.member.hasPermission("MANAGE_ROLES")) return errors.noPerms(message, "Gerenciar Cargos");
      roleN = `USER-${uID}`;
      role = message.guild.roles.find(x => x.name == roleN);

      roleC = tinycolor(args.slice(2).join(" ")).toHex();
      if(!args[2]) {
        roleC = tinycolor.random().toHex();
      }    
      if(roleC === "000000") {
        roleC = "000001"
      }

      var roleL = "000000"
        if(tinycolor(roleC).isDark()) {
      roleL = "ffffff"
      }

      roleO = message.guild.members.get(uID);
    };

   if(tinycolor(args.slice(aN).join(" ")).isValid() || !args[aN]) {
    	
  let uEmb = new Discord.RichEmbed()
  .setColor(parseInt(roleCE, 16))
  .setTitle('Você gostaria dessa cor?')
  .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+${roleC}`);
  message.channel.send(uEmb).then((msg) => {
  msg.react('⛔').then(() => msg.react('🔁')).then(() => msg.react('✅'));

const filter = (reaction, user) => {
    return ['⛔', '🔁', '✅'].includes(reaction.emoji.name) && user.id === message.author.id;
};

function f1() {
	
msg.awaitReactions(filter, {max: 1, time: 60000, errors: ['time']})
    .then(collected => {
        const reaction = collected.first();

        if (reaction.emoji.name === '⛔') {

          let nEmb = new Discord.RichEmbed()
          .setColor(parseInt(roleC, 16))
          .setTitle('Cancelado')
          .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+Cancelado`);
          
          msg.edit(nEmb);
          msg.clearReactions();
        
        } else if (reaction.emoji.name === '🔁') {

          roleC = tinycolor.random().toHex();

          let aEmb = new Discord.RichEmbed()
          .setColor(parseInt(roleCE, 16))
          .setTitle('Você gostaria dessa cor?')
          .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+${roleC}`);
          msg.edit(aEmb);
          reaction.remove(message.author.id);

          f1();

        } else {
  
            if(!role) {
                    
            if (message.guild.id === '420007989261500418') {
              var pos = '75'
            } else if (message.guild.id === '589597300033323040') {
              var pos = '28'
            } else if (message.guild.id === '719260113411768331') {
              var pos = '1'
            }; 
                message.guild.createRole({
                  name: roleN,
                  color: `${roleC}`,
                  position: pos
                });
                    
                setTimeout(function(){
                  var role = message.guild.roles.find(x => x.name == roleN)
                  roleO.addRole(role.id).catch(err => console.error(err))
                }, 2500);
              
               } else {
              setTimeout(function(){
                role.setColor(roleC)
                roleO.addRole(role.id).catch(err => console.error(err));
              }, 2500);

            }
            let cEmb = new Discord.RichEmbed()
            .setColor(parseInt(roleCE, 16))
            .setTitle('Cor alterada')
            .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+${roleC}`);

            msg.edit(cEmb);
            msg.clearReactions()
    }
    })
    .catch(() => {
      let tEmb = new Discord.RichEmbed()
      .setColor(parseInt(roleC, 16))
      .setTitle('Tempo esgotado')
      .setImage(`https://dummyimage.com/300x100/${roleC}/${roleL}&text=+Tempo%20esgotado`);
      
      msg.edit(tEmb);
      msg.clearReactions();
    });

} f1(); });
} else {
    message.channel.send(iEmb);
}}

}

module.exports.help = {
  name:"color"
}
