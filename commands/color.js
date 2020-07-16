const botconfig = require("../botconfig.json");
const Discord = require("discord.js");
var tinycolor = require("tinycolor2");
let pr = (botconfig.prefix);

module.exports.run = async (bot, message, args) => {

if (!['467133077475557376', '599375425445036049', '422236981586690048', '697454249067413519', '719962756421255269'].includes(message.channel.id)) return;

        if(!args[0])
          return message.channel.send(`Uso correto: \`${pr}color change (cor)\``);

        var roleC = tinycolor(args.slice(1).join(" ")).toHex();
        if(!args[1]) {
          roleC = tinycolor.random().toHex();
        }
        if(roleC === "000000") {
          roleC = "000001"
        }
      
        var roleL = "000000"
        if(tinycolor(roleC).isDark()) {
          roleL = "ffffff"
        }
      
        let roleN = `USER-${message.author.id}`;
        var role = message.guild.roles.find(x => x.name == roleN);

if(args[0] === "current") {


  if(!role) return message.channel.send('Você não tem um cargo de cor.');

  roleC = role.hexColor.replace('#', '');

  roleL = "000000"
  if(tinycolor(roleC).isDark()) {
    roleL = "ffffff"
  };

  let rEmb = new Discord.RichEmbed()
  .setColor(role.color)
  .setTitle('Cor atual')
  .setImage(`https://dummyimage.com/150x50/${roleC}/${roleL}&text=${roleC}`);

  message.channel.send(rEmb);
}

if(args[0] === "remove") {

  if(args[2]) {
    let uID = args[2].replace(/[\\<>@#&!]/g
    roleN = `USER-${uID}`;
    role = message.guild.roles.find(x => x.name == roleN);
  }

  if(!role) return message.channel.send('Você não tem um cargo de cor.');

  roleC = role.hexColor.replace('#', '');

  roleL = "000000"
  if(tinycolor(roleC).isDark()) {
    roleL = "ffffff"
  }

  let rEmb = new Discord.RichEmbed()
  .setColor(role.color)
  .setTitle('Cor removida')
  .setImage(`https://dummyimage.com/150x50/${roleC}/${roleL}&text=${roleC}`);

  message.channel.send(rEmb);
  role.delete();
}

if(args[0] === "change")    
if(tinycolor(args.slice(1).join(" ")).isValid() || !args[1]) {
  let uEmb = new Discord.RichEmbed()
  .setColor(parseInt(roleC, 16))
  .setTitle('Você gostaria dessa cor?')
  .setImage(`https://dummyimage.com/150x50/${roleC}/${roleL}&text=+${roleC}`);
  message.channel.send(uEmb).then((msg) => {
  msg.react('⛔').then(() => msg.react('🔁')).then(() => msg.react('✅'));

const filter = (reaction, user) => {
    return ['⛔', '🔁', '✅'].includes(reaction.emoji.name) && user.id === message.author.id;
};

function myFunction() {msg.awaitReactions(filter, {max: 1, time: 60000, errors: ['time']})
    .then(collected => {
        const reaction = collected.first();

        if (reaction.emoji.name === '⛔') {
          let nEmb = new Discord.RichEmbed()
          .setColor(000000)
          .setTitle('Cancelado')
          .setImage(`https://dummyimage.com/150x50/000000/ff0000&text=+Cancelado`);
          
          msg.edit(nEmb);
          msg.clearReactions();
        
        } else if (reaction.emoji.name === '🔁') {

          roleC = tinycolor.random().toHex();

          let aEmb = new Discord.RichEmbed()
          .setColor(parseInt(roleC, 16))
          .setTitle('Você gostaria dessa cor?')
          .setImage(`https://dummyimage.com/150x50/${roleC}/${roleL}&text=+${roleC}`);
          msg.edit(aEmb);
          reaction.remove(message.author.id);

          myFunction();

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
                  message.member.addRole(role.id).catch(err => console.error(err))
                }, 2500);
              
               } else {
              setTimeout(function(){
                role.setColor(roleC)
                message.member.addRole(role.id).catch(err => console.error(err));
              }, 2500);

            }
            let cEmb = new Discord.RichEmbed()
            .setColor(parseInt(roleC, 16))
            .setTitle('Cor alterada')
            .setImage(`https://dummyimage.com/150x50/${roleC}/${roleL}&text=+${roleC}`);

            msg.edit(cEmb);
            msg.clearReactions()
    }
    })
    .catch(collected => {
      err => console.error(err)
      let tEmb = new Discord.RichEmbed()
      .setColor(000000)
      .setTitle('Tempo esgotado')
      .setImage(`https://dummyimage.com/150x50/000000/ff0000&text=+Tempo%20esgotado`);
      
      msg.edit(tEmb);
      msg.clearReactions();
    });

} myFunction(); });
} else {
  let iEmb = new Discord.RichEmbed()
    .setColor(000000)
    .setTitle('Cor inválida')
    .setImage(`https://dummyimage.com/150x50/000000/ff0000&text=+Inválido`);
    message.channel.send(iEmb);
}

}

module.exports.help = {
  name:"color"
}
