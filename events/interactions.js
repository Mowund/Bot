const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const utils = require('../utils/utils.js');
const pack = require('../package.json');
const database = require('../utils/database');
require('colors');
require('log-timestamp');

module.exports = {
  name: 'interactionCreate',
  async execute(client, interaction) {
    var {
      channel,
      channelId,
      commandName,
      componentType,
      customId,
      guild,
      options,
      user,
    } = interaction;

    var botMember = guild
      ? guild.members.cache.get(client.user.id) ?? client.user
      : client.user;
    var userO = options ? options.getUser('user') ?? user : user;
    var memberO = guild ? guild.members.cache.get(userO.id) ?? userO : userO;
    var ephemeralTO = options ? options.getBoolean('ephemeral') ?? true : true;
    var ephemeralFO = options
      ? options.getBoolean('ephemeral') ?? false
      : false;

    // Log interaction to console
    console.log(
      user.username.blue +
        ' ('.gray +
        user.id.blue +
        ') -'.gray +
        (guild
          ? ' ' +
            guild.name.cyan +
            ' ('.gray +
            guild.id.cyan +
            ') - '.gray +
            '#'.green +
            channel.name.green
          : ' DM'.green) +
        ' ('.gray +
        channelId.green +
        '): '.gray +
        (componentType
          ? interaction.type.red + ':'.gray + componentType.red + ':'.gray
          : interaction.type.red + ':'.gray) +
        (customId ?? commandName).yellow +
        ':'.gray +
        JSON.stringify(interaction).brightRed +
        (options ? ':'.gray + JSON.stringify(options) : '')
    );

    function getTS(path, values) {
      return utils.getTSE(guild, path, values);
    }

    var emb = new MessageEmbed()
      .setColor(memberO.displayColor ?? '6622aa')
      .setFooter(
        await getTS(['GENERIC', 'REQUESTED_BY'], {
          USER: user.username,
        }),
        user.avatarURL()
      )
      .setTimestamp(Date.now());

    if (interaction.isCommand()) {
      // Botinfo command
      if (commandName == 'botinfo') {
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
        await interaction.reply({
          embeds: [emb],
          components: [row],
          ephemeral: ephemeralTO,
        });
      }
      // Echo command
      else if (commandName == 'echo') {
        /*await interaction.reply({
          embeds: [emb],
          ephemeral: ephemeralTO,
        });*/
      }
      // Kill command
      else if (commandName == 'kill') {
        emb = emb
          .setColor('ff0000')
          .setAuthor(userO.username, userO.avatarURL())
          .setDescription('Caiu para fora do mundo.');
        await interaction.reply({ embeds: [emb], ephemeral: ephemeralFO });
      }
      // Language command
      else if (commandName == 'language') {
        await interaction.deferReply({ ephemeral: ephemeralTO });

        if (!guild) {
          emb = emb
            .setColor('ff0000')
            .setTitle(await getTS(['GENERIC', 'ERROR']))
            .setDescription(await getTS(['GENERIC', 'NO_DM']));
          return interaction.editReply({
            embeds: [emb],
          });
        }
        language = options.getString('language');
        if (language) {
          database.setLanguage(guild.id, language);

          var emb = emb
            .setColor('00ff00')
            .setTitle(await getTS(['LANGUAGE', 'CHANGED']))
            .setDescription(
              await getTS(['LANGUAGE', 'CHANGED_TO'], { LANG: language })
            );
          await interaction.editReply({
            embeds: [emb],
            ephemeral: ephemeralTO,
          });
        } else {
          language = await database.getLanguage(guild.id);

          var emb = emb
            .setColor('00ff00')
            .setTitle(await getTS(['LANGUAGE', 'CURRENT']))
            .setDescription(
              await getTS(['LANGUAGE', 'CURRENT_IS'], { LANG: language })
            );
          await interaction.editReply({
            embeds: [emb],
            ephemeral: ephemeralTO,
          });
        }
      }
      // Ping command
      else if (commandName == 'ping') {
        var itcTime = Date.now();
        await interaction.deferReply();

        var bM = await interaction.fetchReply();
        var bMT = new Date(bM.createdTimestamp ?? bM.timestamp).getTime();
        emb = emb
          .setTitle(await getTS(['PING', 'TITLE'], { E: '🏓' }))
          .addFields(
            {
              name: await getTS(['PING', 'RESPONSE_TIME'], { E: '⌛' }),
              value: '`' + (bMT - itcTime) + 'ms`',
              inline: true,
            },
            {
              name: await getTS(['PING', 'EDITING_TIME'], { E: '⌚' }),
              value: '`' + (Date.now() - bMT) + 'ms`',
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
      } else if (commandName == 'punish') {
        if (!guild) {
          emb = emb
            .setColor('ff0000')
            .setTitle(await getTS(['GENERIC', 'ERROR']))
            .setDescription(await getTS(['GENERIC', 'NO_DM']));
          return interaction.reply({ embeds: [emb], ephemeral: true });
        }

        emb = emb
          .setTitle(await getTS(['GENERIC', 'WIP']))
          .setDescription(await getTS(['GENERIC', 'WIP_COMMAND']));
        interaction.reply({ embeds: [emb] });
      }
    } else {
      emb = emb.setFooter(
        await getTS(['GENERIC', 'INTERACTED_BY'], {
          USER: user.username,
        }),
        user.avatarURL()
      );
      if (interaction.isButton()) {
      }
    }
  },
};
