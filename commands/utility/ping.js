const Discord = require('discord.js');
const Discord = require('discord.js');
const utils = require('../../utils/utils.js');

module.exports = class PingCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      group: 'utility',
      memberName: 'ping',
      description: 'Mostra o tempo de resposta, ping e uptime do bot.',
    });
  }
  async run(msg, args) {
    function getTS(path, values) {
      return utils.getTSE(msg.guild.id, path, values);
    }

    var botMsg = await msg.say('〽️ Pingando...');

    var emb = new Discord.MessageEmbed()
      .setColor('ff0000')
      .setTitle(await getTS(['PING', 'TITLE'], { E: '🏓' }))
      .addFields(
        {
          name: await getTS(['PING', 'RESPONSE_TIME'], { E: '⌛' }),
          value: '`' + (botMsg.createdAt - msg.createdAt) + 'ms`',
          inline: true,
        },
        {
          name: await getTS(['PING', 'API_LATENCY'], { E: '💓' }),
          value: '`' + Math.round(this.client.ws.ping) + 'ms`',
          inline: true,
        },
        {
          name: await getTS(['PING', 'EDITING_TIME'], { E: '⌚' }),
          value:
            '`' + (Date.now() - new Date(botMsg.createdAt).getTime()) + 'ms`',
          inline: true,
        },
        {
          name: await getTS(['PING', 'UPTIME'], { E: '🕑' }),
          value: '`' + msToTime(this.client.uptime) + '`',
          inline: true,
        }
      )
      .setTimestamp(Date.now());

    botMsg
      .edit({
        content: '',
        embed: emb,
      })
      .catch((err) => {
        console.log(err);
        botMsg.edit('🆘 Erro desconhecido.');
      });

    function msToTime(ms) {
      let days = Math.floor(ms / 86400000);
      let daysms = ms % 86400000;
      let hours = Math.floor(daysms / 3600000);
      let hoursms = ms % 3600000;
      let minutes = Math.floor(hoursms / 60000);
      let minutesms = ms % 60000;
      let sec = Math.floor(minutesms / 1000);

      let str = '';
      if (days) str = str + days + 'd ';
      if (hours) str = str + hours + 'h ';
      if (minutes) str = str + minutes + 'm ';
      if (sec) str = str + sec + 's';

      return str;
    }
  }
};
