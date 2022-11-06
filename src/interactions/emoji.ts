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
  RoleSelectMenuBuilder,
  RoleSelectMenuInteraction,
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
    const { client, embed, localize } = args,
      { database } = client,
      { appPermissions, guild, memberPermissions, user } = interaction,
      settings = await database.users.fetch(user.id),
      isEphemeral = settings?.ephemeralResponses,
      emojiLimit = premiumLimits[guild.premiumTier].emojis;

    let addBtnVsby = 0,
      editBtnVsby = 2;

    if (interaction.isChatInputCommand()) {
      const { options } = interaction;

      await interaction.deferReply({ ephemeral: isEphemeral });

      const isInfo = options.getSubcommand() === 'info',
        inputO = isInfo ? options.getString('emoji') : options.getString('name'),
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
        const imageO = options.getAttachment('image'),
          alphanumI = /[^\w]/g.test(inputO) && (inputO.length < 2 || inputO.length > 32 ? 'also' : 'only'),
          lengthI = inputO.length < 2 ? 'shorter' : inputO.length > 32 && 'longer';

        if (!interaction.channel) {
          return interaction.editReply({
            embeds: [embed({ type: 'error' }).setDescription(localize('ERROR.DM'))],
          });
        }

        if (!memberPermissions?.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
          return interaction.editReply({
            embeds: [
              embed({ type: 'error' }).setDescription(
                localize('PERM.REQUIRES', { perm: localize('PERM.MANAGE_EMOJIS_AND_STICKERS') }),
              ),
            ],
          });
        }

        if (imageO.size > 256000) {
          return interaction.editReply({
            embeds: [embed({ type: 'error' }).setDescription(localize('ERROR.INVALID.IMAGE.SIZE', { maxSize: 256 }))],
          });
        }

        if (alphanumI || lengthI) {
          return interaction.editReply({
            embeds: [
              embed({ type: 'error' }).setDescription(
                localize('ERROR.INVALID.NAME.EMOJI', {
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
            reason: `${user.tag} | ${localize('EMOJI.REASON.CREATED.COMMAND')}`,
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
                    localize(
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
            embeds: [embed({ type: 'error' }).setDescription(localize('ERROR.EMOJI.NOT_FOUND', { input: inputO }))],
          });
      }

      const emb = embed();
      if (parsedEmoji.id || emj)
        emb.addFields({ inline: true, name: `📛 ${localize('GENERIC.NAME')}`, value: `\`${emjName}\`` });

      emb
        .setTitle(emjDisplay + localize(`EMOJI.${isInfo ? (emjCodePoint ? 'VIEWING_UNICODE' : 'VIEWING') : 'ADDED'}`))
        .addFields({
          inline: true,
          name: `🪪 ${localize(`GENERIC.${emjCodePoint ? 'CODEPOINT' : 'ID'}`)}`,
          value: `\`${emjCodePoint ?? emjId}\``,
        })
        .setThumbnail(emjURL)
        .setColor(Colors.Green)
        .setTimestamp(Date.now());

      if (emjCodePoint || parsedEmoji.id || emj) {
        emb.addFields({
          inline: true,
          name: `${emojis.mention} ${localize('GENERIC.MENTION')}`,
          value: `\`${emjDisplay.trim() || `<${imageType === 'gif' ? 'a' : ''}:${emjName}:${emjId}>`}\``,
        });
      }

      if (!emjCodePoint) {
        emb.addFields({
          inline: true,
          name: `📅 ${localize('GENERIC.CREATION_DATE')}`,
          value: toUTS(SnowflakeUtil.timestampFrom(emjId)),
        });
      }

      if (emj) {
        emb.addFields({
          name: `${emojis.role} ${localize('GENERIC.ROLES.ROLES')} [${
            emj[3] ?? (emj as GuildEmoji).roles?.cache.size
          }]`,
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
          .setLabel(localize('EMOJI.COMPONENT.LINK'))
          .setEmoji('🖼️')
          .setStyle(ButtonStyle.Link)
          .setURL(emjCodePoint ? emjURL : `${emjURL.split('?')[0]}?size=${imgOpts.size}`),
      );

      if (addBtnVsby) {
        rows[0].addComponents(
          new ButtonBuilder()
            .setLabel(localize('EMOJI.COMPONENT.ADD'))
            .setEmoji('➕')
            .setStyle(ButtonStyle.Success)
            .setCustomId('emoji_edit_add')
            .setDisabled(addBtnVsby < 2),
        );
      }
      if (editBtnVsby) {
        rows[0].addComponents(
          new ButtonBuilder()
            .setLabel(localize('GENERIC.EDIT'))
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
              localize(`ERROR.EMOJI.MAXIMUM_NOW.${(emj as GuildEmoji).animated ? 'ANIMATED' : 'STATIC'}`, {
                limit: emojiLimit,
              }),
            ),
          ],
          ephemeral: true,
        });
      }
    }

    if (interaction.isButton() || interaction.isModalSubmit() || interaction.isRoleSelectMenu()) {
      const { message } = interaction;

      if (message.interaction.user.id !== user.id) {
        return interaction.reply({
          embeds: [embed({ type: 'error' }).setDescription(localize('ERROR.UNALLOWED.COMMAND'))],
          ephemeral: true,
        });
      }
      const oldEmbs = message.embeds,
        emjURL = oldEmbs[0].thumbnail.url,
        emjCodePoint = getFieldValue(oldEmbs[0], localize('GENERIC.CODEPOINT'))?.replaceAll('`', '');

      let { customId } = interaction,
        emb = embed({ footer: 'interacted' }),
        emjId = new URL(emjURL).pathname.split(/[/&.]/)[2],
        emj = guild?.emojis.cache.get(emjId);

      const emjDisplay = emj && appPermissions.has(PermissionFlagsBits.UseExternalEmojis) ? `${emj} ` : '',
        emjMention = emj ? `\`${emj}\`` : getFieldValue(oldEmbs[0], localize('GENERIC.MENTION')),
        emjName = emj?.name ?? getFieldValue(oldEmbs[0], localize('GENERIC.NAME'))?.replaceAll('`', '');

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

      const rows: ActionRowBuilder<ButtonBuilder | RoleSelectMenuBuilder>[] = [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel(localize('EMOJI.COMPONENT.LINK'))
            .setEmoji('🖼️')
            .setStyle(ButtonStyle.Link)
            .setURL(`${emjURL.split('?')[0]}?size=${imgOpts.size}`),
        ),
      ];

      if (emjName) emb.addFields({ inline: true, name: `📛 ${localize('GENERIC.NAME')}`, value: `\`${emjName}\`` });

      emb
        .setColor(Colors.Yellow)
        .setTitle(emjDisplay + localize('EMOJI.EDITING'))
        .addFields({
          inline: true,
          name: `🪪 ${localize(`GENERIC.${emjCodePoint ? 'CODEPOINT' : 'ID'}`)}`,
          value: `\`${emjCodePoint ?? emjId}\``,
        })
        .setThumbnail(emjURL)
        .setTimestamp(Date.now());

      if (emjMention)
        emb.addFields({ inline: true, name: `${emojis.mention} ${localize('GENERIC.MENTION')}`, value: emjMention });
      if (!emjCodePoint) {
        emb.addFields({
          inline: true,
          name: `📅 ${localize('GENERIC.CREATION_DATE')}`,
          value: toUTS(SnowflakeUtil.timestampFrom(emjId)),
        });
      }
      if (emj) {
        emb.addFields({
          name: `${emojis.role} ${localize('GENERIC.ROLES.ROLES')} [${emj.roles.cache.size}]`,
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
                    `${emojis.loading} EMOJI.${isAddId ? (emjCodePoint ? 'ADDING_UNICODE' : 'ADDING') : 'READDING'}`,
                  )
                  .setColor(Colors.Blurple),
              ],
            });

            const emjCreate = (url: string): Promise<GuildEmoji> =>
              guild.emojis
                .create({
                  attachment: url,
                  name: emjCodePoint?.substring(0, 32).replaceAll('-', '_') || emjName || emjId,
                  reason: `${user.tag} | ${localize(
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
                          localize(
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
              title: `${emj} ${localize(`EMOJI.${isAddId ? (emjCodePoint ? 'ADDED_UNICODE' : 'ADDED') : 'READDED'}`)}`,
            })
              .setColor(Colors.Green)
              .setThumbnail(emj.url)
              .addFields(
                {
                  inline: true,
                  name: `📛 ${localize('GENERIC.NAME')}`,
                  value: `\`${emj.name}\``,
                },
                {
                  inline: true,
                  name: `🪪 ${localize('GENERIC.ID')}`,
                  value: `\`${emj.id}\``,
                },
                {
                  inline: true,
                  name: `${emojis.mention} ${localize('GENERIC.MENTION')}`,
                  value: `\`${emj}\``,
                },
                {
                  inline: true,
                  name: `📅 ${localize('GENERIC.CREATION_DATE')}`,
                  value: toUTS(emj.createdTimestamp),
                },
                {
                  name: `${emojis.role} ${localize('GENERIC.ROLES.ROLES')} [0]`,
                  value: '@everyone',
                },
              );
          }
          const opts = {
            components: [
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel(localize('GENERIC.VIEW'))
                  .setEmoji('🔎')
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId('emoji_view'),
                new ButtonBuilder()
                  .setLabel(localize('GENERIC.RENAME'))
                  .setEmoji('✏️')
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId('emoji_rename'),
                new ButtonBuilder()
                  .setLabel(localize('GENERIC.ROLES.EDIT'))
                  .setEmoji('📜')
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId('emoji_edit_roles'),
              ),
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel(localize('GENERIC.DELETE'))
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
                  localize(`ERROR.EMOJI.MAXIMUM_NOW.${emj.animated ? 'ANIMATED' : 'STATIC'}`, {
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
                .setLabel(localize('EMOJI.COMPONENT.ADD'))
                .setEmoji('➕')
                .setStyle(ButtonStyle.Success)
                .setCustomId('emoji_edit_add')
                .setDisabled(addBtnVsby < 2),
            );
          }
          if (editBtnVsby) {
            rows[0].addComponents(
              new ButtonBuilder()
                .setLabel(localize('GENERIC.EDIT'))
                .setEmoji('📝')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('emoji_edit')
                .setDisabled(editBtnVsby < 2),
            );
          }

          await (interaction as ButtonInteraction).update({
            components: rows,
            embeds: [emb.setTitle(emjDisplay + localize('EMOJI.VIEWING')).setColor(Colors.Green)],
          });
          if (['emoji_nonexistent', 'emoji_noperm'].includes(customId)) {
            return interaction.followUp({
              embeds: [
                embed({ type: 'warning' }).setDescription(
                  customId === 'emoji_nonexistent'
                    ? localize('ERROR.EMOJI.NONEXISTENT')
                    : localize('PERM.NO_LONGER', { perm: localize('PERM.MANAGE_EMOJIS_AND_STICKERS') }),
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
                  .setLabel(localize('GENERIC.BACK'))
                  .setEmoji('↩️')
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId('emoji_edit'),
                new ButtonBuilder()
                  .setLabel(localize('GENERIC.YES'))
                  .setEmoji('✅')
                  .setStyle(ButtonStyle.Success)
                  .setCustomId('emoji_edit_delete_confirm'),
              ),
            ],
            embeds: [
              emb
                .setTitle(emjDisplay + localize('EMOJI.DELETING'))
                .setDescription(localize('EMOJI.DELETING_DESCRIPTION'))
                .setColor(Colors.Orange),
            ],
          });
        }
        case 'emoji_edit_delete_confirm': {
          await emj?.delete(`${user.tag} | ${localize('EMOJI.REASON.DELETED')}`);

          rows[0].addComponents(
            new ButtonBuilder()
              .setLabel(localize('EMOJI.COMPONENT.READD'))
              .setEmoji('➕')
              .setStyle(ButtonStyle.Success)
              .setCustomId('emoji_edit_readd'),
          );

          return (interaction as ButtonInteraction).update({
            components: rows,
            embeds: [emb.setTitle(localize('EMOJI.DELETED')).setColor(Colors.Red)],
          });
        }
        case 'emoji_rename': {
          return (interaction as ButtonInteraction).showModal(
            new ModalBuilder()
              .setTitle(localize('EMOJI.RENAMING'))
              .setCustomId('emoji_rename_submit')
              .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                    .setCustomId('emoji_rename_input')
                    .setLabel(localize('EMOJI.RENAMING_LABEL'))
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
            return (interaction as ModalMessageModalSubmitInteraction).reply({
              embeds: [
                embed({ type: 'error' }).setDescription(
                  localize('ERROR.INVALID.NAME', {
                    alphanum: alphanumI,
                    condition: lengthI,
                    input: inputF,
                    maxLength: 32,
                    minLength: 2,
                  }),
                ),
              ],
              ephemeral: true,
            });
          }

          emj = await emj.edit({ name: inputF, reason: `${user.tag} | ${localize('EMOJI.REASON.RENAMED')}` });

          emb.spliceFields(0, 1, {
            inline: true,
            name: `📛 ${localize('GENERIC.NAME')}`,
            value: `\`${emj.name}\``,
          });
          emb.spliceFields(2, 1, {
            inline: true,
            name: `${emojis.mention} ${localize('GENERIC.MENTION')}`,
            value: `\`${emj}\``,
          });

          return (interaction as ModalMessageModalSubmitInteraction).update({
            embeds: [emb.setColor(Colors.Green).setTitle(emjDisplay + localize('EMOJI.RENAMED'))],
          });
        }
        case 'emoji_add_roles':
        case 'emoji_add_roles_submit':
        case 'emoji_edit_roles':
        case 'emoji_remove_roles':
        case 'emoji_remove_roles_submit':
        case 'emoji_reset_roles': {
          const isEdit = customId === 'emoji_edit_roles',
            isRemove =
              !customId.startsWith('emoji_add_roles') &&
              (message.components.at(-1).components.at(-1).customId === 'emoji_remove_roles_submit' ||
                customId.startsWith('emoji_remove_roles')),
            isSubmit = customId.endsWith('_submit');
          let changedCount: number, title: string;

          if (isSubmit) {
            const { roles } = interaction as RoleSelectMenuInteraction<'cached'>,
              emjRoles = emj.roles.cache;

            if (isRemove) {
              emj = await emj.roles.remove(roles);
              changedCount = emjRoles.size - emj.roles.cache.size;
              title = localize('GENERIC.ROLES.REMOVING', {
                count: changedCount,
              });
            } else {
              emj = await emj.roles.add(roles);
              changedCount = emj.roles.cache.size - emjRoles.size;
              title = localize('GENERIC.ROLES.ADDING', {
                count: changedCount,
              });
            }

            emb.spliceFields(4, 1, {
              name: `${emojis.role} ${localize('GENERIC.ROLES.ROLES')} [${emj.roles.cache.size}]`,
              value: collMap(emj.roles.cache) || '@everyone',
            });
          } else if (customId === 'emoji_reset_roles') {
            emj = await emj.roles.set([]);
            title = localize('GENERIC.ROLES.RESET');
            emb.spliceFields(4, 1, {
              name: `${emojis.role} ${localize('GENERIC.ROLES.ROLES')} [0]`,
              value: '@everyone',
            });
          } else {
            title = isEdit
              ? localize('GENERIC.ROLES.EDIT')
              : localize(isRemove ? 'GENERIC.ROLES.REMOVING' : 'GENERIC.ROLES.ADDING', { count: 0 });
          }

          return (interaction as ButtonInteraction | RoleSelectMenuInteraction).update({
            components: [
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel(localize('GENERIC.BACK'))
                  .setEmoji('↩️')
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId('emoji_edit'),
                new ButtonBuilder()
                  .setLabel(localize('GENERIC.ROLES.RESET'))
                  .setEmoji('🔄')
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId('emoji_reset_roles')
                  .setDisabled(!emj.roles.cache.size),
              ),
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel(localize('GENERIC.ROLES.ADD'))
                  .setEmoji('➕')
                  .setStyle(ButtonStyle.Success)
                  .setCustomId('emoji_add_roles')
                  .setDisabled(!isEdit && !isRemove),
                new ButtonBuilder()
                  .setLabel(localize('GENERIC.ROLES.REMOVE'))
                  .setEmoji('➖')
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId('emoji_remove_roles')
                  .setDisabled((!isEdit && isRemove) || !emj.roles.cache.size),
              ),
              new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
                new RoleSelectMenuBuilder()
                  .setPlaceholder(
                    localize(
                      isEdit
                        ? 'GENERIC.ROLES.SELECT.DEFAULT'
                        : isRemove
                        ? 'GENERIC.ROLES.SELECT.REMOVE'
                        : 'GENERIC.ROLES.SELECT.ADD',
                    ),
                  )
                  .setMinValues(1)
                  .setMaxValues(25)
                  .setCustomId(isRemove ? 'emoji_remove_roles_submit' : 'emoji_add_roles_submit')
                  .setDisabled(isEdit || (isRemove && !emj.roles.cache.size)),
              ),
            ],
            embeds: [
              emb
                .setColor(changedCount ? (isRemove ? Colors.Red : Colors.Green) : Colors.Orange)
                .setTitle(emjDisplay + title),
            ],
          });
        }
      }
    }
  }
}
