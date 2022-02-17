import { parse } from 'twemoji-parser';
import {
  MessageFlags,
  SnowflakeUtil,
  Util,
  ButtonComponent,
  ActionRow,
  RESTJSONErrorCodes,
  ButtonStyle,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} from 'discord.js';
import { checkURL, collMap, toUTS, getFieldValue, decreaseSizeCDN } from '../utils.js';
import { botOwners, colors, emojis, imgOpts, premiumLimits } from '../defaults.js';

export const data = [
  {
    description: 'Emoji related commands',
    name: 'emoji',
    options: [
      {
        description: 'Adds a new emoji',
        name: 'add',
        options: [
          {
            description: 'The emoji itself (Maximum size: 256kb)',
            name: 'image',
            required: true,
            type: ApplicationCommandOptionType.Attachment,
          },
          {
            description: 'The name of the emoji (Alphanumerical 2-32)',
            name: 'name',
            required: true,
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            name: 'ephemeral',
            type: ApplicationCommandOptionType.Boolean,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        description: 'View info or manage an emoji',
        name: 'info',
        options: [
          {
            description: "ID, mention, unicode or name (if it's on the same server)",
            name: 'emoji',
            required: true,
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            name: 'ephemeral',
            type: ApplicationCommandOptionType.Boolean,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
];
export async function execute({ client, interaction, st, embed }) {
  const { guild, user, memberPermissions, message, options } = interaction,
    ephemeralO = options?.getBoolean('ephemeral') ?? message?.flags.has(MessageFlags.Ephemeral) ?? true,
    emojiLimit = premiumLimits[guild.premiumTier].emojis,
    mdBtn = new ButtonComponent()
      .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
      .setEmoji({ name: '🧹' })
      .setStyle(ButtonStyle.Danger)
      .setCustomId('generic_message_delete');

  let addBtnVsby = 0,
    editBtnVsby = 2;

  if (interaction.isChatInputCommand()) {
    await interaction.deferReply({ ephemeral: ephemeralO });

    const isInfo = options?.getSubcommand() === 'info',
      inputO = isInfo ? options?.getString('emoji') : options?.getString('name'),
      parsedEmoji = isInfo ? Util.parseEmoji(inputO) : {},
      mdRow = !ephemeralO ? [new ActionRow().addComponents(mdBtn)] : [];

    let emj,
      emjId = parsedEmoji.id || inputO.match(/\d+/g)?.[0],
      emjName = parsedEmoji.name;

    if (isInfo) {
      emj =
        client.emojis.cache.get(emjId) ||
        (!parsedEmoji.id &&
          (guild?.emojis.cache.find(({ name }) => name === emjName) ||
            guild?.emojis.cache.find(({ name }) => name.toLowerCase() === emjName.toLowerCase()))) ||
        (await client.shard
          .broadcastEval(
            async (c, { d, g }) => {
              const cM = async w => {
                  const y = (await import('discord.js')).Util.discordSort(w)
                    .map(x => (bE.guild.id !== g?.id ? `\`${x.id}\`` : `${x}`))
                    .reverse();
                  let z = y;
                  if (z.length > 40) (z = z.slice(0, 40)).push(`\`+${y.length - z.length}\``);

                  return z.join(', ');
                },
                bE = c.emojis.cache.get(d);

              return bE ? [bE, bE.guild, await cM(bE.roles.cache), bE.roles.cache.size] : false;
            },
            {
              context: {
                d: emjId,
                g: guild,
              },
            },
          )
          .then(eA => eA.find(e => e)));
    } else {
      const imageO = options?.getAttachment('image'),
        alphanumI = /[^\w]/g.test(inputO) && (inputO.length < 2 || inputO.length > 32 ? 'also' : 'only'),
        lengthI = inputO.length < 2 ? 'shorter' : inputO.length > 32 && 'longer';

      if (!interaction.inGuild()) {
        return interaction.editReply({
          components: mdRow,
          embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.DM'))],
        });
      }

      if (!memberPermissions?.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
        return interaction.editReply({
          components: mdRow,
          embeds: [
            embed({ type: 'error' }).setDescription(st.__('PERM.REQUIRES', st.__('PERM.MANAGE_EMOJIS_AND_STICKERS'))),
          ],
        });
      }

      if (imageO.size > 256000) {
        return interaction.editReply({
          components: mdRow,
          embeds: [embed({ type: 'error' }).setDescription(st.__mf('ERROR.INVALID.IMAGE', { size: 256 }))],
        });
      }

      if (alphanumI || lengthI) {
        return interaction.editReply({
          components: mdRow,
          embeds: [
            embed({ type: 'error' }).setDescription(
              st.__mf('ERROR.INVALID.NAME.EMOJI', {
                alphanum: alphanumI,
                input: inputO,
                length: lengthI,
              }),
            ),
          ],
        });
      }

      emj = await guild.emojis
        .create(imageO.attachment, inputO, {
          reason: `${user.tag} | ${st.__(`EMOJI.REASON.CREATED.COMMAND`)}`,
        })
        .catch(async err => {
          if (
            [
              RESTJSONErrorCodes.MaximumNumberOfAnimatedEmojisReached,
              RESTJSONErrorCodes.MaximumNumberOfEmojisReached,
            ].includes(err.code)
          ) {
            await interaction.editReply({
              components: mdRow,
              embeds: [
                embed({ type: 'error' }).setDescription(
                  st.__(
                    `ERROR.EMOJI.MAXIMUM.${
                      err.code === RESTJSONErrorCodes.MaximumNumberOfAnimatedEmojisReached ? 'ANIMATED' : 'STATIC'
                    }`,
                    emojiLimit,
                  ),
                ),
              ],
              ephemeral: true,
            });
            return 1;
          }
          throw err;
        });

      if (emj === 1) return;
    }

    const emjFR = emj
        ? {
            name: `${emojis.role} ${st.__('GENERIC.ROLES')} [${emj[3] ?? emj.roles?.cache.size}]`,
            value:
              (emj[2] ?? collMap(emj.roles.cache, emj.guild?.id !== guild?.id ? { mapValue: 'id' } : {})) ||
              '@everyone',
          }
        : null,
      emjUnicodeURL = `https://twemoji.maxcdn.com/v/latest/72x72/`;

    if (emj) {
      emjId = (emj[0] ?? emj).id;
      emjName = (emj[0] ?? emj).name;
    }

    if ((emj?.guild || emj?.[1])?.id !== guild?.id) {
      addBtnVsby = 2;
      editBtnVsby = 0;
    }

    if (!memberPermissions?.has(PermissionFlagsBits.ManageEmojisAndStickers)) addBtnVsby = editBtnVsby = 0;

    let emjDisplay =
        (!interaction.inGuild() || guild?.roles.everyone.permissions.has(PermissionFlagsBits.UseExternalEmojis)) && emj
          ? (emj[0] ?? emj).animated
            ? `<${(emj[0] ?? emj).identifier}> `
            : `<:${(emj[0] ?? emj).identifier}> `
          : '',
      emjCodePoint,
      emjURL = `https://cdn.discordapp.com/emojis/${parsedEmoji.id || emjId}`;

    const parsedTwemoji = parse(emjName)[0],
      checkedImage = parsedTwemoji ? 1 : (await checkURL(`${emjURL}.gif`)) ? 2 : (await checkURL(emjURL)) ? 3 : 0;

    switch (checkedImage) {
      case 1:
        emjDisplay = `${parsedTwemoji.text} `;
        emjCodePoint = new URL(parsedTwemoji.url).pathname.split(/[/&.]/)[4];
        emjURL = `${emjUnicodeURL}${emjCodePoint}.png`;
        break;
      case 2:
        emjURL += `.gif?size=${imgOpts.size}`;
        break;
      case 3:
        emjURL += `.png?size=${imgOpts.size}`;
        break;
      default:
        return interaction.editReply({
          components: mdRow,
          embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.EMOJI.NOT_FOUND', inputO))],
        });
    }

    const emb = embed();
    if (parsedEmoji.id || emj)
      emb.addField({ inline: true, name: `📛 ${st.__('GENERIC.NAME')}`, value: `\`${emjName}\`` });

    emb
      .setTitle(emjDisplay + st.__(`EMOJI.${isInfo ? (emjCodePoint ? 'VIEWING_UNICODE' : 'VIEWING') : 'ADDED'}`))
      .addField({
        inline: true,
        name: `💻 ${st.__(`GENERIC.${emjCodePoint ? 'CODEPOINT' : 'ID'}`)}`,
        value: `\`${emjCodePoint ?? emjId}\``,
      })
      .setThumbnail(emjURL)
      .setColor(colors.green)
      .setTimestamp(Date.now());

    if (emjCodePoint || parsedEmoji.id || emj) {
      emb.addField({
        inline: true,
        name: `${emojis.mention} ${st.__('GENERIC.MENTION')}`,
        value: `\`${emjDisplay.trim() || `<${checkedImage === 2 ? 'a' : ''}:${emjName}:${emjId}>`}\``,
      });
    }

    if (!emjCodePoint) {
      emb.addField({
        inline: true,
        name: `📅 ${st.__('GENERIC.CREATION_DATE')}`,
        value: toUTS(SnowflakeUtil.timestampFrom(emjId)),
      });
    }

    if (emjFR) emb.addFields(emjFR);

    const rows = [new ActionRow()];
    rows[0].addComponents(
      new ButtonComponent()
        .setLabel(st.__('EMOJI.COMPONENT.LINK'))
        .setEmoji({ name: '🖼️' })
        .setStyle(ButtonStyle.Link)
        .setURL(emjCodePoint ? emjURL : `${emjURL.split('?')[0]}?size=${imgOpts.size}`),
    );

    if (addBtnVsby > 0) {
      rows[0].addComponents(
        new ButtonComponent()
          .setLabel(st.__('EMOJI.COMPONENT.ADD'))
          .setEmoji({ name: '➕' })
          .setStyle(ButtonStyle.Success)
          .setCustomId('emoji_edit_add')
          .setDisabled(addBtnVsby < 2),
      );
    }
    if (editBtnVsby > 0) {
      rows[0].addComponents(
        new ButtonComponent()
          .setLabel(st.__('EMOJI.COMPONENT.EDIT'))
          .setEmoji({ name: '📝' })
          .setStyle(ButtonStyle.Primary)
          .setCustomId('emoji_edit')
          .setDisabled(editBtnVsby < 2),
      );
    }

    if (!ephemeralO) {
      if (rows[0].components.length > 1) rows.push(new ActionRow().addComponents(mdBtn));
      else rows[0].addComponents(mdBtn);
    }

    await interaction.editReply({
      components: rows,
      embeds: [emb],
      ephemeral: ephemeralO,
    });

    if (!isInfo && guild.emojis.cache.filter(({ animated }) => animated === emj.animated).size === emojiLimit) {
      return interaction.followUp({
        embeds: [
          embed({ type: 'warning' }).setDescription(
            st.__(`ERROR.EMOJI.MAXIMUM_NOW.${emj.animated ? 'ANIMATED' : 'STATIC'}`, emojiLimit),
          ),
        ],
        ephemeral: true,
      });
    }
  }
  if (interaction.isButton()) {
    if (message.interaction.user.id !== user.id) {
      return interaction.reply({
        embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.UNALLOWED.COMMAND'))],
        ephemeral: true,
      });
    }
    const oldEmbs = message.embeds,
      emjURL = oldEmbs[0].thumbnail.url,
      emjCodePoint = getFieldValue(oldEmbs[0], st.__('GENERIC.CODEPOINT'))?.replaceAll('`', '');

    let { customId } = interaction,
      emb = embed({ interacted: true }),
      emjId = new URL(emjURL).pathname.split(/[/&.]/)[2],
      emj = guild?.emojis.cache.get(emjId);

    const emjDisplay =
        emj && guild?.roles.everyone.permissions.has(PermissionFlagsBits.UseExternalEmojis) ? `${emj} ` : '',
      emjMention = emj ? `\`${emj}\`` : getFieldValue(oldEmbs[0], st.__('GENERIC.MENTION')),
      emjName = emj?.name ?? getFieldValue(oldEmbs[0], st.__('GENERIC.NAME'))?.replaceAll('`', ''),
      emjFR = emj
        ? {
            name: `${emojis.role} ${st.__('GENERIC.ROLES')} [${emj.roles.cache.size}]`,
            value: collMap(emj.roles.cache, emj.guild?.id !== guild?.id ? { mapValue: 'id' } : {}) || '@everyone',
          }
        : null;

    if (emj) {
      emjId = emj.id;
    } else if (!emjCodePoint) {
      if (!['emoji_edit_add', 'emoji_edit_readd'].includes(customId)) customId = 'emoji_nonexistent';

      addBtnVsby = 2;
      editBtnVsby = 1;
    }

    if (!memberPermissions?.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
      customId = 'emoji_noperm';
      addBtnVsby = emj ? 0 : 1;
      editBtnVsby = 1;
    }

    const rows = [
      new ActionRow().addComponents(
        new ButtonComponent()
          .setLabel(st.__('EMOJI.COMPONENT.LINK'))
          .setEmoji({ name: '🖼️' })
          .setStyle(ButtonStyle.Link)
          .setURL(`${emjURL.split('?')[0]}?size=${imgOpts.size}`),
      ),
    ];

    if (emjName) emb.addField({ inline: true, name: `📛 ${st.__('GENERIC.NAME')}`, value: `\`${emjName}\`` });

    emb
      .setColor(colors.yellow)
      .setTitle(emjDisplay + st.__('EMOJI.EDITING'))
      .addField({
        inline: true,
        name: `💻 ${st.__(`GENERIC.${emjCodePoint ? 'CODEPOINT' : 'ID'}`)}`,
        value: `\`${emjCodePoint ?? emjId}\``,
      })
      .setThumbnail(emjURL)
      .setTimestamp(Date.now());

    if (emjMention)
      emb.addField({ inline: true, name: `${emojis.mention} ${st.__('GENERIC.MENTION')}`, value: emjMention });
    if (!emjCodePoint) {
      emb.addField({
        inline: true,
        name: `📅 ${st.__('GENERIC.CREATION_DATE')}`,
        value: toUTS(SnowflakeUtil.timestampFrom(emjId)),
      });
    }
    if (emjFR) emb.addFields(emjFR);

    switch (customId) {
      case 'emoji_edit_add':
      case 'emoji_edit_readd':
      case 'emoji_edit': {
        const isAdd = ['emoji_edit_add', 'emoji_edit_readd'].includes(customId);
        if (isAdd) {
          const isAddId = customId === 'emoji_edit_add';

          rows[0].addComponents(
            new ButtonComponent()
              .setLabel(st.__(`EMOJI.COMPONENT.${isAddId ? 'ADD' : 'READD'}`))
              .setEmoji({ name: '➕' })
              .setStyle(ButtonStyle.Success)
              .setCustomId(`emoji_edit_${isAddId ? 'add' : 'readd'}`)
              .setDisabled(true),
          );
          if (!ephemeralO) {
            if (rows[0].components.length > 1) rows.push(new ActionRow().addComponents(mdBtn));
            else rows[0].addComponents(mdBtn);
          }

          await interaction.update({
            components: rows,
            embeds: [
              emb
                .setTitle(
                  emjDisplay + st.__(`EMOJI.${isAddId ? (emjCodePoint ? 'ADDING_UNICODE' : 'ADDING') : 'READDING'}`),
                )
                .setColor(colors.blue),
            ],
          });

          const emjCreate = url =>
            guild.emojis
              .create(url, emjCodePoint?.substring(0, 32).replaceAll('-', '_') || emjName || emjId, {
                reason: `${user.tag} | ${st.__(
                  `EMOJI.REASON.CREATED.${
                    isAddId
                      ? emjCodePoint
                        ? 'UNICODE'
                        : emjFR && emj?.guild !== guild.id
                        ? 'ANOTHER_SERVER'
                        : 'CDN'
                      : 'DELETED'
                  }`,
                )}`,
              })
              .catch(async err => {
                if (err.code === RESTJSONErrorCodes.InvalidFormBodyOrContentType)
                  return emjCreate(await decreaseSizeCDN(url, 256));

                if (
                  [
                    RESTJSONErrorCodes.MaximumNumberOfAnimatedEmojisReached,
                    RESTJSONErrorCodes.MaximumNumberOfEmojisReached,
                  ].includes(err.code)
                ) {
                  await interaction.editReply({ embeds: oldEmbs });
                  await interaction.followUp({
                    embeds: [
                      embed({ type: 'warning' }).setDescription(
                        st.__(
                          `ERROR.EMOJI.MAXIMUM.${
                            err.code === RESTJSONErrorCodes.MaximumNumberOfAnimatedEmojisReached ? 'ANIMATED' : 'STATIC'
                          }`,
                          emojiLimit,
                        ),
                      ),
                    ],
                    ephemeral: true,
                  });
                  return 1;
                }
                throw err;
              });
          emj = await emjCreate(emjURL);
          if (emj === 1) return;

          emb = embed({
            interacted: true,
            title: `${emj} ${st.__(`EMOJI.${isAddId ? (emjCodePoint ? 'ADDED_UNICODE' : 'ADDED') : 'READDED'}`)}`,
          })
            .setColor(colors.green)
            .setThumbnail(emj.url)
            .addField({
              inline: true,
              name: `📛 ${st.__('GENERIC.NAME')}`,
              value: `\`${emj.name}\``,
            })
            .addField({
              inline: true,
              name: `💻 ${st.__('GENERIC.ID')}`,
              value: `\`${emj.id}\``,
            })
            .addField({
              inline: true,
              name: `${emojis.mention} ${st.__('GENERIC.MENTION')}`,
              value: `\`${emj}\``,
            })
            .addField({
              inline: true,
              name: `📅 ${st.__('GENERIC.CREATION_DATE')}`,
              value: toUTS(emj.createdTimestamp),
            })
            .addField({
              name: `${emojis.role} ${st.__('GENERIC.ROLES')} [0]`,
              value: '@everyone',
            });
        }
        const opts = {
          components: [
            new ActionRow().addComponents(
              new ButtonComponent()
                .setLabel(st.__('EMOJI.COMPONENT.VIEW'))
                .setEmoji({ name: '🔎' })
                .setStyle(ButtonStyle.Primary)
                .setCustomId('emoji_view'),
              new ButtonComponent()
                .setLabel(st.__('EMOJI.COMPONENT.RENAME'))
                .setEmoji({ name: '✏️' })
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('emoji_edit_name'),
              new ButtonComponent()
                .setLabel(st.__('EMOJI.COMPONENT.ROLES.EDIT'))
                .setEmoji({ name: '📜' })
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('emoji_edit_role'),
            ),
            new ActionRow().addComponents(
              new ButtonComponent()
                .setLabel(st.__('EMOJI.COMPONENT.DELETE'))
                .setEmoji({ name: '🗑️' })
                .setStyle(ButtonStyle.Danger)
                .setCustomId('emoji_edit_delete'),
            ),
          ],
          embeds: [emb],
        };

        await (interaction.replied ? interaction.editReply(opts) : interaction.update(opts));
        if (isAdd && guild.emojis.cache.filter(({ animated }) => animated === emj.animated).size === emojiLimit) {
          return interaction.followUp({
            embeds: [
              embed({ type: 'warning' }).setDescription(
                st.__(`ERROR.EMOJI.MAXIMUM_NOW.${emj.animated ? 'ANIMATED' : 'STATIC'}`, emojiLimit),
              ),
            ],
            ephemeral: true,
          });
        }
        return;
      }
      case 'emoji_nonexistent':
      case 'emoji_noperm':
      case 'emoji_view': {
        if (addBtnVsby > 0 && (emj?.guild || emj?.[1])?.id !== guild?.id) {
          rows[0].addComponents(
            new ButtonComponent()
              .setLabel(st.__('EMOJI.COMPONENT.ADD'))
              .setEmoji({ name: '➕' })
              .setStyle(ButtonStyle.Success)
              .setCustomId('emoji_edit_add')
              .setDisabled(addBtnVsby < 2),
          );
        }
        if (editBtnVsby > 0) {
          rows[0].addComponents(
            new ButtonComponent()
              .setLabel(st.__('EMOJI.COMPONENT.EDIT'))
              .setEmoji({ name: '📝' })
              .setStyle(ButtonStyle.Primary)
              .setCustomId('emoji_edit')
              .setDisabled(editBtnVsby < 2),
          );
        }
        if (!ephemeralO) {
          if (rows[0].components.length > 1) rows.push(new ActionRow().addComponents(mdBtn));
          else rows[0].addComponents(mdBtn);
        }

        await interaction.update({
          components: rows,
          embeds: [emb.setTitle(emjDisplay + st.__('EMOJI.VIEWING')).setColor(65280)],
        });
        if (['emoji_nonexistent', 'emoji_noperm'].includes(customId)) {
          return interaction.followUp({
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
          components: [
            new ActionRow().addComponents(
              new ButtonComponent()
                .setLabel(st.__('GENERIC.COMPONENT.BACK'))
                .setEmoji({ name: '↩️' })
                .setStyle(ButtonStyle.Primary)
                .setCustomId('emoji_edit'),
              new ButtonComponent()
                .setLabel(st.__('GENERIC.YES'))
                .setEmoji({ name: '✅' })
                .setStyle(ButtonStyle.Success)
                .setCustomId('emoji_edit_delete_confirm'),
            ),
          ],
          embeds: [
            emb
              .setTitle(emjDisplay + st.__('EMOJI.DELETING'))
              .setDescription(st.__('EMOJI.DELETING_DESCRIPTION'))
              .setColor(colors.orange),
          ],
        });
      }
      case 'emoji_edit_delete_confirm': {
        await emj?.delete(`${user.tag} | ${st.__('EMOJI.REASON.DELETED')}`);

        rows[0].addComponents(
          new ButtonComponent()
            .setLabel(st.__('EMOJI.COMPONENT.READD'))
            .setEmoji({ name: '➕' })
            .setStyle(ButtonStyle.Success)
            .setCustomId('emoji_edit_readd'),
        );
        if (!ephemeralO) {
          if (rows[0].components.length > 1) rows.push(new ActionRow().addComponents(mdBtn));
          else rows[0].addComponents(mdBtn);
        }

        return interaction.update({
          components: rows,
          embeds: [emb.setTitle(st.__('EMOJI.DELETED')).setColor(colors.red)],
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
        return interaction.deferUpdate();
      }
      case 'emoji_edit_role': {
        if (!botOwners.includes(user.id)) {
          return interaction.reply({
            embeds: [embed({ type: 'wip' }).setDescription(st.__('GENERIC.WIP_FUNCTION'))],
            ephemeral: true,
          });
        }
        return interaction.deferUpdate();
      }
    }
  }
}
