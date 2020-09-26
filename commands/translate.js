const Discord = require("discord.js");
const errors = require("../utils/errors.js");

module.exports.run = async (bot, message, args) => {

    var tmsg = args.join(' ');
    var tmsg = tmsg.replace(/[a@]/g, function($1) {return $1 === 'a' ? '@' : 'a'})                                  
                   .replace(/[b;]/g, function($1) {return $1 === 'b' ? ';' : 'b'})
                   .replace(/[c']/g, function($1) {return $1 === 'c' ? '\'' : 'c'})
                   .replace(/[d\$]/g, function($1) {return $1 === 'd' ? '$' : 'd'})
                   .replace(/[e3]/g, function($1) {return $1 === 'e' ? '3' : 'e'})
                   .replace(/[f%]/g, function($1) {return $1 === 'f' ? '%' : 'f'}).replace('_','f')
                   .replace(/[g&]/g, function($1) {return $1 === 'g' ? '&' : 'g'})
                   .replace(/[h-]/g, function($1) {return $1 === 'h' ? '-' : 'h'})
                   .replace(/[i8]/g, function($1) {return $1 === 'i' ? '8' : 'i'})
                   .replace(/[j\+]/g, function($1) {return $1 === 'j' ? '+' : 'j'})
                   .replace(/[k\(]/g, function($1) {return $1 === 'k' ? '(' : 'k'});
                   

    message.channel.send(tmsg);

}

module.exports.help = {
  name: "translate"
}
