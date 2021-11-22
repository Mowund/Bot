'use strict';

module.exports = {
  data: [
    {
      name: 'kill',
      description: 'Kills someone.',
      options: [
        {
          name: 'user',
          description: 'An user to kill.',
          type: 'USER',
        },
        {
          name: 'ephemeral',
          description: 'Send reply as an ephemeral message. (Default: True)',
          type: 'BOOLEAN',
        },
      ],
    },
  ],
  execute(client, interaction, st, embed) {
    const { user, options } = interaction,
      userO = options?.getUser('user') ?? user,
      ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (interaction.isCommand()) {
      return interaction.reply({
        embeds: [
          embed().setColor('ff0000').setAuthor(userO.username, userO.avatarURL()).setDescription(st.__('KILL.DIED')),
        ],
        ephemeral: ephemeralO,
      });
    }
  },
};
