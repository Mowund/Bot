'use strict';

const { Permissions, MessageActionRow, Util, MessageButton, MessageFlags } = require('discord.js'),
  { botOwners } = require('../defaults'),
  { checkImage, collMap } = require('../utils');

module.exports = {
  data: [
    {
      name: 'emoji',
      description: 'View or manage an emoji.',
      options: [
        {
          name: 'emoji',
          description: "ID, mention or name (if it's on the same server).",
          type: 'STRING',
          required: true,
        },
        {
          name: 'globalsearch',
          description:
            'Search for an emoji through all cached guilds, significantly decreasing speed. (Default: False)',
          type: 'BOOLEAN',
        },
        {
          name: 'ephemeral',
          description: 'Send reply as an ephemeral message. (Default: True)',
          type: 'BOOLEAN',
        },
      ],
    },
  ],
  async execute(client, interaction, st, embed) {
    const { guild, user, memberPermissions, message, options } = interaction,
      emojiO = options?.getString('emoji').match(/^.+?(?=[\s<]|(?<=[\s>])|$)/gm)?.[0],
      ephemeralO = options?.getBoolean('ephemeral') ?? true;

    let { customId } = interaction,
      emjFR,
      disAdd = false,
      disEdit = false;

    if (interaction.isCommand()) {
      if (!emojiO) {
        return interaction.reply({
          embeds: [embed({ type: 'error' }).setDescription('Emoji não definido.')],
          ephemeral: true,
        });
      }
      await interaction.deferReply({ ephemeral: ephemeralO });

      let emjID = emojiO?.match(/^\d+$/g)?.[0] || emojiO?.match(/(?<=:)\d+(?=>)/g)?.[0],
        emjName = emojiO?.match(/(?<=:).+(?=:)/g)?.[0];

      const emj =
        client.emojis.cache.find(({ id }) => id === emjID) ||
        guild?.emojis.cache.find(({ name }) => name === emojiO) ||
        guild?.emojis.cache.find(({ name }) => name.toLowerCase() === emojiO.toLowerCase());

      if (emj) {
        if (emj?.guild.id !== guild?.id) disEdit = true;
        if (!memberPermissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
          disAdd = true;
          disEdit = true;
        }
        const emjRoles = collMap(emj.roles.cache, emj?.guild.id !== guild?.id ? { mapId: 'id' } : {}) || '@everyone';

        emjID = emj.id;
        emjName = emj.name;
        emjFR = {
          name: st.__('EMOJI.FIELD_ROLES'),
          value: emjRoles,
        };
      } else {
        disEdit = true;
      }
      let emjURL = `https://cdn.discordapp.com/emojis/${emjID}`;
      if (await checkImage(`${emjURL}.gif`)) {
        emjURL += '.gif';
      } else if (!(await checkImage(emjURL))) {
        return interaction.editReply({
          embeds: [embed({ type: 'error' }).setDescription('Não contém um emoji válido.')],
          ephemeral: true,
        });
      } else {
        emjURL += '.png?size=4096';
      }

      let emb = emjName ? embed().addField(st.__('EMOJI.FIELD_NAME'), `\`${emjName}\``, true) : embed();
      emb = emb
        .setTitle(st.__('EMOJI.VIEW_VIEWING'))
        .addField(st.__('EMOJI.FIELD_ID'), `\`${emjID}\``, true)
        .setThumbnail(emjURL)
        .setColor('00ff00')
        .setTimestamp(Date.now());
      if (emjFR) emb = emb.addFields(emjFR);

      const row = !ephemeralO || interaction.inGuild() ? new MessageActionRow() : undefined;
      if (!ephemeralO) {
        row.addComponents(
          new MessageButton()
            .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
            .setEmoji('🧹')
            .setStyle('DANGER')
            .setCustomId('generic_message_delete'),
        );
      }
      if (interaction.inGuild()) {
        if (emj?.guild.id !== guild?.id) {
          row.addComponents(
            new MessageButton()
              .setLabel(st.__('EMOJI.COMPONENT.EDIT_ADD'))
              .setEmoji('➕')
              .setStyle('SUCCESS')
              .setCustomId('emoji_edit_add')
              .setDisabled(disAdd),
          );
        }
        row.addComponents(
          new MessageButton()
            .setLabel(st.__('EMOJI.COMPONENT.EDIT'))
            .setEmoji('📝')
            .setStyle('PRIMARY')
            .setCustomId('emoji_edit')
            .setDisabled(disEdit),
        );
      }

      const opts = {
        embeds: [emb],
        ephemeral: ephemeralO,
      };
      if (row) opts.components = [row];
      return interaction.editReply(opts);
    }
    if (interaction.isButton()) {
      if (user.id !== message.interaction.user.id) {
        return interaction.reply({
          embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.UNALLOWED.COMMAND'))],
          ephemeral: true,
        });
      }

      if (!memberPermissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
        customId = 'emoji_noperm';
        disEdit = true;
      }

      let emjID = new URL(message.embeds[0].thumbnail.url).pathname.split(/[/&.]/)[2],
        emj = client.emojis.cache.find(e => e.id === emjID),
        emjName;

      if (message.embeds[0].fields[0].name === st.__('EMOJI.FIELD_NAME')) {
        emjName = message.embeds[0].fields[0].value.replaceAll('`', '');
      }

      if (emj) {
        emjName = emj.name;
        emjID = emj.id;

        let emjRoles = Util.discordSort(emj.roles.cache);
        emjRoles =
          (emj?.guild.id === guild?.id ? emjRoles.map(r => `${r}`) : emjRoles.map(r => `\`${r.id}\``))
            .reverse()
            .join(', ') || '@everyone';

        emjFR = {
          name: st.__('EMOJI.FIELD_ROLES'),
          value: emjRoles,
        };
      } else {
        disEdit = true;
      }

      let emb = emjName
        ? embed({ interacted: true }).addField(st.__('EMOJI.FIELD_NAME'), `\`${emjName}\``, true)
        : embed({ interacted: true });
      emb = emb
        .setColor('ffff00')
        .setTitle(st.__('EMOJI.EDIT_EDITING'))
        .addField(st.__('EMOJI.FIELD_ID'), `\`${emjID}\``, true)
        .setThumbnail(message.embeds[0].thumbnail.url)
        .setTimestamp(Date.now());
      if (emjFR) emb = emb.addFields(emjFR);

      switch (customId) {
        case 'emoji_edit_add':
        case 'emoji_edit_readd':
        case 'emoji_edit': {
          if (['emoji_edit_add', 'emoji_edit_readd'].includes(customId)) {
            emj = await guild?.emojis.create(message.embeds[0].thumbnail.url, emjName || emjID);

            if (!emb.fields[1]) {
              emb.fields[0] = {
                name: st.__('EMOJI.FIELD_NAME'),
                value: `\`${emj.name}\``,
                inline: true,
              };
            }
            emb.fields[1] = {
              name: st.__('EMOJI.FIELD_ID'),
              value: `\`${emj.id}\``,
              inline: true,
            };
            emb.fields[2] = {
              name: st.__('EMOJI.FIELD_ROLES'),
              value: '@everyone',
            };
            emb
              .setColor('00ff00')
              .setThumbnail(emj.url)
              .setTitle(st.__(`EMOJI.${customId === 'emoji_edit_add' ? 'EDIT_ADDED' : 'EDIT_READDED'}`));
          }
          return interaction.update({
            embeds: [emb],
            components: [
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setLabel(st.__('EMOJI.COMPONENT.VIEW'))
                  .setEmoji('🔎')
                  .setStyle('PRIMARY')
                  .setCustomId('emoji_view'),
                new MessageButton()
                  .setLabel(st.__('EMOJI.COMPONENT.EDIT_NAME'))
                  .setEmoji('✏️')
                  .setStyle('SECONDARY')
                  .setCustomId('emoji_edit_name'),
                new MessageButton()
                  .setLabel(st.__('EMOJI.COMPONENT.EDIT_ROLES'))
                  .setEmoji('📜')
                  .setStyle('SECONDARY')
                  .setCustomId('emoji_edit_role'),
              ),
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setLabel(st.__('EMOJI.COMPONENT.EDIT_DELETE'))
                  .setEmoji('🗑️')
                  .setStyle('DANGER')
                  .setCustomId('emoji_edit_delete'),
              ),
            ],
          });
        }
        case 'emoji_noperm':
        case 'emoji_view': {
          const row = new MessageActionRow();
          if (!message.flags.has(MessageFlags.FLAGS.EPHEMERAL)) {
            row.addComponents(
              new MessageButton()
                .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                .setEmoji('🧹')
                .setStyle('DANGER')
                .setCustomId('generic_message_delete'),
            );
          }
          row.addComponents(
            new MessageButton()
              .setLabel(st.__('EMOJI.COMPONENT.EDIT'))
              .setEmoji('📝')
              .setStyle('PRIMARY')
              .setCustomId('emoji_edit')
              .setDisabled(disEdit),
          );

          interaction.update({
            embeds: [emb.setTitle(st.__('EMOJI.VIEW_VIEWING')).setColor('00ff00')],
            components: [row],
          });
          if (customId === 'emoji_noperm') {
            interaction.followUp({
              embeds: [
                embed({ type: 'warning' }).setDescription(
                  st.__('PERM.NO_LONGER', st.__('PERM.MANAGE_EMOJIS_AND_STICKERS')),
                ),
              ],
              ephemeral: true,
            });
          }
          return;
        }
        case 'emoji_edit_delete': {
          return interaction.update({
            embeds: [
              emb
                .setTitle(st.__('EMOJI.EDIT_DELETING'))
                .setDescription(st.__('EMOJI.EDIT_DELETING_DESC'))
                .setColor('ff8000'),
            ],
            components: [
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setLabel(st.__('GENERIC.COMPONENT.BACK'))
                  .setEmoji('↩️')
                  .setStyle('PRIMARY')
                  .setCustomId('emoji_edit'),
                new MessageButton()
                  .setLabel(st.__('EMOJI.COMPONENT.EDIT_DELETE_CONFIRM'))
                  .setEmoji('✅')
                  .setStyle('SUCCESS')
                  .setCustomId('emoji_edit_delete_confirm'),
              ),
            ],
          });
        }
        case 'emoji_edit_delete_confirm': {
          await emj.delete();
          const row = new MessageActionRow();
          if (!message.flags.has(MessageFlags.FLAGS.EPHEMERAL)) {
            row.addComponents(
              new MessageButton()
                .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                .setEmoji('🧹')
                .setStyle('DANGER')
                .setCustomId('generic_message_delete'),
            );
          }
          row.addComponents(
            new MessageButton()
              .setLabel(st.__('EMOJI.COMPONENT.EDIT_READD'))
              .setEmoji('➕')
              .setStyle('SUCCESS')
              .setCustomId('emoji_edit_readd'),
          );

          return interaction.update({
            embeds: [emb.setTitle(st.__('EMOJI.EDIT_DELETED')).setColor('ff0000')],
            components: [row],
          });
        }
        // TODO: Add edit roles and rename emoji
        case 'emoji_edit_name':
        case 'emoji_edit_role': {
          if (!botOwners.includes(user.id)) {
            return interaction.reply({
              embeds: [embed({ type: 'wip' }).setDescription(st.__('GENERIC.WIP_FUNCTION'))],
              ephemeral: true,
            });
          }
        }
      }
    }
  },
};
