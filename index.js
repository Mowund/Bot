const botconfig = require('./botconfig.json');
const Discord = require('discord.js');
const fs = require('fs');
let coins = require('./coins.json');
let xp = require('./xp.json');
require('colors');
require('log-timestamp');

var dPrefix = botconfig.prefix;

if (!process.env.token) {
  var enJSON = require('./env.json');
  process.env.token = enJSON.token;
  process.env.mongo_uri = enJSON.mongo_uri;
  dPrefix = botconfig.tprefix;
}

const WOKCommands = require('wokcommands');
require('dotenv').config();

const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION'] });

client.on('ready', () => {
  const dbOptions = {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  };

  const wok = new WOKCommands(client, {
    commandsDir: 'commands',
    featureDir: 'features',
    messagesPath: 'messages.json',
    testServers: '747587598712569913',
    showWarns: true,
    dbOptions,
  })
    .setMongoPath(process.env.mongo_uri)
    .setDefaultPrefix(dPrefix)
    .setBotOwner('251120969320497153')
    .setColor(0xff0000)
    .setCategorySettings([
      {
        name: 'Utils',
        emoji: '🌀',
      },
      {
        name: 'Configuration',
        emoji: '🚧',
      },
    ]);

  wok.on('databaseConnected', (connection) => {
    console.log('Database conectado!'.green);
  });
});

{
  /*  if(!message.member.roles.find(x => x.name === 'Não Registrados')){
    if(!coins[message.author.id]){
      coins[message.author.id] = {
        coins: 0
      };
    }
  
    let coinAmt = Math.floor(Math.random() * 15) + 1;
    let baseAmt = Math.floor(Math.random() * 15) + 1;
    console.log(`${message.author.username}#${message.author.discriminator}: ` .blue);
    console.log(`COIN:` .cyan, `${coinAmt} ; ${baseAmt}` .green);
  
    if(coinAmt === baseAmt){
      coins[message.author.id] = {
        coins: coins[message.author.id].coins + coinAmt
      };
    fs.writeFile('./coins.json', JSON.stringify(coins), (err) => {
      if (err) console.log(err)
    });
  
    let coinEmbed = new Discord.MessageEmbed()
    .setAuthor(message.author.username)
    .setColor('#0000FF')
    .addField('💸', `${coinAmt} moedas adicionadas!`);
  
    message.channel.send(coinEmbed).then(msg => {msg.delete({timeout:1000})});
    }
  }
  
    if(!message.member.roles.find(x => x.name === 'Não Registrados')){
    let xpAdd = Math.floor(Math.random() * 7) + 8;
    console.log(`XP:` .cyan, `${xpAdd}` .green);
  
  
    if(!xp[message.author.id]){
      xp[message.author.id] = {
        xp: 0,
        level: 1
      };
    }
  
  
    let curxp = xp[message.author.id].xp;
    let curlvl = xp[message.author.id].level;
    let nxtLvl = xp[message.author.id].level * 300;
    xp[message.author.id].xp =  curxp + xpAdd;
    if(nxtLvl <= xp[message.author.id].xp){
      xp[message.author.id].level = curlvl + 1;
      let lvlup = new Discord.MessageEmbed()
      .setTitle('Upou de Nível!')
      .setColor('#d604cf')
      .addField('Novo Nível', curlvl + 1);
  
      message.channel.send(lvlup);
    }
    fs.writeFile('./xp.json', JSON.stringify(xp), (err) => {
      if(err) console.log(err)
   })
  };*/
}

client.login(process.env.token).catch((err) => console.log(err));
