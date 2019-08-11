const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

  var roleC = args[0].replace(/#/g, '');
  if(roleC === "000000") {
    roleC = "000001"
  }

  let roleN = `USER-${message.author.id}`;
  const role = message.guild.roles.find(x => x.name == roleN);
  if(!role) {
    if(!roleC) {
      message.channel.send("Uso correto: `}change {cor em hex}`")
    } else {
      message.guild.createRole({
        name: roleN,
        color: `${roleC}`,
        position: 93
      });
      message.member.addRole(role.id).catch(err => console.error(err));
    }
  } else {
    let cEmb = new Discord.RichEmbed()
    .setColor(parseInt(roleC, 16))
		.setFooter('Cor alterada')
    .setImage(`https://dummyimage.com/150x50/${roleC}/000000&text=${roleC}`);
    
    setTimeout(function(){
      role.setColor(roleC)
    }, 2000);
    message.channel.send(cEmb);
    message.member.addRole(role.id).catch(err => console.error(err));
  }
}

module.exports.help = {
  name:"change"
}
