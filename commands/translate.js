const Discord = require("discord.js");
const errors = require("../utils/errors.js");

module.exports.run = async (bot, message, args) => {

    var tmsg = args.join(' ');
    var tmsg = tmsg.toLowerCase.replace(/[a@]/g, function($1) {return $1 === 'a' ? '@' : 'a'})                                  
                   .replace(/[b;]/g, function($1) {return $1 === 'b' ? ';' : 'b'})
                   .replace(/[c']/g, function($1) {return $1 === 'c' ? '\'' : 'c'})
                   .replace(/[d\$]/g, function($1) {return $1 === 'd' ? '$' : 'd'})
                   .replace(/[e3]/g, function($1) {return $1 === 'e' ? '3' : 'e'})
                   .replace(/[f%]/g, function($1) {return $1 === 'f' ? '%' : 'f'}).replace('_','f')
                   .replace(/[g&]/g, function($1) {return $1 === 'g' ? '&' : 'g'})
                   .replace(/[h-]/g, function($1) {return $1 === 'h' ? '-' : 'h'})
                   .replace(/[i8]/g, function($1) {return $1 === 'i' ? '8' : 'i'})
                   .replace(/[j\+]/g, function($1) {return $1 === 'j' ? '+' : 'j'})
                   .replace(/[k\(]/g, function($1) {return $1 === 'k' ? '(' : 'k'})
                   .replace(/[l\)]/g, function($1) {return $1 === 'l' ? ')' : 'l'})
                   .replace(/[m\?]/g, function($1) {return $1 === 'm' ? '?' : 'm'})
                   .replace(/[n\!]/g, function($1) {return $1 === 'n' ? '!' : 'n'})
                   .replace(/[o9]/g, function($1) {return $1 === 'o' ? '9' : 'o'})
                   .replace(/[p0]/g, function($1) {return $1 === 'p' ? '0' : 'p'})
                   .replace(/[q1]/g, function($1) {return $1 === 'q' ? '1' : 'q'})
                   .replace(/[r4]/g, function($1) {return $1 === 'r' ? '4' : 'r'})
                   .replace(/[s#]/g, function($1) {return $1 === 's' ? '#' : 's'})
                   .replace(/[t5]/g, function($1) {return $1 === 't' ? '5' : 't'})
                   .replace(/[u7]/g, function($1) {return $1 === 'u' ? '7' : 'u'})
                   .replace(/[v:]/g, function($1) {return $1 === 'v' ? ':' : 'v'})
                   .replace(/[w2]/g, function($1) {return $1 === 'w' ? '2' : 'w'})
                   .replace(/[x"]/g, function($1) {return $1 === 'x' ? '\"' : 'x'})
                   .replace(/[y6]/g, function($1) {return $1 === 'y' ? '6' : 'y'})
                   .replace(/[z\*]/g, function($1) {return $1 === 'z' ? '*' : 'z'});
                   
                  
    message.channel.send(tmsg);

}

module.exports.help = {
  name: "translate"
}
