'use strict';

const {
    Permissions,
    MessageActionRow,
    MessageButton,
    MessageFlags,
    Modal,
    ModalInputText,
    SnowflakeUtil,
  } = require('discord.js'),
  twemoji = require('twemoji'),
  { botOwners } = require('../defaults'),
  { checkImage, collMap, toUTS, getFieldValue } = require('../utils');

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
          name: 'ephemeral',
          description: 'Send reply as an ephemeral message. (Default: True)',
          type: 'BOOLEAN',
        },
      ],
    },
  ],
  async execute(client, interaction, st, embed) {
    const { guild, user, memberPermissions, message, options } = interaction,
      emojiO = options?.getString('emoji').match(/^.+?(?=[\s<]|(?<=[\s>]|\p{Emoji_Presentation}{3})|$)/gu)?.[0],
      ephemeralO = options?.getBoolean('ephemeral') ?? message?.flags.has(MessageFlags.FLAGS.EPHEMERAL) ?? true,
      mdBtn = new MessageButton()
        .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
        .setEmoji('🧹')
        .setStyle('DANGER')
        .setCustomId('generic_message_delete');

    let { customId } = interaction,
      emjFR,
      addBtnVsby = 0,
      editBtnVsby = 2;

    if (interaction.isCommand()) {
      await interaction.deferReply({ ephemeral: ephemeralO });

      let emjId = emojiO.match(/^\d+$/g)?.[0] || emojiO.match(/(?<=:)\d+(?=>)/g)?.[0],
        emjName = emojiO.match(/(?<=:).+(?=:)/g)?.[0];

      const emj =
          guild?.emojis.cache.get(emjId) ||
          guild?.emojis.cache.find(({ name }) => name === emojiO) ||
          guild?.emojis.cache.find(({ name }) => name.toLowerCase() === emojiO.toLowerCase()) ||
          (await client.shard
            .broadcastEval(
              (c, { d, g }) => {
                const cM = w => {
                    const y = require('discord.js')
                      .Util.discordSort(w)
                      .map(x => (bE.guild.id !== g?.id ? `\`${x.id}\`` : `${x}`))
                      .reverse();
                    let z = y;
                    if (z.length > 40) {
                      (z = z.slice(0, 40)).push(`\`+${y.length - z.length}\``);
                    }

                    return z.join(', ');
                  },
                  bE = c.emojis.cache.get(d);

                return bE ? [bE, bE.guild, cM(bE.roles.cache), bE.roles.cache.size] : false;
              },
              {
                context: {
                  d: emjId,
                  g: guild,
                },
              },
            )
            .then(eA => eA.find(e => e))),
        emjCodePoint = r => twemoji.convert.toCodePoint(r ? emojiO.replaceAll(/\uFE0F/g, '') : emojiO),
        emjUnicodeURL = `https://twemoji.maxcdn.com/v/latest/72x72/`;

      if (emj) {
        const emjRoles =
          (emj[2] ?? collMap(emj.roles.cache, emj.guild?.id !== guild?.id ? { mapValue: 'id' } : {})) || '@everyone';

        emjId = (emj[0] ?? emj).id;
        emjName = (emj[0] ?? emj).name;
        emjFR = {
          name: `${st.__('GENERIC.ROLES')} [${emj[3] ?? emj.roles?.cache.size}]`,
          value: emjRoles,
        };
      }

      if ((emj?.guild || emj?.[1])?.id !== guild?.id) {
        addBtnVsby = 2;
        editBtnVsby = 0;
      }

      if (!memberPermissions?.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
        addBtnVsby = editBtnVsby = 0;
      }

      let displayEmj =
          (!interaction.inGuild() || guild?.roles.everyone.permissions.has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS)) &&
          emj
            ? (emj[0] ?? emj).animated
              ? `<${(emj[0] ?? emj).identifier}> `
              : `<:${(emj[0] ?? emj).identifier}> `
            : '',
        emjURL = `https://cdn.discordapp.com/emojis/${emjId}`,
        emjIsUnicode = false;

      const checkedImage = (await checkImage(`${emjURL}.gif`))
        ? 1
        : (await checkImage(`${emjUnicodeURL}${emjCodePoint()}.png`))
        ? 2
        : (await checkImage(`${emjUnicodeURL}${emjCodePoint(true)}.png`))
        ? 3
        : (await checkImage(emjURL))
        ? 4
        : 0;

      switch (checkedImage) {
        case 1:
          emjURL += '.gif';
          break;
        case 2:
        case 3:
          emjURL = `${emjUnicodeURL}${emjCodePoint(checkedImage === 3)}.png`;
          emjIsUnicode = true;
          displayEmj = `${emojiO} `;
          break;
        case 0:
          return interaction.editReply({
            components: !ephemeralO ? [new MessageActionRow().addComponents(mdBtn)] : [],
            embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.EMOJI.NOT_FOUND', emojiO))],
          });
        default: {
          emjURL += '.png?size=4096';
        }
      }

      const emb = embed();
      if (emjName) emb.addField(st.__('GENERIC.NAME'), `\`${emjName}\``, true);

      emb
        .setTitle(`${displayEmj}${st.__(`EMOJI.${emjIsUnicode ? 'VIEWING_UNICODE' : 'VIEWING'}`)}`)
        .addField(
          st.__(`GENERIC.${emjIsUnicode ? 'CODEPOINT' : 'ID'}`),
          `\`${emjIsUnicode ? emjCodePoint() : emjId}\``,
          true,
        )
        .setThumbnail(emjURL)
        .setColor('00ff00')
        .setTimestamp(Date.now());

      if (emjIsUnicode || (emjName && emjId)) {
        emb.addField(
          st.__('GENERIC.MENTION'),
          `\`${emjIsUnicode ? emojiO : `<${checkedImage === 1 ? 'a' : ''}:${emjName}:${emjId}>`}\``,
          true,
        );
      }
      if (!emjIsUnicode) {
        emb.addField(st.__('GENERIC.CREATION_DATE'), toUTS(SnowflakeUtil.deconstruct(emjId).timestamp), true);
      }
      if (emjFR) emb.addFields(emjFR);

      const rows = [new MessageActionRow()];
      rows[0].addComponents(
        new MessageButton()
          .setLabel(st.__('EMOJI.COMPONENT.LINK'))
          .setEmoji('🖼️')
          .setStyle('LINK')
          .setURL(emjIsUnicode ? emjURL : `${emjURL.split('?')[0]}?size=4096`),
      );

      if (addBtnVsby > 0) {
        rows[0].addComponents(
          new MessageButton()
            .setLabel(st.__('EMOJI.COMPONENT.ADD'))
            .setEmoji('➕')
            .setStyle('SUCCESS')
            .setCustomId('emoji_edit_add')
            .setDisabled(addBtnVsby < 2),
        );
      }
      if (editBtnVsby > 0) {
        rows[0].addComponents(
          new MessageButton()
            .setLabel(st.__('EMOJI.COMPONENT.EDIT'))
            .setEmoji('📝')
            .setStyle('PRIMARY')
            .setCustomId('emoji_edit')
            .setDisabled(editBtnVsby < 2),
        );
      }

      if (!ephemeralO) {
        if (rows[0].components.length > 1) {
          rows.push(new MessageActionRow().addComponents(mdBtn));
        } else {
          rows[0].addComponents(mdBtn);
        }
      }

      return interaction.editReply({
        components: rows,
        embeds: [emb],
        ephemeral: ephemeralO,
      });
    }
    if (interaction.isButton()) {
      if (message.interaction.user.id !== user.id) {
        return interaction.reply({
          embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.UNALLOWED.COMMAND'))],
          ephemeral: true,
        });
      }
      const emjURL = message.embeds[0].thumbnail.url,
        emjCodePoint = getFieldValue(message?.embeds[0], st.__('GENERIC.CODEPOINT'))?.replaceAll('`', '');

      let emjId = new URL(emjURL).pathname.split(/[/&.]/)[2],
        emj = guild?.emojis.cache.get(emjId),
        emjMention = getFieldValue(message?.embeds[0], st.__('GENERIC.MENTION')),
        emjName = getFieldValue(message?.embeds[0], st.__('GENERIC.NAME'))?.replaceAll('`', ''),
        emjRoles = getFieldValue(message?.embeds[0], st.__('GENERIC.ROLES'));

      const displayEmj =
        emj && guild?.roles.everyone.permissions.has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS) ? `${emj} ` : '';

      if (emj) {
        emjRoles = collMap(emj.roles.cache, emj.guild?.id !== guild?.id ? { mapValue: 'id' } : {}) || '@everyone';
        emjMention = `\`${emj}\``;
        emjName = emj.name;
        emjId = emj.id;
        emjFR = {
          name: `${st.__('GENERIC.ROLES')} [${emj.roles.cache.size}]`,
          value: emjRoles,
        };
      } else if (!emjCodePoint) {
        if (!['emoji_edit_add', 'emoji_edit_readd'].includes(customId)) customId = 'emoji_nonexistent';
        addBtnVsby = 2;
        editBtnVsby = 1;
      }

      if (!memberPermissions?.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
        customId = 'emoji_noperm';
        addBtnVsby = emj ? 0 : 1;
        editBtnVsby = 1;
      }

      const emb = embed({ interacted: true });
      if (emjName) emb.addField(st.__('GENERIC.NAME'), `\`${emjName}\``, true);

      emb
        .setColor('ffff00')
        .setTitle(`${displayEmj}${st.__('EMOJI.EDITING')}`)
        .addField(st.__('GENERIC.ID'), `\`${emjId}\``, true)
        .setThumbnail(emjURL)
        .setTimestamp(Date.now());

      if (emjMention) emb.addField(st.__('GENERIC.MENTION'), emjMention, true);
      if (!emjCodePoint) {
        emb.addField(st.__('GENERIC.CREATION_DATE'), toUTS(SnowflakeUtil.deconstruct(emjId).timestamp), true);
      }
      if (emjFR) emb.addFields(emjFR);

      switch (customId) {
        case 'emoji_edit_add':
        case 'emoji_edit_readd':
        case 'emoji_edit': {
          if (['emoji_edit_add', 'emoji_edit_readd'].includes(customId)) {
            emj = await guild?.emojis.create(
              emjURL,
              emjCodePoint?.substring(0, 32).replaceAll('-', '_') || emjName || emjId,
              {
                reason: `${user.tag} | ${st.__(
                  `EMOJI.REASON.CREATED.${
                    customId === 'emoji_edit_add'
                      ? emjCodePoint
                        ? 'UNICODE'
                        : emjRoles && emj?.guild !== guild.id
                        ? 'ANOTHER_SERVER'
                        : 'CDN'
                      : 'DELETED'
                  }`,
                )}`,
              },
            );

            emb
              .setColor('00ff00')
              .setThumbnail(emj.url)
              .setTitle(
                `${emj} ${st.__(
                  `EMOJI.${customId === 'emoji_edit_add' ? (emjCodePoint ? 'ADDED_UNICODE' : 'ADDED') : 'READDED'}`,
                )}`,
              )
              .setFields([
                {
                  name: st.__('GENERIC.NAME'),
                  value: `\`${emj.name}\``,
                  inline: true,
                },
                {
                  name: st.__('GENERIC.ID'),
                  value: `\`${emj.id}\``,
                  inline: true,
                },
                {
                  name: st.__('GENERIC.MENTION'),
                  value: `\`${emj}\``,
                  inline: true,
                },
                {
                  name: st.__('GENERIC.CREATION_DATE'),
                  value: toUTS(emj.createdTimestamp),
                  inline: true,
                },
                {
                  name: `${st.__('GENERIC.ROLES')} [0]`,
                  value: '@everyone',
                },
              ]);
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
                  .setLabel(st.__('EMOJI.COMPONENT.RENAME'))
                  .setEmoji('✏️')
                  .setStyle('SECONDARY')
                  .setCustomId('emoji_edit_name'),
                new MessageButton()
                  .setLabel(st.__('EMOJI.COMPONENT.ROLES.EDIT'))
                  .setEmoji('📜')
                  .setStyle('SECONDARY')
                  .setCustomId('emoji_edit_role'),
              ),
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setLabel(st.__('EMOJI.COMPONENT.DELETE'))
                  .setEmoji('🗑️')
                  .setStyle('DANGER')
                  .setCustomId('emoji_edit_delete'),
              ),
            ],
          });
        }
        case 'emoji_nonexistent':
        case 'emoji_noperm':
        case 'emoji_view': {
          const rows = [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel(st.__('EMOJI.COMPONENT.LINK'))
                .setEmoji('🖼️')
                .setStyle('LINK')
                .setURL(`${emjURL.split('?')[0]}?size=4096`),
            ),
          ];

          if (addBtnVsby > 0 && (emj?.guild || emj?.[1])?.id !== guild?.id) {
            rows[0].addComponents(
              new MessageButton()
                .setLabel(st.__('EMOJI.COMPONENT.ADD'))
                .setEmoji('➕')
                .setStyle('SUCCESS')
                .setCustomId('emoji_edit_add')
                .setDisabled(addBtnVsby < 2),
            );
          }
          if (editBtnVsby > 0) {
            rows[0].addComponents(
              new MessageButton()
                .setLabel(st.__('EMOJI.COMPONENT.EDIT'))
                .setEmoji('📝')
                .setStyle('PRIMARY')
                .setCustomId('emoji_edit')
                .setDisabled(editBtnVsby < 2),
            );
          }

          if (!ephemeralO) {
            if (rows[0].components.length > 1) {
              rows.push(new MessageActionRow().addComponents(mdBtn));
            } else {
              rows[0].addComponents(mdBtn);
            }
          }

          await interaction.update({
            embeds: [emb.setTitle(`${displayEmj}${st.__('EMOJI.VIEWING')}`).setColor('00ff00')],
            components: rows,
          });
          if (['emoji_nonexistent', 'emoji_noperm'].includes(customId)) {
            interaction.followUp({
              embeds: [
                embed({ type: 'warning' }).setDescription(
                  customId === 'emoji_nonexistent'
                    ? st.__('ERROR.EMOJI.NONEXISTENT')
                    : st.__('PERM.NO_LONGER', st.__('PERM.MANAGE_EMOJIS_AND_STICKERS')),
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
                .setTitle(`${displayEmj}${st.__('EMOJI.DELETING')}`)
                .setDescription(st.__('EMOJI.DELETING_DESCRIPTION'))
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
                  .setLabel(st.__('GENERIC.YES'))
                  .setEmoji('✅')
                  .setStyle('SUCCESS')
                  .setCustomId('emoji_edit_delete_confirm'),
              ),
            ],
          });
        }
        case 'emoji_edit_delete_confirm': {
          await emj?.delete(`${user.tag} | ${st.__('EMOJI.REASON.DELETED')}`);

          const rows = [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel(st.__('EMOJI.COMPONENT.LINK'))
                .setEmoji('🖼️')
                .setStyle('LINK')
                .setURL(`${emjURL.split('?')[0]}?size=4096`),
              new MessageButton()
                .setLabel(st.__('EMOJI.COMPONENT.READD'))
                .setEmoji('➕')
                .setStyle('SUCCESS')
                .setCustomId('emoji_edit_readd'),
            ),
          ];

          if (!ephemeralO) {
            if (rows[0].components.length > 1) {
              rows.push(new MessageActionRow().addComponents(mdBtn));
            } else {
              rows[0].addComponents(mdBtn);
            }
          }

          return interaction.update({
            embeds: [emb.setTitle(st.__('EMOJI.DELETED')).setColor('ff0000')],
            components: rows,
          });
        }
        // TODO: Add edit roles and rename emoji
        case 'emoji_edit_name': {
          if (!botOwners.includes(user.id)) {
            return interaction.reply({
              embeds: [embed({ type: 'wip' }).setDescription(st.__('GENERIC.WIP_FUNCTION'))],
              ephemeral: true,
            });
          }

          return interaction.presentModal(
            new Modal()
              .setTitle(`${displayEmj}Renaming Emoji`)
              .setCustomId('emoji_edit_name_modal')
              .addComponents(
                new MessageActionRow().addComponents(
                  new ModalInputText()
                    .setPlaceholder(emjName)
                    .setStyle('SHORT')
                    .setLabel('Enter new emoji name')
                    .setCustomId('emoji_edit_name_input')
                    .setMinLength(2)
                    .setMaxLength(32),
                ),
              ),
          );
        }
        case 'emoji_edit_role': {
          if (!botOwners.includes(user.id)) {
            return interaction.reply({
              embeds: [embed({ type: 'wip' }).setDescription(st.__('GENERIC.WIP_FUNCTION'))],
              ephemeral: true,
            });
          }

          return interaction.presentModal(
            new Modal()
              .setTitle(`${displayEmj}Renaming Emoji`)
              .setCustomId('emoji_edit_name_modal')
              .addComponents(
                new MessageActionRow().addComponents(
                  new ModalInputText()
                    .setPlaceholder(emjName)
                    .setStyle('SHORT')
                    .setLabel('Enter new emoji name')
                    .setCustomId('emoji_edit_name_input')
                    .setMinLength(2)
                    .setMaxLength(32),
                ),
              ),
          );
        }
      }
    }
  },
};
