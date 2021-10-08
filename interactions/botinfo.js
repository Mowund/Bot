const pack = require('../package.json');
const { toUTS } = require('../utils.js');
const { MessageActionRow, MessageButton } = require('discord.js');
const { botColor, supportServer, botInvite } = require('../botdefaults');
module.exports = {
  data: [
    {
      name: 'botinfo',
      description: "Send bot's information.",
      options: [
        {
          name: 'ephemeral',
          description: 'Send reply as an ephemeral message. Defaults to true.',
          type: 'BOOLEAN',
          required: false,
        },
      ],
    },
  ],
  async execute(client, interaction, getTS, emb) {
    var { guild, options } = interaction;
    var botMember = guild?.members.cache.get(client.user.id) ?? client.user;
    var ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (interaction.isCommand()) {
      await interaction.deferReply({ ephemeral: ephemeralO });

      guildCount = await client.shard.fetchClientValues('guilds.cache.size');
      memberCount = await client.shard.broadcastEval((c) =>
        c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
      );

      emb = emb()
        .setColor(botMember.displayColor ?? botColor)
        .setTitle(getTS(['BOTINFO', 'TITLE']))
        .setThumbnail(client.user.avatarURL())
        .addField(getTS(['BOTINFO', 'NAME_FIELD']), client.user.username, true)
        .addField(getTS(['BOTINFO', 'VERSION_FIELD']), pack.version, true)
        .addField(
          getTS(['BOTINFO', 'CREATION_FIELD']),
          toUTS(client.user.createdAt)
        )
        .addField(
          getTS(['BOTINFO', 'SERVERS_FIELD']),
          getTS(['BOTINFO', 'SERVERS_FIELD_DESC'], {
            stringKeys: {
              SERVERS: guildCount.reduce((acc, count) => acc + count, 0),
            },
          }),
          true
        )
        .addField(
          getTS(['BOTINFO', 'MEMBERS_FIELD']),
          getTS(['BOTINFO', 'MEMBERS_FIELD_DESC'], {
            stringKeys: {
              MEMBERS: memberCount.reduce((acc, count) => acc + count, 0),
            },
          }),
          true
        );
      var row = new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel(getTS(['BOTINFO', 'INVITES_BOT']))
          .setEmoji('📖')
          .setStyle('LINK')
          .setURL(botInvite(client.user.id)),
        new MessageButton()
          .setLabel(getTS(['BOTINFO', 'INVITES_SUPPORT']))
          .setEmoji('📖')
          .setStyle('LINK')
          .setURL(supportServer)
      );
      interaction.editReply({
        embeds: [emb],
        components: [row],
      });
    }
  },
};
