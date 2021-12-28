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
  { botOwners } = require('../defaults'),
  { checkImage, collMap, toUTS } = require('../utils');

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
            "Search for the emoji's info through all cached guilds, increasing response time. (Default: False)",
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
      globalsearchO = options?.getBoolean('globalsearch') ?? false,
      ephemeralO = options?.getBoolean('ephemeral') ?? true,
      mdBtn = new MessageButton()
        .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
        .setEmoji('🧹')
        .setStyle('DANGER')
        .setCustomId('generic_message_delete');

    let { customId } = interaction,
      emjFR,
      disAdd = false,
      disEdit = false;

    if (interaction.isCommand()) {
      await interaction.deferReply({ ephemeral: ephemeralO });

      let emjID = emojiO.match(/^\d+$/g)?.[0] || emojiO.match(/(?<=:)\d+(?=>)/g)?.[0],
        emjName = emojiO.match(/(?<=:).+(?=:)/g)?.[0];

      const emj =
          (globalsearchO
            ? await client.shard
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

                    return bE ? [bE, bE.guild, cM(bE.roles.cache)] : false;
                  },
                  {
                    context: {
                      d: emjID,
                      g: guild,
                    },
                  },
                )
                .then(eA => eA.find(e => e))
            : guild?.emojis.cache.get(emjID)) ||
          guild?.emojis.cache.find(({ name }) => name === emojiO) ||
          guild?.emojis.cache.find(({ name }) => name.toLowerCase() === emojiO.toLowerCase()),
        displayEmj =
          (!interaction.inGuild() || guild?.roles.everyone.permissions.has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS)) &&
          emj
            ? (emj[0] ?? emj).animated
              ? `<${(emj[0] ?? emj).identifier}> `
              : `<:${(emj[0] ?? emj).identifier}> `
            : '';

      if (emj) {
        if ((emj.guild?.id || emj[1].id) !== guild?.id) disEdit = true;
        if (!memberPermissions?.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
          disAdd = true;
          disEdit = true;
        }
        const emjRoles =
          (emj[2] ?? collMap(emj.roles.cache, emj.guild?.id !== guild?.id ? { mapValue: 'id' } : {})) || '@everyone';

        emjID = (emj[0] ?? emj).id;
        emjName = (emj[0] ?? emj).name;
        emjFR = {
          name: st.__('GENERIC.ROLES'),
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
          components: !ephemeralO ? [new MessageActionRow().addComponents(mdBtn)] : [],
          embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.EMOJI.NOT_FOUND', emojiO))],
        });
      } else {
        emjURL += '.png?size=4096';
      }

      const emb = (emjName ? embed().addField(st.__('GENERIC.NAME'), `\`${emjName}\``, true) : embed())
        .setTitle(`${displayEmj}${st.__('EMOJI.VIEW_VIEWING')}`)
        .addField(st.__('GENERIC.ID'), `\`${emjID}\``, true)
        .addField(st.__('GENERIC.CREATION_DATE'), toUTS(SnowflakeUtil.deconstruct(emjID).timestamp), true)
        .setThumbnail(emjURL)
        .setColor('00ff00')
        .setTimestamp(Date.now());

      if (emjFR) emb.addFields(emjFR);

      const rows = [new MessageActionRow()];
      if (!ephemeralO) {
        if (interaction.inGuild()) {
          rows.push(new MessageActionRow().addComponents(mdBtn));
        } else {
          rows[0].addComponents(mdBtn);
        }
      }
      rows[0].addComponents(
        new MessageButton()
          .setLabel(st.__('EMOJI.COMPONENT.LINK'))
          .setEmoji('🖼️')
          .setStyle('LINK')
          .setURL(`${emjURL.split('?')[0]}?size=4096`),
      );

      if (interaction.inGuild()) {
        if ((emj?.guild?.id || emj?.[1].id) !== guild?.id) {
          rows[0].addComponents(
            new MessageButton()
              .setLabel(st.__('EMOJI.COMPONENT.EDIT_ADD'))
              .setEmoji('➕')
              .setStyle('SUCCESS')
              .setCustomId('emoji_edit_add')
              .setDisabled(disAdd),
          );
        }
        rows[0].addComponents(
          new MessageButton()
            .setLabel(st.__('EMOJI.COMPONENT.EDIT'))
            .setEmoji('📝')
            .setStyle('PRIMARY')
            .setCustomId('emoji_edit')
            .setDisabled(disEdit),
        );
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

      if (!memberPermissions?.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
        customId = 'emoji_noperm';
        disEdit = true;
      }

      const emjURL = message.embeds[0].thumbnail.url;
      let emjID = new URL(emjURL).pathname.split(/[/&.]/)[2],
        emj = guild?.emojis.cache.get(emjID),
        emjName;

      const displayEmj =
        (!interaction.inGuild() || guild?.roles.everyone.permissions.has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS)) && emj
          ? `${emj} `
          : '';

      if (message.embeds[0].fields[0].name === st.__('GENERIC.NAME')) {
        emjName = message.embeds[0].fields[0].value.replaceAll('`', '');
      }

      if (emj) {
        const emjRoles = collMap(emj.roles.cache, emj.guild?.id !== guild?.id ? { mapValue: 'id' } : {}) || '@everyone';
        emjName = emj.name;
        emjID = emj.id;
        emjFR = {
          name: st.__('GENERIC.ROLES'),
          value: emjRoles,
        };
      } else {
        if (!['emoji_edit_add', 'emoji_edit_readd'].includes(customId)) customId = 'emoji_nonexistent';
        disEdit = true;
      }

      const emb = (
        emjName
          ? embed({ interacted: true }).addField(st.__('GENERIC.NAME'), `\`${emjName}\``, true)
          : embed({ interacted: true })
      )
        .setColor('ffff00')
        .setTitle(`${displayEmj}${st.__('EMOJI.EDIT_EDITING')}`)
        .addField(st.__('GENERIC.ID'), `\`${emjID}\``, true)
        .addField(st.__('GENERIC.CREATION_DATE'), toUTS(SnowflakeUtil.deconstruct(emjID).timestamp), true)
        .setThumbnail(emjURL)
        .setTimestamp(Date.now());

      if (emjFR) emb.addFields(emjFR);

      switch (customId) {
        case 'emoji_edit_add':
        case 'emoji_edit_readd':
        case 'emoji_edit': {
          if (['emoji_edit_add', 'emoji_edit_readd'].includes(customId)) {
            emj = await guild?.emojis.create(emjURL, emjName || emjID);

            if (!emb.fields[2]) {
              emb.fields[0] = {
                name: st.__('GENERIC.NAME'),
                value: `\`${emj.name}\``,
                inline: true,
              };
            }
            emb.fields[1] = {
              name: st.__('GENERIC.ID'),
              value: `\`${emj.id}\``,
              inline: true,
            };
            emb.fields[2] = {
              name: st.__('GENERIC.CREATION_DATE'),
              value: toUTS(emj.createdTimestamp),
              inline: true,
            };
            emb.fields[3] = {
              name: st.__('GENERIC.ROLES'),
              value: '@everyone',
            };
            emb
              .setColor('00ff00')
              .setThumbnail(emj.url)
              .setTitle(`${emj} ${st.__(`EMOJI.${customId === 'emoji_edit_add' ? 'EDIT_ADDED' : 'EDIT_READDED'}`)}`);
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

          if (!message.flags.has(MessageFlags.FLAGS.EPHEMERAL)) {
            rows.push(new MessageActionRow().addComponents(mdBtn));
          }

          if ((emj?.guild?.id || emj?.[1].id) !== guild?.id) {
            rows[0].addComponents(
              new MessageButton()
                .setLabel(st.__('EMOJI.COMPONENT.EDIT_ADD'))
                .setEmoji('➕')
                .setStyle('SUCCESS')
                .setCustomId('emoji_edit_add')
                .setDisabled(disAdd),
            );
          }
          rows[0].addComponents(
            new MessageButton()
              .setLabel(st.__('EMOJI.COMPONENT.EDIT'))
              .setEmoji('📝')
              .setStyle('PRIMARY')
              .setCustomId('emoji_edit')
              .setDisabled(disEdit),
          );

          await interaction.update({
            embeds: [emb.setTitle(`${displayEmj}${st.__('EMOJI.VIEW_VIEWING')}`).setColor('00ff00')],
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
                .setTitle(`${displayEmj}${st.__('EMOJI.EDIT_DELETING')}`)
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
          await emj?.delete();
          await client.emojis.cache.delete(emjID);
          await guild?.emojis.cache.delete(emjID);

          const rows = [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel(st.__('EMOJI.COMPONENT.LINK'))
                .setEmoji('🖼️')
                .setStyle('LINK')
                .setURL(`${emjURL.split('?')[0]}?size=4096`),
              new MessageButton()
                .setLabel(st.__('EMOJI.COMPONENT.EDIT_READD'))
                .setEmoji('➕')
                .setStyle('SUCCESS')
                .setCustomId('emoji_edit_readd'),
            ),
          ];

          if (!message.flags.has(MessageFlags.FLAGS.EPHEMERAL)) {
            rows.push(new MessageActionRow().addComponents(mdBtn));
          }

          return interaction.update({
            embeds: [emb.setTitle(st.__('EMOJI.EDIT_DELETED')).setColor('ff0000')],
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
