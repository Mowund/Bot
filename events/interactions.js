const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const utils = require('../utils/utils.js');
const pack = require('../package.json');
require('colors');
require('log-timestamp');

module.exports = {
  name: 'interactionCreate',
  async execute(client, interaction) {
    function getTS(path, values) {
      return utils.getTSE(interaction.guild, path, values);
    }

    var user = interaction.options
      ? interaction.options.getUser('user') ?? interaction.user
      : interaction.user;
    var member = interaction.guild
      ? interaction.guild.members.cache.get(user.id) ?? user
      : user;
    var botMember = interaction.guild
      ? interaction.guild.members.cache.get(client.user.id) ?? client.user
      : client.user;

    var emb = new MessageEmbed()
      .setColor(member.displayColor ?? '6622aa')
      .setFooter(
        await getTS(['GENERIC', 'REQUESTED_BY'], {
          USER: interaction.user.username,
        }),
        interaction.user.avatarURL()
      )
      .setTimestamp(Date.now());

    if (interaction.isCommand()) {
      // Botinfo command
      if (interaction.commandName == 'botinfo') {
        emb = emb
          .setColor(botMember.displayColor ?? '6622aa')
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
          );
        var row = new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel(await getTS('BOTINFO_INVITES_SUPPORT'))
            .setEmoji('📖')
            .setStyle('LINK')
            .setURL('https://discord.gg/f85rEGJ')
        );
        await interaction.reply({ embeds: [emb], components: [row] });
      }
      // Kill command
      else if (interaction.commandName == 'kill') {
        emb = emb
          .setColor('ff0000')
          .setAuthor(user.username, user.avatarURL())
          .setDescription('Caiu para fora do mundo.');
        await interaction.reply({ embeds: [emb] });
      }
      // Ping command
      else if (interaction.commandName == 'ping') {
        var itcTime = Date.now();

        await interaction.defer();
        var bM = await interaction.fetchReply();
        var bMT = bM.createdTimestamp ?? bM.timestamp;
        emb = emb
          .setTitle(await getTS(['PING', 'TITLE'], { E: '🏓' }))
          .addFields(
            {
              name: await getTS(['PING', 'RESPONSE_TIME'], { E: '⌛' }),
              value: '`' + (itcTime - new Date(bMT).getTime()) + 'ms`',
              inline: true,
            },
            {
              name: await getTS(['PING', 'EDITING_TIME'], { E: '⌚' }),
              value: '`' + (Date.now() - new Date(bMT).getTime()) + 'ms`',
              inline: true,
            },
            {
              name: await getTS(['PING', 'API_LATENCY'], { E: '💓' }),
              value: '`' + Math.round(client.ws.ping) + 'ms`',
              inline: true,
            },
            {
              name: await getTS(['PING', 'UPTIME'], { E: '🕑' }),
              value: '`' + msToTime(client.uptime) + '`',
              inline: false,
            }
          );

        await interaction.editReply({
          embeds: [emb],
        });

        function msToTime(ms) {
          let days = Math.floor(ms / 86400000);
          let hours = Math.floor((ms % 86400000) / 3600000);
          let minutes = Math.floor((ms % 3600000) / 60000);
          let sec = Math.floor((ms % 60000) / 1000);

          let str = '';
          if (days) str = str + days + 'd ';
          if (hours) str = str + hours + 'h ';
          if (minutes) str = str + minutes + 'm ';
          if (sec) str = str + sec + 's';

          return str;
        }
      } else if (interaction.commandName == 'punish') {
        if (!interaction.guild) {
          emb = emb
            .setColor('ff0000')
            .setTitle(await getTS(['GENERIC', 'ERROR']))
            .setDescription(await getTS(['GENERIC', 'NO_DM']));
          return interaction.reply({ embeds: [emb] });
        }

        emb = emb
          .setTitle(await getTS(['GENERIC', 'WIP']))
          .setDescription(await getTS(['GENERIC', 'WIP_COMMAND']));
        interaction.reply({ embeds: [emb] });
      }
    } else {
      emb = emb.setFooter(
        await getTS(['GENERIC', 'INTERACTED_BY'], {
          USER: interaction.user.username,
        }),
        interaction.user.avatarURL()
      );
      if (interaction.isButton()) {
      }
    }

    // Log interaction to console
    console.log(
      interaction.user.username.blue +
        ' ('.gray +
        interaction.user.id.blue +
        ') -'.gray +
        (interaction.guild
          ? ' ' +
            interaction.guild.name.cyan +
            ' ('.gray +
            interaction.guild.id.cyan +
            ') - '.gray +
            '#'.green +
            interaction.channel.name.green
          : '') +
        ' ('.gray +
        interaction.channelId.green +
        '): '.gray +
        (interaction.componentType
          ? interaction.type.red +
            ':'.gray +
            interaction.componentType.red +
            ':'.gray
          : interaction.type.red + ':'.gray) +
        (interaction.customId ?? interaction.commandName).yellow +
        ':'.gray +
        JSON.stringify(interaction).brightRed +
        (interaction.options
          ? ':'.gray + JSON.stringify(interaction.options)
          : '')
    );
  },
};
