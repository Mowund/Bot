const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageSelectMenu,
  Permissions,
  MessageActionRow,
  Util,
  Collection,
  MessageButton,
} = require('discord.js');
const { botOwners } = require('../botdefaults');
const { checkImage } = require('../utils');

module.exports = {
  data: [
    new SlashCommandBuilder()
      .setName('emoji')
      .setDescription('View or manage an emoji.')
      .addStringOption((opt) =>
        opt
          .setName('emoji')
          .setDescription("ID, mention or name (if it's on the same server).")
          .setRequired(true)
      )
      .addBooleanOption((opt) =>
        opt
          .setName('ephemeral')
          .setDescription(
            'Send reply as an ephemeral message. Defaults to true.'
          )
      ),
  ],
  async execute(client, interaction, getTS, emb) {
    var { guild, user, member, message, options } = interaction;
    var emojiO = options?.getString('emoji').match(/^\S*/g).toString();
    var ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (!interaction.inGuild())
      return interaction.reply({
        embeds: [emb({ type: 'error' }).setDescription(getTS(['ERROR', 'DM']))],
        ephemeral: true,
      });

    if (!botOwners.includes(user.id))
      return interaction.reply({
        embeds: [emb({ type: 'wip' })],
        ephemeral: true,
      });

    var emjFR;
    var disEdit = false;
    if (interaction.isCommand()) {
      await interaction.deferReply({ ephemeral: ephemeralO });

      if (guild.emojis.cache.find((q) => q.name == emojiO)) {
        emojiO = guild.emojis.cache.find((q) => q.name == emojiO);
        emojiO = '<:' + emojiO.name + ':' + emojiO.id + '>';
      }

      var emjNID = emojiO.match(/<(a|):.+?:\d+>/g)
        ? emojiO.match(/<(a|):.+?:\d+>/g).toString()
        : '';

      var emjID = emjNID.match(/(?<=:)\d+/g)
        ? emjNID.match(/(?<=:)\d+/g).toString()
        : null;

      var emjName = emjNID.match(/(?<=:).*(?=:)/g)
        ? emjNID.match(/(?<=:).*(?=:)/g).toString()
        : null;

      var onlyID = false;
      if (!emjNID && emojiO.match(/^[0-9]*$/g)) {
        emjID = emojiO;
        onlyID = true;
      }

      emojiO = client.emojis.cache.find((emj) => emj.id == emjID);
      var emjVal = true;
      var emjURL = 'https://cdn.discordapp.com/emojis/' + emjID;
      if (await checkImage(emjURL + '.gif')) {
        emjURL = emjURL + '.gif';
      } else if (!(await checkImage(emjURL))) {
        emjVal = false;
      }

      var emjFN;
      if (!emjVal) {
        emjFN = {
          name: getTS(['EMOJI', 'FIELD_NAME']),
          value: '`' + emjName + '`',
          inline: true,
        };
        return interaction.editReply({
          embeds: [
            emb({ type: 'error' }).setDescription(
              'Não contém um emoji válido.'
            ),
          ],
          ephemeral: true,
        });
      }

      if (emojiO) {
        if (
          !member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS) ||
          emojiO.guild.id != guild.id
        ) {
          disEdit = true;
        }

        emjName = emojiO.name;
        var emjRoles =
          Util.discordSort(emojiO.roles.cache)
            .map((r) => `${r}`)
            .reverse()
            .join(', ') || '@everyone';

        emjFN = {
          name: getTS(['EMOJI', 'FIELD_NAME']),
          value: '`' + emjName + '`',
          inline: true,
        };
        emjFR = {
          name: getTS(['EMOJI', 'FIELD_ROLES']),
          value: emjRoles,
        };
      } else {
        disEdit = true;
      }

      if (emjFN) emb = emb().addFields(emjFN);
      emb = emb
        .setTitle(getTS(['EMOJI', 'VIEW_VIEWING']))
        .addField(getTS(['EMOJI', 'FIELD_ID']), '`' + emjID + '`', true)
        .setThumbnail(emjURL)
        .setColor('00ff00')
        .setTimestamp(Date.now());
      if (emjFR) emb = emb.addFields(emjFR);

      var row = new MessageActionRow();
      if (!ephemeralO)
        row = row.addComponents(
          new MessageButton()
            .setLabel(getTS(['GENERIC', 'COMPONENT_MESSAGE_DELETE']))
            .setEmoji('🧹')
            .setStyle('DANGER')
            .setCustomId('generic_message_delete')
        );
      row.addComponents(
        new MessageButton()
          .setLabel(getTS(['COMPONENT', 'EMOJI', 'EDIT']))
          .setEmoji('📝')
          .setStyle('PRIMARY')
          .setCustomId('emoji_edit')
          .setDisabled(disEdit)
      );

      interaction.editReply({
        embeds: [emb],
        components: [row],
        ephemeral: ephemeralO,
      });
    } else if (interaction.isButton()) {
      var embEID = new URL(message.embeds[0].thumbnail.url).pathname.split(
        /[\/&\.]/
      );
      var embAURL = new URL(message.embeds[0].footer.icon_url).pathname.split(
        /[\/&\.]/
      );

      if (uIF.id != embAURL[2]) {
        return utils.iCP(client, 0, interaction, 0, 1, 0, 1);
      }

      var emjName;
      var emjID;

      var emj = client.emojis.cache.find((emj) => emj.id == embEID[2]);
      var emjFR = [];

      if (emj) {
        if (
          !member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS) ||
          emj.guild.id != guildI.id
        ) {
          disEdit = true;
        }

        emjName = emj.name;
        emjID = emj.id;
        var emjRoles = Util.discordSort(emj.roles.cache)
          .map((r) => `${r}`)
          .reverse()
          .join(', ');
        emjRoles ??= '@everyone';

        emjFN = {
          name: getTS(['EMOJI', 'FIELD_NAME]']),
          value: '`' + emjName + '`',
          inline: true,
        };
        emjFR = {
          name: getTS(['EMOJI', 'FIELD_ROLES']),
          value: emjRoles,
        };
      } else {
        disEdit = true;
      }

      var emb = emb({ interacted: true })
        .setColor('ffff00')
        .setTitle(getTS(['EMOJI', 'EDIT_EDITING']))
        .addFields(
          {
            name: getTS(['EMOJI', 'FIELD_NAME']),
            value: '`' + emjName + '`',
            inline: true,
          },
          {
            name: getTS(['EMOJI', 'FIELD_ID']),
            value: '`' + emjID + '`',
            inline: true,
          },
          emjFR
        )
        .setThumbnail(message.embeds[0].thumbnail.url);

      if (
        !['emoji_view', 'emoji_message_delete'].includes(
          interaction.customId
        ) &&
        !member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS)
      ) {
        var row = new MessageActionRow();
        if (!ephemeralO)
          row = row.addComponents(
            new MessageButton()
              .setLabel(getTS(['GENERIC', 'COMPONENT_MESSAGE_DELETE']))
              .setEmoji('🧹')
              .setStyle('DANGER')
              .setCustomId('generic_message_delete')
          );
        row.addComponents(
          new MessageButton()
            .setLabel(getTS(['COMPONENT', 'EMOJI', 'EDIT']))
            .setEmoji('📝')
            .setStyle('PRIMARY')
            .setCustomId('emoji_edit')
            .setDisabled(disEdit)
        );
        return interaction.update({
          embeds: [
            emb.setTitle(getTS(['EMOJI', 'VIEW_VIEWING'])).setColor('00ff00'),
          ],
          components: [row],
        });
      }

      switch (interaction.customId) {
        case 'emoji_edit': {
          let row = new MessageActionRow().addComponents(
            new MessageButton()
              .setLabel(getTS(['COMPONENT', 'EMOJI', 'VIEW']))
              .setEmoji('🔎')
              .setStyle('PRIMARY')
              .setCustomId('emoji_view')
              .setDisabled(disEdit),
            new MessageButton()
              .setLabel(getTS(['COMPONENT', 'EMOJI', 'EDIT_NAME']))
              .setEmoji('✏️')
              .setStyle('PRIMARY')
              .setCustomId('emoji_edit_name')
              .setDisabled(disEdit),
            new MessageButton()
              .setLabel(getTS(['COMPONENT', 'EMOJI', 'EDIT_ROLES']))
              .setEmoji('📜')
              .setStyle('PRIMARY')
              .setCustomId('emoji_edit_role')
              .setDisabled(disEdit)
          );
          return interaction.update({
            embeds: [
              emb().setTitle('Cargos selecionados').setDescription(roles),
            ],
            components: [row],
          });
          utils.iCP(client, 3, interaction, 0, 0, 0, emb, [
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 1,
                  label: getTS(['COMPONENT', 'EMOJI', 'VIEW']),
                  emoji: {
                    name: '🔎',
                  },
                  custom_id: 'emoji_view',
                },
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 2,
                  label: getTS(['COMPONENT', 'EMOJI', 'EDIT_NAME']),
                  emoji: {
                    name: '✏️',
                  },
                  custom_id: 'emoji_edit_name',
                },
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 2,
                  label: getTS(['COMPONENT', 'EMOJI', 'EDIT_ROLES']),
                  emoji: {
                    name: '📜',
                  },
                  custom_id: 'emoji_edit_role',
                },
              ],
            },
            {
              type: 'SUB_COMMAND',
              components: [
                {
                  type: 'SUB_COMMAND_GROUP',
                  style: 4,
                  label: getTS(['COMPONENT', 'EMOJI', 'EDIT_DELETE']),
                  emoji: {
                    name: '🗑️',
                  },
                  custom_id: 'emoji_edit_delete',
                },
              ],
            },
          ]);
        }

        case 'emoji_view': {
          var row = new MessageActionRow();
          if (!ephemeralO)
            row = row.addComponents(
              new MessageButton()
                .setLabel(getTS(['GENERIC', 'COMPONENT_MESSAGE_DELETE']))
                .setEmoji('🧹')
                .setStyle('DANGER')
                .setCustomId('generic_message_delete')
            );
          row.addComponents(
            new MessageButton()
              .setLabel(getTS(['COMPONENT', 'EMOJI', 'EDIT']))
              .setEmoji('📝')
              .setStyle('PRIMARY')
              .setCustomId('emoji_edit')
              .setDisabled(disEdit)
          );

          return interaction.update({
            embeds: [
              emb.setTitle(getTS(['EMOJI', 'VIEW_VIEWING'])).setColor('00ff00'),
            ],
            components: [row],
          });
        }
      }
    }
  },
};
