const { UserFlags, Util, Permissions } = require('discord.js');
const { flagEmoji, emojis, botColor } = require('../botdefaults');
const { toUTS } = require('../utils');

module.exports = {
  data: [
    {
      type: 'USER',
      name: 'User Info',
    },
    {
      name: 'userinfo',
      description: 'Get information about a user.',
      options: [
        {
          name: 'user',
          description: 'The user to get information from.',
          type: 'USER',
          required: false,
        },
        {
          name: 'ephemeral',
          description: 'Send reply as an ephemeral message. Defaults to true.',
          type: 'BOOLEAN',
          required: false,
        },
      ],
    },
  ],
  async execute(client, interaction, getTS, embed) {
    var { guild, user, options } = interaction;
    var userO = options?.getUser('user') ?? user;
    var memberO = guild?.members.cache.get(userO.id) ?? userO;
    var ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (interaction.isCommand() || interaction.isContextMenu()) {
      await interaction.deferReply({ ephemeral: ephemeralO });

      var fUser = await userO.fetch();
      var flags =
        userO.bot && !userO.flags.has(UserFlags.FLAGS.VERIFIED_BOT)
          ? [emojis.bot]
          : [];
      for (flag of userO.flags.toArray()) {
        flags.push(flagEmoji(flag));
      }

      emb = embed()
        .setColor(memberO?.displayColor ?? fUser.accentColor ?? botColor)
        .setAuthor(userO.tag, userO.avatarURL())
        .setThumbnail(
          memberO?.avatarURL({ format: 'png' }) ??
            userO.avatarURL({ format: 'png' })
        )
        .setImage(fUser.bannerURL({ format: 'png', size: 1024, dynamic: true }))
        .setTitle('User Info')
        .setDescription(`${userO} ` + flags.join(' '))
        .addField('User ID', userO.id, true)
        .addField('Account Created', toUTS(userO.createdTimestamp, 'R'), true);

      if (interaction.inGuild()) {
        emb
          .addField('Joined Server', toUTS(memberO.joinedTimestamp, 'R'), true)
          .addField(
            'Roles',
            Util.discordSort(memberO.roles.cache)
              .map((r) => `${r}`)
              .reverse()
              .join(', ') || '@everyone'
          );
      }

      await interaction.editReply({
        embeds: [emb],
      });
      if (
        interaction.inGuild() &&
        !guild?.roles.everyone.permissions.has(
          Permissions.FLAGS.USE_EXTERNAL_EMOJIS
        )
      )
        interaction.followUp({
          embeds: [
            embed({ type: 'warn' }).setDescription(
              getTS(['PERM', 'ROLE_REQUIRES'], {
                stringKeys: {
                  ROLE: '@everyone',
                  PERM: getTS(['PERM', 'USE_EXTERNAL_EMOJIS']),
                },
              })
            ),
          ],
          ephemeral: true,
        });
    }
  },
};
