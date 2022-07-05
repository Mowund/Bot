import { parse } from 'twemoji-parser';
import {
  MessageFlags,
  SnowflakeUtil,
  ButtonBuilder,
  ActionRowBuilder,
  RESTJSONErrorCodes,
  ButtonStyle,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
  parseEmoji,
} from 'discord.js';
import { collMap, toUTS, getFieldValue, decreaseSizeCDN, disableComponents } from '../utils.js';
import { botOwners, colors, emojis, imgOpts, premiumLimits } from '../defaults.js';

export const data = [
  {
    description: 'Emoji related commands',
    description_localizations: { 'pt-BR': 'Comandos relacionados à emojis' },
    name: 'emoji',
    name_localizations: {},
    options: [
      {
        description: 'Adds a new emoji',
        description_localizations: { 'pt-BR': 'Adiciona um novo emoji' },
        name: 'add',
        name_localizations: { 'pt-BR': 'adicionar' },
        options: [
          {
            description: 'The emoji itself (Maximum size: 256kb)',
            description_localizations: { 'pt-BR': 'O emoji em si (Tamanho máximo: 256kb)' },
            name: 'image',
            name_localizations: { 'pt-BR': 'imagem' },
            required: true,
            type: ApplicationCommandOptionType.Attachment,
          },
          {
            description: 'The name of the emoji (Alphanumerical)',
            description_localizations: { 'pt-BR': 'O nome do emoji (Alfanumérico)' },
            max_length: 32,
            min_length: 2,
            name: 'name',
            name_localizations: { 'pt-BR': 'nome' },
            required: true,
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            description_localizations: { 'pt-BR': 'Envia a resposta como uma mensagem efêmera (Padrão: Verdadeiro)' },
            name: 'ephemeral',
            name_localizations: { 'pt-BR': 'efêmero' },
            type: ApplicationCommandOptionType.Boolean,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        description: 'Shows info or manages an emoji',
        description_localizations: { 'pt-BR': 'Mostra informações ou gerencia um emoji' },
        name: 'info',
        name_localizations: {},
        options: [
          {
            description: "ID, mention, unicode or name (if it's on the same server)",
            description_localizations: { 'pt-BR': 'ID, menção, unicode ou nome (caso esteja no mesmo servidor)' },
            name: 'emoji',
            name_localizations: {},
            required: true,
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            description_localizations: { 'pt-BR': 'Envia a resposta como uma mensagem efêmera (Padrão: Verdadeiro)' },
            name: 'ephemeral',
            name_localizations: { 'pt-BR': 'efêmero' },
            type: ApplicationCommandOptionType.Boolean,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
];
export async function execute({ embed, interaction, st }) {
  const { appPermissions, client, fields, guild, memberPermissions, message, options, user } = interaction,
    ephemeralO = options?.getBoolean('ephemeral') ?? message?.flags.has(MessageFlags.Ephemeral) ?? true,
    emojiLimit = premiumLimits[guild.premiumTier].emojis,
    mdBtn = new ButtonBuilder()
      .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
      .setEmoji('🧹')
      .setStyle(ButtonStyle.Danger)
      .setCustomId('generic_message_delete');

  let addBtnVsby = 0,
    editBtnVsby = 2;

  if (interaction.isChatInputCommand()) {
    await interaction.deferReply({ ephemeral: ephemeralO });

    const isInfo = options?.getSubcommand() === 'info',
      inputO = isInfo ? options?.getString('emoji') : options?.getString('name'),
      parsedEmoji = isInfo ? parseEmoji(inputO) : {},
      mdRow = !ephemeralO ? [new ActionRowBuilder().addComponents([mdBtn])] : [];

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
            embed({ type: 'error' }).setDescription(
              st.__mf('PERM.REQUIRES', { perm: st.__('PERM.MANAGE_EMOJIS_AND_STICKERS') }),
            ),
          ],
        });
      }

      if (imageO.size > 256000) {
        return interaction.editReply({
          components: mdRow,
          embeds: [embed({ type: 'error' }).setDescription(st.__mf('ERROR.INVALID.IMAGE.SIZE', { maxSize: 256 }))],
        });
      }

      if (alphanumI || lengthI) {
        return interaction.editReply({
          components: mdRow,
          embeds: [
            embed({ type: 'error' }).setDescription(
              st.__mf('ERROR.INVALID.NAME.EMOJI', {
                alphanum: alphanumI,
                condition: lengthI,
                input: inputO,
                maxLength: 32,
                minLength: 2,
              }),
            ),
          ],
        });
      }

      emj = await guild.emojis
        .create(imageO.attachment, inputO, {
          reason: `${user.tag} | ${st.__('EMOJI.REASON.CREATED.COMMAND')}`,
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
                  st.__mf(
                    `ERROR.EMOJI.MAXIMUM.${
                      err.code === RESTJSONErrorCodes.MaximumNumberOfAnimatedEmojisReached ? 'ANIMATED' : 'STATIC'
                    }`,
                    { limit: emojiLimit },
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

    const emjUnicodeURL = `https://twemoji.maxcdn.com/v/latest/72x72/`;

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
        (!interaction.inGuild() || appPermissions.has(PermissionFlagsBits.UseExternalEmojis)) && emj
          ? (emj[0] ?? emj).animated
            ? `<${(emj[0] ?? emj).identifier}> `
            : `<:${(emj[0] ?? emj).identifier}> `
          : '',
      emjCodePoint,
      emjURL = `https://cdn.discordapp.com/emojis/${parsedEmoji.id || emjId}`;

    const parsedTwemoji = parse(emjName)[0],
      imageType = parsedTwemoji
        ? 'twemoji'
        : (await fetch(`${emjURL}.gif`)).ok
        ? 'gif'
        : (await fetch(emjURL)).ok && 'png';

    switch (imageType) {
      case 'gif':
      case 'png':
        emjURL += `.${imageType}?size=${imgOpts.size}`;
        break;
      case 'twemoji':
        emjDisplay = `${parsedTwemoji.text} `;
        emjCodePoint = new URL(parsedTwemoji.url).pathname.split(/[/&.]/)[4];
        emjURL = `${emjUnicodeURL}${emjCodePoint}.png`;
        break;
      default:
        return interaction.editReply({
          components: mdRow,
          embeds: [embed({ type: 'error' }).setDescription(st.__mf('ERROR.EMOJI.NOT_FOUND', { input: inputO }))],
        });
    }

    const emb = embed();
    if (parsedEmoji.id || emj)
      emb.addFields([{ inline: true, name: `📛 ${st.__('GENERIC.NAME')}`, value: `\`${emjName}\`` }]);

    emb
      .setTitle(emjDisplay + st.__(`EMOJI.${isInfo ? (emjCodePoint ? 'VIEWING_UNICODE' : 'VIEWING') : 'ADDED'}`))
      .addFields([
        {
          inline: true,
          name: `🏷️ ${st.__(`GENERIC.${emjCodePoint ? 'CODEPOINT' : 'ID'}`)}`,
          value: `\`${emjCodePoint ?? emjId}\``,
        },
      ])
      .setThumbnail(emjURL)
      .setColor(colors.green)
      .setTimestamp(Date.now());

    if (emjCodePoint || parsedEmoji.id || emj) {
      emb.addFields([
        {
          inline: true,
          name: `${emojis.mention} ${st.__('GENERIC.MENTION')}`,
          value: `\`${emjDisplay.trim() || `<${imageType === 'gif' ? 'a' : ''}:${emjName}:${emjId}>`}\``,
        },
      ]);
    }

    if (!emjCodePoint) {
      emb.addFields([
        {
          inline: true,
          name: `📅 ${st.__('GENERIC.CREATION_DATE')}`,
          value: toUTS(SnowflakeUtil.timestampFrom(emjId)),
        },
      ]);
    }

    if (emj) {
      emb.addFields([
        {
          name: `${emojis.role} ${st.__('GENERIC.ROLES')} [${emj[3] ?? emj.roles?.cache.size}]`,
          value:
            (emj[2] ?? collMap(emj.roles.cache, emj.guild?.id !== guild?.id ? { mapValue: 'id' } : {})) || '@everyone',
        },
      ]);
    }

    const rows = [new ActionRowBuilder()];
    rows[0].addComponents([
      new ButtonBuilder()
        .setLabel(st.__('EMOJI.COMPONENT.LINK'))
        .setEmoji('🖼️')
        .setStyle(ButtonStyle.Link)
        .setURL(emjCodePoint ? emjURL : `${emjURL.split('?')[0]}?size=${imgOpts.size}`),
    ]);

    if (addBtnVsby) {
      rows[0].addComponents([
        new ButtonBuilder()
          .setLabel(st.__('EMOJI.COMPONENT.ADD'))
          .setEmoji('➕')
          .setStyle(ButtonStyle.Success)
          .setCustomId('emoji_edit_add')
          .setDisabled(addBtnVsby < 2),
      ]);
    }
    if (editBtnVsby) {
      rows[0].addComponents([
        new ButtonBuilder()
          .setLabel(st.__('EMOJI.COMPONENT.EDIT'))
          .setEmoji('📝')
          .setStyle(ButtonStyle.Primary)
          .setCustomId('emoji_edit')
          .setDisabled(editBtnVsby < 2),
      ]);
    }

    if (!ephemeralO) {
      if (rows[0].components.length > 1) rows.push(new ActionRowBuilder().addComponents([mdBtn]));
      else rows[0].addComponents([mdBtn]);
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
            st.__mf(`ERROR.EMOJI.MAXIMUM_NOW.${emj.animated ? 'ANIMATED' : 'STATIC'}`, { limit: emojiLimit }),
          ),
        ],
        ephemeral: true,
      });
    }
  }
  if (interaction.isButton() || interaction.type === InteractionType.ModalSubmit) {
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
      emb = embed({ footer: 'interacted' }),
      emjId = new URL(emjURL).pathname.split(/[/&.]/)[2],
      emj = guild?.emojis.cache.get(emjId);

    const emjDisplay = emj && appPermissions.has(PermissionFlagsBits.UseExternalEmojis) ? `${emj} ` : '',
      emjMention = emj ? `\`${emj}\`` : getFieldValue(oldEmbs[0], st.__('GENERIC.MENTION')),
      emjName = emj?.name ?? getFieldValue(oldEmbs[0], st.__('GENERIC.NAME'))?.replaceAll('`', '');

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
      new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setLabel(st.__('EMOJI.COMPONENT.LINK'))
          .setEmoji('🖼️')
          .setStyle(ButtonStyle.Link)
          .setURL(`${emjURL.split('?')[0]}?size=${imgOpts.size}`),
      ]),
    ];

    if (emjName) emb.addFields([{ inline: true, name: `📛 ${st.__('GENERIC.NAME')}`, value: `\`${emjName}\`` }]);

    emb
      .setColor(colors.yellow)
      .setTitle(emjDisplay + st.__('EMOJI.EDITING'))
      .addFields([
        {
          inline: true,
          name: `🏷️ ${st.__(`GENERIC.${emjCodePoint ? 'CODEPOINT' : 'ID'}`)}`,
          value: `\`${emjCodePoint ?? emjId}\``,
        },
      ])
      .setThumbnail(emjURL)
      .setTimestamp(Date.now());

    if (emjMention)
      emb.addFields([{ inline: true, name: `${emojis.mention} ${st.__('GENERIC.MENTION')}`, value: emjMention }]);
    if (!emjCodePoint) {
      emb.addFields([
        {
          inline: true,
          name: `📅 ${st.__('GENERIC.CREATION_DATE')}`,
          value: toUTS(SnowflakeUtil.timestampFrom(emjId)),
        },
      ]);
    }
    if (emj) {
      emb.addFields([
        {
          name: `${emojis.role} ${st.__('GENERIC.ROLES')} [${emj.roles.cache.size}]`,
          value: collMap(emj.roles.cache, emj.guild?.id !== guild?.id ? { mapValue: 'id' } : {}) || '@everyone',
        },
      ]);
    }

    switch (customId) {
      case 'emoji_edit_add':
      case 'emoji_edit_readd':
      case 'emoji_edit': {
        const isAdd = ['emoji_edit_add', 'emoji_edit_readd'].includes(customId);
        if (isAdd) {
          const isAddId = customId === 'emoji_edit_add';

          await interaction.update({
            components: disableComponents(message.components),
            embeds: [
              emb
                .setTitle(
                  emjDisplay + st.__(`EMOJI.${isAddId ? (emjCodePoint ? 'ADDING_UNICODE' : 'ADDING') : 'READDING'}`),
                )
                .setColor(colors.blue),
            ],
          });

          console.log(emj, emj?.guild !== guild.id, emj && emj?.guild !== guild.id);
          const emjCreate = url =>
            guild.emojis
              .create({
                attachment: url,
                name: emjCodePoint?.substring(0, 32).replaceAll('-', '_') || emjName || emjId,
                reason: `${user.tag} | ${st.__(
                  `EMOJI.REASON.CREATED.${isAddId ? (emjCodePoint ? 'UNICODE' : 'CDN') : 'DELETED'}`,
                )}`,
              })
              .catch(async err => {
                if (err.code === RESTJSONErrorCodes.InvalidFormBodyOrContentType)
                  return emjCreate(await decreaseSizeCDN(url, { initialSize: 256, maxSize: 256000 }));

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
                        st.__mf(
                          `ERROR.EMOJI.MAXIMUM.${
                            err.code === RESTJSONErrorCodes.MaximumNumberOfAnimatedEmojisReached ? 'ANIMATED' : 'STATIC'
                          }`,
                          { limit: emojiLimit },
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
            footer: 'interacted',
            title: `${emj} ${st.__(`EMOJI.${isAddId ? (emjCodePoint ? 'ADDED_UNICODE' : 'ADDED') : 'READDED'}`)}`,
          })
            .setColor(colors.green)
            .setThumbnail(emj.url)
            .addFields([
              {
                inline: true,
                name: `📛 ${st.__('GENERIC.NAME')}`,
                value: `\`${emj.name}\``,
              },
              {
                inline: true,
                name: `🏷️ ${st.__('GENERIC.ID')}`,
                value: `\`${emj.id}\``,
              },
              {
                inline: true,
                name: `${emojis.mention} ${st.__('GENERIC.MENTION')}`,
                value: `\`${emj}\``,
              },
              {
                inline: true,
                name: `📅 ${st.__('GENERIC.CREATION_DATE')}`,
                value: toUTS(emj.createdTimestamp),
              },
              {
                name: `${emojis.role} ${st.__('GENERIC.ROLES')} [0]`,
                value: '@everyone',
              },
            ]);
        }
        const opts = {
          components: [
            new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setLabel(st.__('EMOJI.COMPONENT.VIEW'))
                .setEmoji('🔎')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('emoji_view'),
              new ButtonBuilder()
                .setLabel(st.__('EMOJI.COMPONENT.RENAME'))
                .setEmoji('✏️')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('emoji_rename'),
              new ButtonBuilder()
                .setLabel(st.__('EMOJI.COMPONENT.ROLES.EDIT'))
                .setEmoji('📜')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('emoji_edit_role'),
            ]),
            new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setLabel(st.__('EMOJI.COMPONENT.DELETE'))
                .setEmoji('🗑️')
                .setStyle(ButtonStyle.Danger)
                .setCustomId('emoji_edit_delete'),
            ]),
          ],
          embeds: [emb],
        };

        await (interaction.replied ? interaction.editReply(opts) : interaction.update(opts));
        if (isAdd && guild.emojis.cache.filter(({ animated }) => animated === emj.animated).size === emojiLimit) {
          return interaction.followUp({
            embeds: [
              embed({ type: 'warning' }).setDescription(
                st.__mf(`ERROR.EMOJI.MAXIMUM_NOW.${emj.animated ? 'ANIMATED' : 'STATIC'}`, { limit: emojiLimit }),
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
        if (addBtnVsby && (emj?.guild || emj?.[1])?.id !== guild?.id) {
          rows[0].addComponents([
            new ButtonBuilder()
              .setLabel(st.__('EMOJI.COMPONENT.ADD'))
              .setEmoji('➕')
              .setStyle(ButtonStyle.Success)
              .setCustomId('emoji_edit_add')
              .setDisabled(addBtnVsby < 2),
          ]);
        }
        if (editBtnVsby) {
          rows[0].addComponents([
            new ButtonBuilder()
              .setLabel(st.__('EMOJI.COMPONENT.EDIT'))
              .setEmoji('📝')
              .setStyle(ButtonStyle.Primary)
              .setCustomId('emoji_edit')
              .setDisabled(editBtnVsby < 2),
          ]);
        }
        if (!ephemeralO) {
          if (rows[0].components.length > 1) rows.push(new ActionRowBuilder().addComponents([mdBtn]));
          else rows[0].addComponents([mdBtn]);
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
                  : st.__mf('PERM.NO_LONGER', { perm: st.__('PERM.MANAGE_EMOJIS_AND_STICKERS') }),
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
            new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setLabel(st.__('GENERIC.COMPONENT.BACK'))
                .setEmoji('↩️')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('emoji_edit'),
              new ButtonBuilder()
                .setLabel(st.__('GENERIC.YES'))
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success)
                .setCustomId('emoji_edit_delete_confirm'),
            ]),
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

        rows[0].addComponents([
          new ButtonBuilder()
            .setLabel(st.__('EMOJI.COMPONENT.READD'))
            .setEmoji('➕')
            .setStyle(ButtonStyle.Success)
            .setCustomId('emoji_edit_readd'),
        ]);
        if (!ephemeralO) {
          if (rows[0].components.length > 1) rows.push(new ActionRowBuilder().addComponents([mdBtn]));
          else rows[0].addComponents([mdBtn]);
        }

        return interaction.update({
          components: rows,
          embeds: [emb.setTitle(st.__('EMOJI.DELETED')).setColor(colors.red)],
        });
      }
      case 'emoji_rename': {
        return interaction.showModal(
          new ModalBuilder()
            .setTitle(st.__('EMOJI.RENAMING'))
            .setCustomId('emoji_rename_submit')
            .addComponents([
              new ActionRowBuilder().addComponents([
                new TextInputBuilder()
                  .setCustomId('emoji_rename_input')
                  .setLabel(st.__('EMOJI.RENAMING_LABEL'))
                  .setMinLength(2)
                  .setMaxLength(32)
                  .setPlaceholder(emjName)
                  .setStyle(TextInputStyle.Short),
              ]),
            ]),
        );
      }
      case 'emoji_rename_submit': {
        console.log(0);
        const inputF = fields.getTextInputValue('emoji_rename_input').replace(/\s/g, ''),
          alphanumI = /[^\w]/g.test(inputF) && (inputF.length < 2 || inputF.length > 32 ? 'also' : 'only'),
          lengthI = inputF.length < 2 ? 'shorter' : inputF.length > 32 && 'longer';
        console.log(1);

        if (inputF === emjName) return interaction.deferUpdate();
        console.log(2);
        if (alphanumI || lengthI) {
          return interaction.update({
            embeds: [
              emb
                .setColor(colors.red)
                .setTitle(emjDisplay + st.__('ERROR.INVALID.NAME.SHORT'))
                .setDescription(
                  st.__mf('ERROR.INVALID.NAME.LONG', {
                    alphanum: alphanumI,
                    condition: lengthI,
                    input: inputF,
                    maxLength: 32,
                    minLength: 2,
                  }),
                ),
            ],
          });
        }
        console.log(3);

        emj = await emj.edit({ name: inputF }, `${user.tag} | ${st.__('EMOJI.REASON.RENAMED')}`);
        console.log(4);

        console.log(emb);
        emb.spliceFields(0, 1, {
          inline: true,
          name: `📛 ${st.__('GENERIC.NAME')}`,
          value: `\`${emj.name}\``,
        });
        emb.spliceFields(2, 1, {
          inline: true,
          name: `${emojis.mention} ${st.__('GENERIC.MENTION')}`,
          value: `\`${emj}\``,
        });
        console.log(emb);
        console.log(5);

        return interaction.update({
          embeds: [emb.setColor(colors.green).setTitle(emjDisplay + st.__('EMOJI.RENAMED'))],
        });
      }
      // TODO: Add edit emoji roles
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
