import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import tc from 'tinycolor2';
import { colors, botOwners, imgOpts } from '../defaults.js';
import { isValidImage } from '../utils.js';

export const data = [
  {
    description: 'Echoes a message from the bot (Requires: Manage messages if non-ephemeral)',
    description_localizations: { 'pt-BR': 'Ecoa uma mensagem do bot (Requer: Gerenciar mensagens caso não efemêra)' },
    name: 'echo',
    name_localizations: { 'pt-BR': 'ecoar' },
    options: [
      {
        description: 'The content of the message (Required if embed is disabled)',
        description_localizations: { 'pt-BR': 'O conteúdo da mensagem (Necessário caso o embed esteja desativado)' },
        name: 'content',
        name_localizations: { 'pt-BR': 'conteúdo' },
        type: ApplicationCommandOptionType.String,
      },
      {
        description: 'The description of the embed (Enables embed)',
        description_localizations: { 'pt-BR': 'A descrição do embed (Ativa o embed)' },
        name: 'description',
        name_localizations: { 'pt-BR': 'descrição' },
        type: ApplicationCommandOptionType.String,
      },
      {
        description: 'The title of the embed (Enables embed)',
        description_localizations: { 'pt-BR': 'O título do embed (Ativa o embed)' },
        name: 'title',
        name_localizations: { 'pt-BR': 'título' },
        type: ApplicationCommandOptionType.String,
      },
      {
        description: "The title's URL of the embed",
        description_localizations: { 'pt-BR': 'O URL do título do embed' },
        name: 'url',
        name_localizations: {},
        type: ApplicationCommandOptionType.String,
      },
      {
        description: "The color of the embed (Default: Author's display color)",
        description_localizations: { 'pt-BR': 'A cor do embed (Padrão: Cor de exibição do autor)' },
        name: 'color',
        name_localizations: { 'pt-BR': 'cor' },
        type: ApplicationCommandOptionType.String,
      },
      {
        description: 'Set an author of the embed (Enables embed)',
        description_localizations: { 'pt-BR': 'O autor do embed (Ativa o embed)' },
        name: 'author',
        name_localizations: { 'pt-BR': 'autor' },
        type: ApplicationCommandOptionType.User,
      },
      {
        description: 'The footer of the embed (Enables embed)',
        description_localizations: { 'pt-BR': 'O rodapé do embed (Ativa o embed)' },
        name: 'footer',
        name_localizations: { 'pt-BR': 'rodapé' },
        type: ApplicationCommandOptionType.String,
      },
      {
        description: 'Enables or disabled the timestamp on the embed (Default: Disabled)',
        description_localizations: { 'pt-BR': 'Ativa ou desativa o timestamp no embed (Padrão: Desativado)' },
        name: 'timestamp',
        name_localizations: {},
        type: ApplicationCommandOptionType.Boolean,
      },
      {
        description: 'An attachment for the message',
        description_localizations: { 'pt-BR': 'Um anexo para a messagem' },
        name: 'attachment',
        name_localizations: { 'pt-BR': 'anexo' },
        type: ApplicationCommandOptionType.Attachment,
      },
      {
        description: 'The image of the embed (Enables embed)',
        description_localizations: { 'pt-BR': 'A imagem do embed (Ativa o embed)' },
        name: 'image',
        name_localizations: { 'pt-BR': 'imagem' },
        type: ApplicationCommandOptionType.Attachment,
      },
      {
        description: 'The thumbnail of the embed (Enables embed)',
        description_localizations: { 'pt-BR': 'A miniatura do embed (Ativa o embed)' },
        name: 'thumbnail',
        name_localizations: { 'pt-BR': 'miniatura' },
        type: ApplicationCommandOptionType.Attachment,
      },
      {
        description: 'Echoes the message in TTS (Default: False)',
        description_localizations: { 'pt-BR': 'Ecoa a mensagem em TTS (Padrão: Falso)' },
        name: 'tts',
        name_localizations: {},
        type: ApplicationCommandOptionType.Boolean,
      },
      {
        channel_types: [
          ChannelType.GuildText,
          ChannelType.GuildNews,
          ChannelType.GuildNewsThread,
          ChannelType.GuildPublicThread,
          ChannelType.GuildPrivateThread,
        ],
        description: 'Echoes at a channel as a message (Default: Invoked channel as a reply)',
        description_localizations: {
          'pt-BR': 'Ecoa em um canal como uma mensagem (Padrão: O canal invocado como uma resposta)',
        },
        name: 'channel',
        name_localizations: { 'pt-BR': 'canal' },
        type: ApplicationCommandOptionType.Channel,
      },
      {
        description: 'Send reply as an ephemeral message (Default: True)',
        description_localizations: { 'pt-BR': 'Envia a resposta como uma mensagem efêmera (Padrão: Verdadeiro)' },
        name: 'ephemeral',
        name_localizations: { 'pt-BR': 'efêmero' },
        type: ApplicationCommandOptionType.Boolean,
      },
    ],
  },
];
export async function execute({ client, embed, interaction, st }) {
  const { member, memberPermissions, options, user } = interaction,
    contentO = options?.getString('content')?.replaceAll('\\n', '\n').trim(),
    descriptionO = options?.getString('description')?.replaceAll('\\n', '\n').trim(),
    titleO = options?.getString('title'),
    urlO = options?.getString('url'),
    authorO = options?.getUser('author'),
    memberO = options?.getMember('author'),
    footerO = options?.getString('footer'),
    timestampO = options?.getBoolean('timestamp'),
    attachmentO = options?.getAttachment('attachment'),
    imageO = options?.getAttachment('image'),
    thumbnailO = options?.getAttachment('thumbnail'),
    colorO = tc(options?.getString('color')).isValid()
      ? tc(options?.getString('color')).toHex()
      : (memberO ?? member)?.displayColor ?? colors.blurple,
    ttsO = options?.getBoolean('tts'),
    channelO = options?.getChannel('channel'),
    ephemeralO = options?.getBoolean('ephemeral') ?? true;

  if (interaction.isChatInputCommand()) {
    const enableEmbed = descriptionO || titleO || authorO || footerO || imageO || thumbnailO;

    if (
      !memberPermissions?.has(PermissionFlagsBits.ManageMessages) &&
      !botOwners.includes(user.id) &&
      (ephemeralO === false || channelO) &&
      interaction.inGuild()
    ) {
      return interaction.reply({
        embeds: [
          embed({ type: 'error' }).setDescription(
            st.__mf('ECHO.INSUFFICIENT.PERMS', { perm: st.__('PERM.MANAGE_MESSAGES') }),
          ),
        ],
        ephemeral: true,
      });
    }

    if ((imageO && !isValidImage(imageO.contentType)) || (thumbnailO && !isValidImage(thumbnailO.contentType))) {
      return interaction.reply({
        embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.INVALID.IMAGE.TYPE'))],
        ephemeral: true,
      });
    }

    if (!contentO && !enableEmbed) {
      return interaction.reply({
        embeds: [embed({ type: 'error' }).setDescription(st.__('ECHO.INSUFFICIENT.ARGS'))],
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: ephemeralO });

    const eEmb = new EmbedBuilder().setColor(colorO),
      eMsg = {
        files: attachmentO
          ? [
              {
                attachment: attachmentO.attachment,
                name: attachmentO.name,
              },
            ]
          : [],
      },
      rows = !ephemeralO
        ? [
            new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                .setEmoji('🧹')
                .setStyle(ButtonStyle.Danger)
                .setCustomId('generic_message_delete'),
            ]),
          ]
        : [];

    if (contentO) eMsg.content = contentO;
    if (ttsO) eMsg.tts = ttsO;

    if (enableEmbed) {
      if (authorO) {
        eEmb.setAuthor({
          iconURL: (memberO ?? authorO).displayAvatarURL(imgOpts),
          name: memberO?.displayName ?? authorO.username,
        });
      }
      if (descriptionO) eEmb.setDescription(descriptionO);
      if (titleO) eEmb.setTitle(titleO);
      if (urlO) eEmb.setURL(urlO);
      if (footerO) eEmb.setFooter({ text: footerO });
      if (timestampO) eEmb.setTimestamp(Date.now());
      if (imageO) eEmb.setImage(imageO.attachment);
      if (thumbnailO) eEmb.setThumbnail(thumbnailO.attachment);

      eMsg.embeds = [eEmb];
    }

    if (channelO) {
      if (!channelO.permissionsFor(client.user).has(PermissionFlagsBits.SendMessages)) {
        return interaction.editReply({
          components: rows,
          embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.CANNOT_SEND_CHANNEL_MESSAGES'))],
        });
      }

      const msg = await channelO.send(eMsg);
      return interaction.editReply({
        components: rows,
        embeds: [
          embed({ title: st.__('ECHO.SENT'), type: 'success' })
            .setDescription(st.__mf('ECHO.GO_TO', { msgURL: msg.url }))
            .addFields([
              {
                name: st.__('GENERIC.CHANNEL'),
                value: `${channelO} - \`${channelO.id}\``,
              },
            ]),
        ],
      });
    }

    return interaction.editReply(eMsg);
  }
}
