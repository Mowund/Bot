const botconfig = require("../botconfig.json");
const Discord = require("discord.js");
var tinycolor = require("tinycolor2");
let pr = (botconfig.prefix);

module.exports.run = async (bot, message, args) => {

  if (!['467133077475557376', '599375425445036049', '422236981586690048'].includes(message.channel.id)) return;

  var rolePC = tinycolor(args.join(" ")).toHexString();
  if(args[0] === "random") {
    rolePC = tinycolor.random().toHexString();
  }
  var roleC = rolePC.replace(/#/g, '');
  if(roleC === "000000") {
    roleC = "000001"
  }

  var roleL = "000000"
  if(tinycolor(roleC).isDark()) {
    roleL = "ffffff"
  }

  let roleN = `USER-${message.author.id}`;
  const role = message.guild.roles.find(x => x.name == roleN);

if(!args[0]) {
  message.channel.send(`Uso correto: \`${pr}change {cor}\``)
} else {
  if(tinycolor(args.join(" ")).isValid() || args[0] === "random") {
    if(!role) {
        message.guild.createRole({
          name: roleN,
          color: `${roleC}`,
          position: 93
        });
        message.member.addRole(role.id).catch(err => console.error(err));
      
       } else {
      let cEmb = new Discord.RichEmbed()
      .setColor(parseInt(roleC, 16))
	  	.setFooter('Cor alterada')
      .setImage(`https://dummyimage.com/150x50/${roleC}/${roleL}&text=${roleC}`);
      
      setTimeout(function(){
        role.setColor(roleC)
      }, 2500);
      message.channel.send(cEmb);
      message.member.addRole(role.id).catch(err => console.error(err));
    }
  } else {
    let iEmb = new Discord.RichEmbed()
      .setColor(000000)
	  	.setFooter('Cor inválida')
      .setImage(`https://dummyimage.com/150x50/000000/ff0000&text=Inválido`);
      message.channel.send(iEmb);
}
}
}

module.exports.help = {
  name:"change"
}
