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
    var { user, options } = interaction;
    var userO = options?.getUser('user') ?? user;
    var ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (interaction.isCommand()) {
      emb = emb()
        .setColor('ff0000')
        .setAuthor(userO.username, userO.avatarURL()())
        .setDescription(getTS(['KILL', 'DIED']));
      interaction.reply({ embeds: [emb], ephemeral: ephemeralO });
    }
  },
};
