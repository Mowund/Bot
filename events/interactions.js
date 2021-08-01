const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const utils = require('../utils/utils.js');
const pack = require('../package.json');
require('colors');
require('log-timestamp');

module.exports = {
  name: 'interactionCreate',
  async execute(client, interaction) {
    function getTS(path, values) {
      return utils.getTSE(interaction.guild.id, path, values);
    }

    var guildI = client.guilds.cache.get(interaction.guild.id);
    if (guildI) {
      var uI = guildI.members.cache.get(interaction.member.user.id);
      var uIF = await client.users.fetch(interaction.member.user.id);
    }
    if (interaction.isCommand()) {
      if (interaction.commandName == 'botinfo') {
        var emb = new MessageEmbed()
          .setColor('00ff55')
          .setTitle(await getTS('BOTINFO_TITLE'))
          .setThumbnail(client.user.avatarURL())
          .addField(await getTS('BOTINFO_NAME_FIELD'), client.user.username)
          .addField(await getTS('BOTINFO_VERSION_FIELD'), pack.version, true)
          .addField(
            await getTS('BOTINFO_CREATION_FIELD'),
            utils.toUTS(client.user.createdAt)
          )
          .addField(
            await getTS('BOTINFO_SERVERS_FIELD'),
            await getTS('BOTINFO_SERVERS_FIELD_DESC', {
              SERVERS: client.guilds.cache.size,
            }),
            true
          )
          .setTimestamp(Date.now());
        const row = new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel(await getTS('BOTINFO_INVITES_BOT'))
            .setEmoji('✉️')
            .setStyle('LINK')
            .setURL(
              'https://discord.com/api/oauth2/authorize?client_id=618587791546384385&permissions=261993005047&scope=bot%20applications.commands'
            ),
          new MessageButton()
            .setLabel(await getTS('BOTINFO_INVITES_SUPPORT'))
            .setEmoji('📖')
            .setStyle('LINK')
            .setURL('https://discord.gg/f85rEGJ')
        );
        await interaction.reply({ embeds: [emb], components: [row] });
      } else if (interaction.commandName == 'ping') {
        var itcTime = Date.now();

        await interaction.defer();
        var botMsg = await interaction.fetchReply();
        var emj = '<:signal_rgb:861544329449439242>';
        var emb = new MessageEmbed()
          .setColor('ff0000')
          .setTitle(await getTS(['PING', 'TITLE'], { E: '🏓' }))
          .addFields(
            {
              name: await getTS(['PING', 'RESPONSE_TIME'], { E: '⌛' }),
              value:
                '`' +
                (itcTime - new Date(botMsg.createdTimestamp).getTime()) +
                'ms`',
              inline: true,
            },
            {
              name: await getTS(['PING', 'API_LATENCY'], { E: '💓' }),
              value: '`' + Math.round(client.ws.ping) + 'ms`',
              inline: true,
            },
            {
              name: await getTS(['PING', 'EDITING_TIME'], { E: '⌚' }),
              value:
                '`' +
                (Date.now() - new Date(botMsg.createdTimestamp).getTime()) +
                'ms`',
              inline: true,
            },
            {
              name: await getTS(['PING', 'UPTIME'], { E: '🕑' }),
              value: '`' + msToTime(client.uptime) + '`',
              inline: true,
            }
          )
          .setTimestamp(Date.now());

        await interaction.editReply({
          embeds: [emb],
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
    }
  },
};
