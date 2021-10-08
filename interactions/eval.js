const { botOwners } = require('../botdefaults');

module.exports = {
  data: [
    {
      name: 'eval',
      description: 'Return a result of a code (Bot owner only).',
      options: [
        {
          name: 'code',
          description: 'The code to execute.',
          type: 'STRING',
          required: true,
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
    if (!botOwners.includes(user.id))
      return interaction.reply(
        emb.error.setDescription(
          'Somente o dono do bot pode usar esse comando.'
        )
      );

    var code = options?.getString('code');
    var ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (interaction.isCommand()) {
      await interaction.deferReply({ ephemeral: ephemeralO });

      try {
        let evaled = eval(code);

        if (typeof evaled != 'string')
          evaled = require('node:util').inspect(evaled);

        emb = emb({ type: 'success' }).setDescription(
          '```js\n' + evaled + '```'
        );

        interaction.editReply({ embeds: [emb] });
      } catch (err) {
        emb = emb({ type: 'error' }).setDescription('```js\n' + err + '```');
        interaction.editReply({ embeds: [emb] });
      }
    }
  },
};
