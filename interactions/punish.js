'use strict';

const { MessageActionRow, MessageButton, MessageFlags } = require('discord.js');
module.exports = {
  data: [
    {
      name: 'punish',
      description: 'Punish or unpunish a member. (Bot owner only)',
      options: [
        {
          name: 'add',
          description: 'Punishes a member. (Bot owner only)',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'type',
              description: 'Punishment type.',
              type: 'STRING',
              choices: [
                {
                  name: 'Warn',
                  value: 'warn',
                },
                {
                  name: 'Strike',
                  value: 'strike',
                },
                {
                  name: 'Ban',
                  value: 'ban',
                },
              ],
              required: true,
            },
            {
              name: 'user',
              description: 'Member that will be punished.',
              type: 'USER',
              required: true,
            },
            {
              name: 'ephemeral',
              description: 'Send reply as an ephemeral message. (Default: True)',
              type: 'BOOLEAN',
            },
          ],
        },
        {
          name: 'remove',
          description: 'Unpunishes a member. (Bot owner only)',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user',
              description: 'Member that will be unpunished.',
              type: 'USER',
              required: true,
            },
            {
              name: 'ephemeral',
              description: 'Send reply as an ephemeral message. (Default: True)',
              type: 'BOOLEAN',
            },
          ],
        },
      ],
    },
  ],
  guildOnly: ['420007989261500418'],
  async execute(client, interaction, st, emb) {
    const { message, options } = interaction,
      ephemeralO = options?.getBoolean('ephemeral') ?? true,
      mdBtn = new MessageButton()
        .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
        .setEmoji('🧹')
        .setStyle('DANGER')
        .setCustomId('generic_message_delete');

    if (interaction.isCommand()) {
      await interaction.deferReply({ ephemeral: ephemeralO });
      if (!interaction.inGuild()) {
        return interaction.editReply({
          embeds: [emb({ type: 'error' }).setDescription(st.__('ERROR.DM'))],
          ephemeral: ephemeralO,
        });
      }

      if (['add', 'remove'].includes(options?.getSubcommand())) {
        const rows = [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setLabel(st.__('GENERIC.WIP'))
              .setEmoji('🔨')
              .setStyle('DANGER')
              .setCustomId('punish_danger'),
          ),
        ];
        if (!ephemeralO) {
          rows[0].addComponents(mdBtn);
        }

        return interaction.editReply({
          embeds: [emb({ type: 'wip' })],
          ephemeral: ephemeralO,
          components: rows,
        });
      }
    } else if (interaction.isButton()) {
      if (interaction.customId === 'punish_danger') {
        return interaction.update({
          components: !message.flags.has(MessageFlags.FLAGS.EPHEMERAL)
            ? [new MessageActionRow().addComponents(mdBtn)]
            : [],
        });
      }
    }
  },
};
