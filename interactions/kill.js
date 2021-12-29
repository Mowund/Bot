'use strict';

const { MessageActionRow, MessageButton } = require('discord.js'),
  { imgOpts } = require('../defaults');

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
    const { user, member, options } = interaction,
      userO = options?.getUser('user') ?? user,
      memberO = options?.getMember('user') ?? member,
      ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (interaction.isCommand()) {
      return interaction.reply({
        components: !ephemeralO
          ? [
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                  .setEmoji('🧹')
                  .setStyle('DANGER')
                  .setCustomId('generic_message_delete'),
              ),
            ]
          : [],
        embeds: [
          embed()
            .setColor('ff0000')
            .setAuthor({
              name: memberO?.displayName ?? userO.username,
              iconURL: (memberO ?? userO).displayAvatarURL(imgOpts),
            })
            .setDescription(st.__('KILL.DIED')),
        ],
        ephemeral: ephemeralO,
      });
    }
  },
};
