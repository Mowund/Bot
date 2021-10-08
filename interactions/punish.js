const { MessageActionRow, MessageButton } = require('discord.js');
const { iCP } = require('../utils');
module.exports = {
  data: [
    {
      name: 'punish',
      description: 'Punish or unpunish a member.',
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
              description:
                'Send reply as an ephemeral message. Defaults to true.',
              type: 'BOOLEAN',
              required: false,
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
              description:
                'Send reply as an ephemeral message. Defaults to true.',
              type: 'BOOLEAN',
              required: false,
            },
          ],
        },
      ],
    },
  ],
  guildOnly: '420007989261500418',
  async execute(client, interaction, getTS, emb) {
    var { user, options } = interaction;
    var userO = options?.getUser('user') ?? user;
    var ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (interaction.isCommand()) {
      if (!interaction.inGuild())
        return interaction.reply({
          embeds: [
            emb({ type: 'error' }).setDescription(getTS(['ERROR', 'DM'])),
          ],
          ephemeral: true,
        });

      if (options?.getSubcommand() === 'add') {
        var row = new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel(getTS(['GENERIC', 'WIP']))
            .setEmoji('🔨')
            .setStyle('DANGER')
            .setCustomId('punish_danger')
        );

        interaction.reply({
          embeds: [emb({ type: 'wip' })],
          ephemeral: ephemeralO,
          components: [row],
        });
      } else if (options?.getSubcommand() === 'remove') {
        var row = new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel(getTS(['GENERIC', 'WIP']))
            .setEmoji('⛏️')
            .setStyle('DANGER')
            .setCustomId('punish_danger')
        );

        interaction.reply({
          embeds: [emb({ type: 'wip' })],
          ephemeral: ephemeralO,
          components: [row],
        });
      }
    } else if (interaction.isButton()) {
      if (interaction.customId === 'punish_danger') {
        interaction.update({
          components: [],
        });
      }
    }
  },
};
