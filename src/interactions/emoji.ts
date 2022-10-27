import { parse } from 'twemoji-parser';
import {
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
  parseEmoji,
  BaseInteraction,
  GuildEmoji,
  Collection,
  ModalMessageModalSubmitInteraction,
  ButtonInteraction,
  Colors,
  SelectMenuInteraction,
} from 'discord.js';
import { RawGuildData, RawGuildEmojiData } from 'discord.js/typings/rawDataTypes.js';
import { collMap, toUTS, getFieldValue, decreaseSizeCDN, disableComponents } from '../utils.js';
import { emojis, imgOpts, premiumLimits } from '../defaults.js';
import { Command, CommandArgs } from '../../lib/structures/Command.js';

export default class Emoji extends Command {
  constructor() {
    super([
      {
        description: 'EMOJI.DESCRIPTION',
        name: 'EMOJI.NAME',
        options: [
          {
            description: 'EMOJI.OPTIONS.ADD.DESCRIPTION',
            name: 'EMOJI.OPTIONS.ADD.NAME',
            options: [
              {
                description: 'EMOJI.OPTIONS.ADD.OPTIONS.IMAGE.DESCRIPTION',
                name: 'EMOJI.OPTIONS.ADD.OPTIONS.IMAGE.NAME',
                required: true,
                type: ApplicationCommandOptionType.Attachment,
              },
              {
                description: 'EMOJI.OPTIONS.ADD.OPTIONS.NAME.DESCRIPTION',
                maxLength: 32,
                minLength: 2,
                name: 'EMOJI.OPTIONS.ADD.OPTIONS.NAME.NAME',
                required: true,
                type: ApplicationCommandOptionType.String,
              },
            ],
            type: ApplicationCommandOptionType.Subcommand,
          },
          {
            description: 'EMOJI.OPTIONS.INFO.DESCRIPTION',
            name: 'EMOJI.OPTIONS.INFO.NAME',
            options: [
              {
                description: 'EMOJI.OPTIONS.INFO.OPTIONS.EMOJI.DESCRIPTION',
                name: 'EMOJI.OPTIONS.INFO.OPTIONS.EMOJI.NAME',
                required: true,
                type: ApplicationCommandOptionType.String,
              },
            ],
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
      },
    ]);
  }

  async run(args: CommandArgs, interaction: BaseInteraction<'cached'>): Promise<any> {
    const { client, embed } = args,
      { i18n } = client,
      { appPermissions, guild, memberPermissions, user } = interaction,
      emojiLimit = premiumLimits[guild.premiumTier].emojis;

    let addBtnVsby = 0,
      editBtnVsby = 2;

    if (interaction.isChatInputCommand()) {
      const { options } = interaction,
        ephemeralO = options?.getBoolean('ephemeral') ?? true;

      await interaction.deferReply({ ephemeral: ephemeralO });

      const isInfo = options?.getSubcommand() === 'info',
        inputO = isInfo ? options?.getString('emoji') : options?.getString('name'),
        parsedEmoji = isInfo ? parseEmoji(inputO) : { animated: false, id: null, name: null };

      let emj: GuildEmoji | [RawGuildEmojiData, RawGuildData, string, number],
        emjId = parsedEmoji.id || inputO.match(/\d+/g)?.[0],
        emjName = parsedEmoji.name;

      if (isInfo) {
        emj =
          client.emojis.cache.get(emjId) ||
          (!parsedEmoji.id &&
            (guild?.emojis.cache.find(({ name }) => name === emjName) ||
              guild?.emojis.cache.find(({ name }) => name.toLowerCase() === emjName.toLowerCase()))) ||
          ((await client.shard
            .broadcastEval(
              async (c, { d, g }) => {
                const cM = async (w: Collection<string, any>) => {
                    const y = (await import('discord.js'))
                      .discordSort(w)
                      .map(x => (bE.guild.id !== g?.id ? `\`${x.id}\`` : `${x}`))
                      .reverse();
                    let z = y;
                    if (z.length > 40) (z = z.slice(0, 40)).push(`\`+${y.length - z.length}\``);

                    return z.join(', ');
                  },
                  bE = c.emojis.cache.get(d) as GuildEmoji;

                return bE && [bE, bE.guild, await cM(bE.roles.cache), bE.roles.cache.size];
              },
              {
                context: {
                  d: emjId,
                  g: guild as unknown as RawGuildData,
                },
              },
            )
            .then(eA => eA.find(e => e))) as [RawGuildEmojiData, RawGuildData, string, number]);
      } else {
        const imageO = options?.getAttachment('image'),
          alphanumI = /[^\w]/g.test(inputO) && (inputO.length < 2 || inputO.length > 32 ? 'also' : 'only'),
          lengthI = inputO.length < 2 ? 'shorter' : inputO.length > 32 && 'longer';

        if (!interaction.channel) {
          return interaction.editReply({
            embeds: [embed({ type: 'error' }).setDescription(i18n.__('ERROR.DM'))],
          });
        }

        if (!memberPermissions?.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
          return interaction.editReply({
            embeds: [
              embed({ type: 'error' }).setDescription(
                i18n.__mf('PERM.REQUIRES', { perm: i18n.__('PERM.MANAGE_EMOJIS_AND_STICKERS') }),
              ),
            ],
          });
        }

        if (imageO.size > 256000) {
          return interaction.editReply({
            embeds: [embed({ type: 'error' }).setDescription(i18n.__mf('ERROR.INVALID.IMAGE.SIZE', { maxSize: 256 }))],
          });
        }

        if (alphanumI || lengthI) {
          return interaction.editReply({
            embeds: [
              embed({ type: 'error' }).setDescription(
                i18n.__mf('ERROR.INVALID.NAME.EMOJI', {
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
          .create({
            attachment: imageO.url,
            name: inputO,
            reason: `${user.tag} | ${i18n.__('EMOJI.REASON.CREATED.COMMAND')}`,
          })
          .catch(async err => {
            if (
              [
                RESTJSONErrorCodes.MaximumNumberOfAnimatedEmojisReached,
                RESTJSONErrorCodes.MaximumNumberOfEmojisReached,
              ].includes(err.code)
            ) {
              await interaction.editReply({
                embeds: [
                  embed({ type: 'error' }).setDescription(
                    i18n.__mf(
                      `ERROR.EMOJI.MAXIMUM.${
                        err.code === RESTJSONErrorCodes.MaximumNumberOfAnimatedEmojisReached ? 'ANIMATED' : 'STATIC'
                      }`,
                      { limit: emojiLimit },
                    ),
                  ),
                ],
              });
              return null;
            }
            throw err;
          });

        if (!emj) return;
      }

      const emjUnicodeURL = `https://twemoji.maxcdn.com/v/latest/72x72/`;

      if (emj) {
        emjId = (emj[0] ?? emj).id;
        emjName = (emj[0] ?? emj).name;
      }

      if (((emj as GuildEmoji)?.guild || emj?.[1])?.id !== guild?.id) {
        addBtnVsby = 2;
        editBtnVsby = 0;
      }

      if (!memberPermissions?.has(PermissionFlagsBits.ManageEmojisAndStickers)) addBtnVsby = editBtnVsby = 0;

      let emjDisplay =
          (!interaction.guild || appPermissions.has(PermissionFlagsBits.UseExternalEmojis)) && emj
            ? (emj[0] ?? emj).animated
              ? `<${(emj[0] ?? emj).identifier}> `
              : `<:${(emj[0] ?? emj).identifier}> `
            : '',
        emjCodePoint: string,
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
            embeds: [embed({ type: 'error' }).setDescription(i18n.__mf('ERROR.EMOJI.NOT_FOUND', { input: inputO }))],
          });
      }

      const emb = embed();
      if (parsedEmoji.id || emj)
        emb.addFields({ inline: true, name: `📛 ${i18n.__('GENERIC.NAME')}`, value: `\`${emjName}\`` });

      emb
        .setTitle(emjDisplay + i18n.__(`EMOJI.${isInfo ? (emjCodePoint ? 'VIEWING_UNICODE' : 'VIEWING') : 'ADDED'}`))
        .addFields({
          inline: true,
          name: `🪪 ${i18n.__(`GENERIC.${emjCodePoint ? 'CODEPOINT' : 'ID'}`)}`,
          value: `\`${emjCodePoint ?? emjId}\``,
        })
        .setThumbnail(emjURL)
        .setColor(Colors.Green)
        .setTimestamp(Date.now());

      if (emjCodePoint || parsedEmoji.id || emj) {
        emb.addFields({
          inline: true,
          name: `${emojis.mention} ${i18n.__('GENERIC.MENTION')}`,
          value: `\`${emjDisplay.trim() || `<${imageType === 'gif' ? 'a' : ''}:${emjName}:${emjId}>`}\``,
        });
      }

      if (!emjCodePoint) {
        emb.addFields({
          inline: true,
          name: `📅 ${i18n.__('GENERIC.CREATION_DATE')}`,
          value: toUTS(SnowflakeUtil.timestampFrom(emjId)),
        });
      }

      if (emj) {
        emb.addFields({
          name: `${emojis.role} ${i18n.__('GENERIC.ROLES')} [${emj[3] ?? (emj as GuildEmoji).roles?.cache.size}]`,
          value:
            (emj[2] ??
              collMap(
                (emj as GuildEmoji).roles.cache,
                (emj as GuildEmoji).guild?.id !== guild?.id ? { mapValue: 'id' } : {},
              )) ||
            '@everyone',
        });
      }

      const rows = [new ActionRowBuilder<ButtonBuilder>()];
      rows[0].addComponents(
        new ButtonBuilder()
          .setLabel(i18n.__('EMOJI.COMPONENT.LINK'))
          .setEmoji('🖼️')
          .setStyle(ButtonStyle.Link)
          .setURL(emjCodePoint ? emjURL : `${emjURL.split('?')[0]}?size=${imgOpts.size}`),
      );

      if (addBtnVsby) {
        rows[0].addComponents(
          new ButtonBuilder()
            .setLabel(i18n.__('EMOJI.COMPONENT.ADD'))
            .setEmoji('➕')
            .setStyle(ButtonStyle.Success)
            .setCustomId('emoji_edit_add')
            .setDisabled(addBtnVsby < 2),
        );
      }
      if (editBtnVsby) {
        rows[0].addComponents(
          new ButtonBuilder()
            .setLabel(i18n.__('EMOJI.COMPONENT.EDIT'))
            .setEmoji('📝')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('emoji_edit')
            .setDisabled(editBtnVsby < 2),
        );
      }

      await interaction.editReply({
        components: rows,
        embeds: [emb],
      });

      if (
        !isInfo &&
        guild.emojis.cache.filter(({ animated }) => animated === (emj as GuildEmoji).animated).size === emojiLimit
      ) {
        return interaction.followUp({
          embeds: [
            embed({ type: 'warning' }).setDescription(
              i18n.__mf(`ERROR.EMOJI.MAXIMUM_NOW.${(emj as GuildEmoji).animated ? 'ANIMATED' : 'STATIC'}`, {
                limit: emojiLimit,
              }),
            ),
          ],
          ephemeral: true,
        });
      }
    }

    if (interaction.isButton() || interaction.isSelectMenu() || interaction.isModalSubmit()) {
      const { message } = interaction;

      if (message.interaction.user.id !== user.id) {
        return interaction.reply({
          embeds: [embed({ type: 'error' }).setDescription(i18n.__('ERROR.UNALLOWED.COMMAND'))],
          ephemeral: true,
        });
      }
      const oldEmbs = message.embeds,
        emjURL = oldEmbs[0].thumbnail.url,
        emjCodePoint = getFieldValue(oldEmbs[0], i18n.__('GENERIC.CODEPOINT'))?.replaceAll('`', '');

      let { customId } = interaction,
        emb = embed({ footer: 'interacted' }),
        emjId = new URL(emjURL).pathname.split(/[/&.]/)[2],
        emj = guild?.emojis.cache.get(emjId);

      const emjDisplay = emj && appPermissions.has(PermissionFlagsBits.UseExternalEmojis) ? `${emj} ` : '',
        emjMention = emj ? `\`${emj}\`` : getFieldValue(oldEmbs[0], i18n.__('GENERIC.MENTION')),
        emjName = emj?.name ?? getFieldValue(oldEmbs[0], i18n.__('GENERIC.NAME'))?.replaceAll('`', '');

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
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel(i18n.__('EMOJI.COMPONENT.LINK'))
            .setEmoji('🖼️')
            .setStyle(ButtonStyle.Link)
            .setURL(`${emjURL.split('?')[0]}?size=${imgOpts.size}`),
        ),
      ];

      if (emjName) emb.addFields({ inline: true, name: `📛 ${i18n.__('GENERIC.NAME')}`, value: `\`${emjName}\`` });

      emb
        .setColor(Colors.Yellow)
        .setTitle(emjDisplay + i18n.__('EMOJI.EDITING'))
        .addFields({
          inline: true,
          name: `🪪 ${i18n.__(`GENERIC.${emjCodePoint ? 'CODEPOINT' : 'ID'}`)}`,
          value: `\`${emjCodePoint ?? emjId}\``,
        })
        .setThumbnail(emjURL)
        .setTimestamp(Date.now());

      if (emjMention)
        emb.addFields({ inline: true, name: `${emojis.mention} ${i18n.__('GENERIC.MENTION')}`, value: emjMention });
      if (!emjCodePoint) {
        emb.addFields({
          inline: true,
          name: `📅 ${i18n.__('GENERIC.CREATION_DATE')}`,
          value: toUTS(SnowflakeUtil.timestampFrom(emjId)),
        });
      }
      if (emj) {
        emb.addFields({
          name: `${emojis.role} ${i18n.__('GENERIC.ROLES')} [${emj.roles.cache.size}]`,
          value: collMap(emj.roles.cache, emj.guild?.id !== guild?.id ? { mapValue: 'id' } : {}) || '@everyone',
        });
      }

      switch (customId) {
        case 'emoji_edit_add':
        case 'emoji_edit_readd':
        case 'emoji_edit': {
          const isAdd = ['emoji_edit_add', 'emoji_edit_readd'].includes(customId);
          if (isAdd) {
            const isAddId = customId === 'emoji_edit_add';

            await (interaction as ButtonInteraction).update({
              components: disableComponents(message.components),
              embeds: [
                emb
                  .setTitle(
                    emjDisplay +
                      i18n.__(`EMOJI.${isAddId ? (emjCodePoint ? 'ADDING_UNICODE' : 'ADDING') : 'READDING'}`),
                  )
                  .setColor(Colors.Blue),
              ],
            });

            const emjCreate = (url: string): Promise<GuildEmoji> =>
              guild.emojis
                .create({
                  attachment: url,
                  name: emjCodePoint?.substring(0, 32).replaceAll('-', '_') || emjName || emjId,
                  reason: `${user.tag} | ${i18n.__(
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
                          i18n.__mf(
                            `ERROR.EMOJI.MAXIMUM.${
                              err.code === RESTJSONErrorCodes.MaximumNumberOfAnimatedEmojisReached
                                ? 'ANIMATED'
                                : 'STATIC'
                            }`,
                            { limit: emojiLimit },
                          ),
                        ),
                      ],
                      ephemeral: true,
                    });
                    return null;
                  }
                  throw err;
                });

            emj = await emjCreate(emjURL);
            if (!emj) return;

            emb = embed({
              footer: 'interacted',
              title: `${emj} ${i18n.__(`EMOJI.${isAddId ? (emjCodePoint ? 'ADDED_UNICODE' : 'ADDED') : 'READDED'}`)}`,
            })
              .setColor(Colors.Green)
              .setThumbnail(emj.url)
              .addFields(
                {
                  inline: true,
                  name: `📛 ${i18n.__('GENERIC.NAME')}`,
                  value: `\`${emj.name}\``,
                },
                {
                  inline: true,
                  name: `🪪 ${i18n.__('GENERIC.ID')}`,
                  value: `\`${emj.id}\``,
                },
                {
                  inline: true,
                  name: `${emojis.mention} ${i18n.__('GENERIC.MENTION')}`,
                  value: `\`${emj}\``,
                },
                {
                  inline: true,
                  name: `📅 ${i18n.__('GENERIC.CREATION_DATE')}`,
                  value: toUTS(emj.createdTimestamp),
                },
                {
                  name: `${emojis.role} ${i18n.__('GENERIC.ROLES')} [0]`,
                  value: '@everyone',
                },
              );
          }
          const opts = {
            components: [
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel(i18n.__('EMOJI.COMPONENT.VIEW'))
                  .setEmoji('🔎')
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId('emoji_view'),
                new ButtonBuilder()
                  .setLabel(i18n.__('EMOJI.COMPONENT.RENAME'))
                  .setEmoji('✏️')
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId('emoji_rename'),
                new ButtonBuilder()
                  .setLabel(i18n.__('EMOJI.COMPONENT.ROLES.EDIT'))
                  .setEmoji('📜')
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId('emoji_edit_roles'),
              ),
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel(i18n.__('EMOJI.COMPONENT.DELETE'))
                  .setEmoji('🗑️')
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId('emoji_edit_delete'),
              ),
            ],
            embeds: [emb],
          };

          await (interaction.replied ? interaction.editReply(opts) : (interaction as ButtonInteraction).update(opts));
          if (isAdd && guild.emojis.cache.filter(({ animated }) => animated === emj.animated).size === emojiLimit) {
            return interaction.followUp({
              embeds: [
                embed({ type: 'warning' }).setDescription(
                  i18n.__mf(`ERROR.EMOJI.MAXIMUM_NOW.${emj.animated ? 'ANIMATED' : 'STATIC'}`, {
                    limit: emojiLimit,
                  }),
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
            rows[0].addComponents(
              new ButtonBuilder()
                .setLabel(i18n.__('EMOJI.COMPONENT.ADD'))
                .setEmoji('➕')
                .setStyle(ButtonStyle.Success)
                .setCustomId('emoji_edit_add')
                .setDisabled(addBtnVsby < 2),
            );
          }
          if (editBtnVsby) {
            rows[0].addComponents(
              new ButtonBuilder()
                .setLabel(i18n.__('EMOJI.COMPONENT.EDIT'))
                .setEmoji('📝')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('emoji_edit')
                .setDisabled(editBtnVsby < 2),
            );
          }

          await (interaction as ButtonInteraction).update({
            components: rows,
            embeds: [emb.setTitle(emjDisplay + i18n.__('EMOJI.VIEWING')).setColor(Colors.Green)],
          });
          if (['emoji_nonexistent', 'emoji_noperm'].includes(customId)) {
            return interaction.followUp({
              embeds: [
                embed({ type: 'warning' }).setDescription(
                  customId === 'emoji_nonexistent'
                    ? i18n.__('ERROR.EMOJI.NONEXISTENT')
                    : i18n.__mf('PERM.NO_LONGER', { perm: i18n.__('PERM.MANAGE_EMOJIS_AND_STICKERS') }),
                ),
              ],
              ephemeral: true,
            });
          }
          return;
        }
        case 'emoji_edit_delete': {
          return (interaction as ButtonInteraction).update({
            components: [
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel(i18n.__('GENERIC.COMPONENT.BACK'))
                  .setEmoji('↩️')
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId('emoji_edit'),
                new ButtonBuilder()
                  .setLabel(i18n.__('GENERIC.YES'))
                  .setEmoji('✅')
                  .setStyle(ButtonStyle.Success)
                  .setCustomId('emoji_edit_delete_confirm'),
              ),
            ],
            embeds: [
              emb
                .setTitle(emjDisplay + i18n.__('EMOJI.DELETING'))
                .setDescription(i18n.__('EMOJI.DELETING_DESCRIPTION'))
                .setColor(Colors.Orange),
            ],
          });
        }
        case 'emoji_edit_delete_confirm': {
          await emj?.delete(`${user.tag} | ${i18n.__('EMOJI.REASON.DELETED')}`);

          rows[0].addComponents(
            new ButtonBuilder()
              .setLabel(i18n.__('EMOJI.COMPONENT.READD'))
              .setEmoji('➕')
              .setStyle(ButtonStyle.Success)
              .setCustomId('emoji_edit_readd'),
          );

          return (interaction as ButtonInteraction).update({
            components: rows,
            embeds: [emb.setTitle(i18n.__('EMOJI.DELETED')).setColor(Colors.Red)],
          });
        }
        case 'emoji_rename': {
          return (interaction as ButtonInteraction).showModal(
            new ModalBuilder()
              .setTitle(i18n.__('EMOJI.RENAMING'))
              .setCustomId('emoji_rename_submit')
              .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                    .setCustomId('emoji_rename_input')
                    .setLabel(i18n.__('EMOJI.RENAMING_LABEL'))
                    .setMinLength(2)
                    .setMaxLength(32)
                    .setPlaceholder(emjName)
                    .setStyle(TextInputStyle.Short),
                ),
              ),
          );
        }
        case 'emoji_rename_submit': {
          const { fields } = interaction as ModalMessageModalSubmitInteraction,
            inputF = fields.getTextInputValue('emoji_rename_input').replace(/\s/g, ''),
            alphanumI = /[^\w]/g.test(inputF) && (inputF.length < 2 || inputF.length > 32 ? 'also' : 'only'),
            lengthI = inputF.length < 2 ? 'shorter' : inputF.length > 32 && 'longer';

          if (inputF === emjName) return interaction.deferUpdate();
          if (alphanumI || lengthI) {
            return (interaction as ModalMessageModalSubmitInteraction).update({
              embeds: [
                emb
                  .setColor(Colors.Red)
                  .setTitle(emjDisplay + i18n.__('ERROR.INVALID.NAME.SHORT'))
                  .setDescription(
                    i18n.__mf('ERROR.INVALID.NAME.LONG', {
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

          emj = await emj.edit({ name: inputF, reason: `${user.tag} | ${i18n.__('EMOJI.REASON.RENAMED')}` });

          emb.spliceFields(0, 1, {
            inline: true,
            name: `📛 ${i18n.__('GENERIC.NAME')}`,
            value: `\`${emj.name}\``,
          });
          emb.spliceFields(2, 1, {
            inline: true,
            name: `${emojis.mention} ${i18n.__('GENERIC.MENTION')}`,
            value: `\`${emj}\``,
          });

          return (interaction as ModalMessageModalSubmitInteraction).update({
            embeds: [emb.setColor(Colors.Green).setTitle(emjDisplay + i18n.__('EMOJI.RENAMED'))],
          });
        }
        case 'emoji_reset_roles':
        case 'emoji_edit_roles':
        case 'emoji_edit_roles_submit': {
          let title = 'EMOJI.EDITING_ROLES';

          if (customId === 'emoji_edit_roles_submit') {
            const { values } = interaction as SelectMenuInteraction,
              roles = emj.roles.cache.map(r => r.id);

            await emj.roles.set([...values.filter(r => !roles.includes(r)), ...roles.filter(r => !values.includes(r))]);

            title = 'EMOJI.EDITED_ROLES';
            emb.spliceFields(4, 1, {
              name: `${emojis.role} ${i18n.__('GENERIC.ROLES')} [${emj.roles.cache.size}]`,
              value: collMap(emj.roles.cache, emj.guild?.id !== guild?.id ? { mapValue: 'id' } : {}) || '@everyone',
            });
          }
          if (customId === 'emoji_reset_roles') {
            await emj.roles.set([]);

            title = 'EMOJI.RESETED_ROLES';
            emb.spliceFields(4, 1, {
              name: `${emojis.role} ${i18n.__('GENERIC.ROLES')} [0]`,
              value: '@everyone',
            });
          }

          return (interaction as ButtonInteraction | SelectMenuInteraction).update({
            components: [
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel(i18n.__('GENERIC.COMPONENT.BACK'))
                  .setEmoji('↩️')
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId('emoji_edit'),
                new ButtonBuilder()
                  .setLabel(i18n.__('EMOJI.COMPONENT.RESET_ROLES'))
                  .setEmoji('🔄')
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId('emoji_reset_roles')
                  .setDisabled(!emj.roles.cache.size),
              ),
              /* new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
                new RoleSelectMenuBuilder()
                  .setPlaceholder(i18n.__('EMOJI.COMPONENT.SELECT_ROLES'))
                  .setMinValues(0)
                  .setMaxValues(25)
                  .setCustomId('emoji_edit_roles_submit'),
              ),*/
            ],
            embeds: [emb.setColor(Colors.Orange).setTitle(emjDisplay + i18n.__(title))],
          });
        }
      }
    }
  }
}
