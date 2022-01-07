'use strict';

const { MessageActionRow, MessageButton } = require('discord.js'),
  { botColor, supportServer, imgOpts } = require('../defaults'),
  { toUTS, botInvite } = require('../utils.js');

module.exports = {
  data: [
    {
      name: 'bot',
      description: 'Bot related commands',
      options: [
        {
          name: 'info',
          description: "Send bot's information",
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'ephemeral',
              description: 'Send reply as an ephemeral message (Default: True)',
              type: 'BOOLEAN',
            },
          ],
        },
      ],
    },
  ],
  async execute(client, interaction, st, embed) {
    const { guild, options } = interaction,
      botMember = guild?.members.cache.get(client.user.id),
      ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (interaction.isCommand()) {
      if (options?.getSubcommand() === 'info') {
        await interaction.deferReply({ ephemeral: ephemeralO });

        const emb = embed({ title: st.__('BOT.INFO.TITLE') })
            .setColor(botMember?.displayColor || botColor)
            .setThumbnail(client.user.displayAvatarURL(imgOpts))
            .addField(st.__('BOT.INFO.NAME_FIELD'), client.user.username, true)
            .addField(st.__('BOT.INFO.CREATION_FIELD'), toUTS(client.user.createdAt))
            .addField(
              st.__('BOT.INFO.SERVERS_FIELD'),
              st.__(
                'BOT.INFO.SERVERS_FIELD_DESC',
                (await client.shard.fetchClientValues('guilds.cache.size')).reduce((acc, c) => acc + c, 0),
              ),
              true,
            )
            .addField(
              st.__('BOT.INFO.MEMBERS_FIELD'),
              st.__(
                'BOT.INFO.MEMBERS_FIELD_DESC',
                (
                  await client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0))
                ).reduce((acc, c) => acc + c, 0),
              ),
              true,
            ),
          rows = [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel(st.__('BOT.INFO.INVITES_BOT'))
                .setEmoji('📖')
                .setStyle('LINK')
                .setURL(botInvite(client.user.id)),
              new MessageButton()
                .setLabel(st.__('BOT.INFO.INVITES_SUPPORT'))
                .setEmoji('📖')
                .setStyle('LINK')
                .setURL(supportServer),
            ),
          ];

        if (!ephemeralO) {
          rows.push(
            new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                .setEmoji('🧹')
                .setStyle('DANGER')
                .setCustomId('generic_message_delete'),
            ),
          );
        }

        return interaction.editReply({
          components: rows,
          embeds: [emb],
        });
      }
    }
  },
};
