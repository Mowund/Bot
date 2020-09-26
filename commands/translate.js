const Discord = require("discord.js");
const errors = require("../utils/errors.js");

module.exports.run = async (bot, message, args) => {

    var tmsg = args.join(' ');
    var tmsg = tmsg.replace(/[a@]/g, function($1) {return $1 === 'a' ? '@' : 'a'})                                  
                   .replace(/[b;]/g, function($1) {return $1 === 'b' ? ';' : 'b'})
                   .replace(/[c:]/g, function($1) {return $1 === 'c' ? ':' : 'c'});
                   

    message.channel.send(tmsg);

}

module.exports.help = {
  name: "translate"
}
