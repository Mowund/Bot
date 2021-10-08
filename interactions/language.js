const { Permissions } = require('discord.js');
const db = require('../database');

module.exports = {
  data: [
    {
      name: 'language',
      description: "Change server's language.",
      options: [
        {
          name: 'language',
          description: 'The language to change.',
          type: 'STRING',
          choices: [
            {
              name: 'English (United States)',
              value: 'en-US',
            },
            {
              name: 'Portuguese (Brazil)',
              value: 'pt-BR',
            },
            {
              name: 'Spanish (Spain)',
              value: 'es-ES',
            },
          ],
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
  async execute(client, interaction, getTS, emb) {
    var { guild, user, member, options } = interaction;

    var languageO = options?.getString('language');
    var ephemeralO = options?.getBoolean('ephemeral') ?? true;

    var language = getTS(null, { returnLanguage: true });

    await interaction.deferReply({ ephemeral: ephemeralO });

    if (interaction.isCommand()) {
      if (!interaction.inGuild())
        return interaction.reply({
          embeds: [
            emb({ type: 'error' }).setDescription(getTS(['ERROR', 'DM'])),
          ],
          ephemeral: ephemeralO,
        });

      if (languageO) {
        if (!member.permissions.has(Permissions.FLAGS.MANAGE_GUILD))
          return interaction.editReply({
            embeds: [
              emb({
                error: getTS(['PERMS', 'REQUIRES'], {
                  PERM: getTS(['PERMS', 'MANAGE_GUILD']),
                }),
              }),
            ],
          });

        language = await db.setLanguage(guild.id, languageO);
        function getTS(message, options) {
          return db.getString(language, message, options);
        }

        var emb = emb()
          .setColor('00ff00')
          .setTitle(getTS(['LANGUAGE', 'CHANGED']))
          .setDescription(
            getTS(['LANGUAGE', 'CHANGED_TO'], {
              stringKeys: { LANG: languageO },
            })
          )
          .setFooter(
            getTS(['GENERIC', 'REQUESTED_BY'], {
              stringKeys: { USER: user.username },
            }),
            member?.avatarURL() ?? user.avatarURL()
          );
        interaction.editReply({
          embeds: [emb],
          ephemeral: ephemeralO,
        });
      } else {
        var emb = emb()
          .setColor('00ff00')
          .setTitle(getTS(['LANGUAGE', 'CURRENT']))
          .setDescription(
            getTS(['LANGUAGE', 'CURRENT_IS'], {
              stringKeys: { LANG: language },
            })
          );
        interaction.editReply({
          embeds: [emb],
          ephemeral: ephemeralO,
        });
      }
    }
  },
};
