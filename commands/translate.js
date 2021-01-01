const Discord = require("discord.js");
const errors = require("../utils/errors.js");
require('colors');

module.exports.run = async (bot, message, args) => {

String.prototype.isUpperCase = function() {
    return this.valueOf().toUpperCase() === this.valueOf();
};

    var tmsg = args.join(' ');
    var pcpt = '0';

    if(/(?=.*[A-Z])^[^a-z]*$/.test(tmsg)) {
       tmsg = '§ ' + tmsg;
       pcpt = '1';
    }

    var tmsg = tmsg.replace(/(A|@·)/g, function($1) {return $1 === 'A' ? '@·' : 'A'})
                   .replace(/(B|;·)/g, function($1) {return $1 === 'B' ? ';·' : 'B'})
                   .replace(/(C|'·)/g, function($1) {return $1 === 'C' ? '\'·' : 'C'})
                   .replace(/(D|\$·)/g, function($1) {return $1 === 'D' ? '$·' : 'D'})
                   .replace(/(E|3·)/g, function($1) {return $1 === 'E' ? '3·' : 'E'})
                   .replace(/(F|%·)/g, function($1) {return $1 === 'F' ? '%·' : 'F'}).replace('_·','F')
                   .replace(/(G|&·)/g, function($1) {return $1 === 'G' ? '&·' : 'G'})
                   .replace(/(H|\-·)/g, function($1) {return $1 === 'H' ? '-·' : 'H'})
                   .replace(/(I|8·)/g, function($1) {return $1 === 'I' ? '8·' : 'I'})
                   .replace(/(J|\+·)/g, function($1) {return $1 === 'J' ? '+·' : 'J'})
                   .replace(/(K|\(·)/g, function($1) {return $1 === 'K' ? '(·' : 'K'})
                   .replace(/(L|\)·)/g, function($1) {return $1 === 'L' ? ')·' : 'L'})
                   .replace(/(M|\?·)/g, function($1) {return $1 === 'M' ? '?·' : 'M'})
                   .replace(/(N|\!·)/g, function($1) {return $1 === 'N' ? '!·' : 'N'})
                   .replace(/(O|9·)/g, function($1) {return $1 === 'O' ? '9·' : 'O'})
                   .replace(/(P|0·)/g, function($1) {return $1 === 'P' ? '0·' : 'P'})
                   .replace(/(Q|1·)/g, function($1) {return $1 === 'Q' ? '1·' : 'Q'})
                   .replace(/(R|4·)/g, function($1) {return $1 === 'R' ? '4·' : 'R'})
                   .replace(/(S|#·)/g, function($1) {return $1 === 'S' ? '#·' : 'S'})
                   .replace(/(T|5·)/g, function($1) {return $1 === 'T' ? '5·' : 'T'})
                   .replace(/(U|7·)/g, function($1) {return $1 === 'U' ? '7·' : 'U'})
                   .replace(/(V|:·)/g, function($1) {return $1 === 'V' ? ':·' : 'V'})
                   .replace(/(W|2·)/g, function($1) {return $1 === 'W' ? '2·' : 'W'})
                   .replace(/(X|"·)/g, function($1) {return $1 === 'X' ? '\"·' : 'X'})
                   .replace(/(Y|6·)/g, function($1) {return $1 === 'Y' ? '6·' : 'Y'})
                   .replace(/(Z|\*·)/g, function($1) {return $1 === 'Z' ? '*·' : 'Z'})
                   .replace(/(a|@(?!·))/g, function($1) {return $1 === 'a' ? '@' : 'a'})                                  
                   .replace(/(b|;(?!·))/g, function($1) {return $1 === 'b' ? ';' : 'b'})
                   .replace(/(c|'(?!·))/g, function($1) {return $1 === 'c' ? '\'' : 'c'})
                   .replace(/(d|\$(?!·))/g, function($1) {return $1 === 'd' ? '$' : 'd'})
                   .replace(/(e|3(?!·))/g, function($1) {return $1 === 'e' ? '3' : 'e'})
                   .replace(/(f|%(?!·))/g, function($1) {return $1 === 'f' ? '%' : 'f'}).replace('_','f')
                   .replace(/(g|&(?!·))/g, function($1) {return $1 === 'g' ? '&' : 'g'})
                   .replace(/(h|-(?!·))/g, function($1) {return $1 === 'h' ? '-' : 'h'})
                   .replace(/(i|8(?!·))/g, function($1) {return $1 === 'i' ? '8' : 'i'})
                   .replace(/(j|\+(?!·))/g, function($1) {return $1 === 'j' ? '+' : 'j'})
                   .replace(/(k|\((?!·))/g, function($1) {return $1 === 'k' ? '(' : 'k'})
                   .replace(/(l|\)(?!·))/g, function($1) {return $1 === 'l' ? ')' : 'l'})
                   .replace(/(m|\?(?!·))/g, function($1) {return $1 === 'm' ? '?' : 'm'})
                   .replace(/(n|\!(?!·))/g, function($1) {return $1 === 'n' ? '!' : 'n'})
                   .replace(/(o|9(?!·))/g, function($1) {return $1 === 'o' ? '9' : 'o'})
                   .replace(/(p|0(?!·))/g, function($1) {return $1 === 'p' ? '0' : 'p'})
                   .replace(/(q|1(?!·))/g, function($1) {return $1 === 'q' ? '1' : 'q'})
                   .replace(/(r|4(?!·))/g, function($1) {return $1 === 'r' ? '4' : 'r'})
                   .replace(/(s|#(?!·))/g, function($1) {return $1 === 's' ? '#' : 's'})
                   .replace(/(t|5(?!·))/g, function($1) {return $1 === 't' ? '5' : 't'})
                   .replace(/(u|7(?!·))/g, function($1) {return $1 === 'u' ? '7' : 'u'})
                   .replace(/(v|:(?!·))/g, function($1) {return $1 === 'v' ? ':' : 'v'})
                   .replace(/(w|2(?!·))/g, function($1) {return $1 === 'w' ? '2' : 'w'})
                   .replace(/(x|"(?!·))/g, function($1) {return $1 === 'x' ? '\"' : 'x'})
                   .replace(/(y|6(?!·))/g, function($1) {return $1 === 'y' ? '6' : 'y'})
                   .replace(/(z|\*(?!·))/g, function($1) {return $1 === 'z' ? '*' : 'z'});

    
    if(tmsg.startsWith('§ ')) {
      tmsg = tmsg.replace(/[·]/g, '')

      if(pcpt === '0') {
        tmsg = tmsg.toUpperCase().slice(2);
      }
    };

    message.channel.send(tmsg);

}

module.exports.help = {
  name: "translate"
}
