import {
  ApplicationCommandOptionType,
  BaseInteraction,
  ChannelType,
  Colors,
  EmbedBuilder,
  GuildTextBasedChannel,
  PermissionFlagsBits,
  MessageCreateOptions,
} from 'discord.js';
import tc from 'tinycolor2';
import { Command, CommandArgs } from '../../lib/structures/Command.js';
import { botOwners, imgOpts } from '../defaults.js';
import { isValidImage } from '../utils.js';

export default class Echo extends Command {
  constructor() {
    super([
      {
        description: 'ECHO.DESCRIPTION',
        name: 'ECHO.NAME',
        options: [
          {
            description: 'ECHO.OPTIONS.CONTENT.DESCRIPTION',
            name: 'ECHO.OPTIONS.CONTENT.NAME',
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'ECHO.OPTIONS.DESCRIPTION.DESCRIPTION',
            name: 'ECHO.OPTIONS.DESCRIPTION.NAME',
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'ECHO.OPTIONS.TITLE.DESCRIPTION',
            name: 'ECHO.OPTIONS.TITLE.NAME',
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'ECHO.OPTIONS.URL.DESCRIPTION',
            name: 'ECHO.OPTIONS.URL.NAME',
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'ECHO.OPTIONS.COLOR.DESCRIPTION',
            name: 'ECHO.OPTIONS.COLOR.NAME',
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'ECHO.OPTIONS.AUTHOR.DESCRIPTION',
            name: 'ECHO.OPTIONS.AUTHOR.NAME',
            type: ApplicationCommandOptionType.User,
          },
          {
            description: 'ECHO.OPTIONS.FOOTER.DESCRIPTION',
            name: 'ECHO.OPTIONS.FOOTER.NAME',
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'ECHO.OPTIONS.TIMESTAMP.DESCRIPTION',
            name: 'ECHO.OPTIONS.TIMESTAMP.NAME',
            type: ApplicationCommandOptionType.Boolean,
          },
          {
            description: 'ECHO.OPTIONS.ATTACHMENT.DESCRIPTION',
            name: 'ECHO.OPTIONS.ATTACHMENT.NAME',
            type: ApplicationCommandOptionType.Attachment,
          },
          {
            description: 'ECHO.OPTIONS.IMAGE.DESCRIPTION',
            name: 'ECHO.OPTIONS.IMAGE.NAME',
            type: ApplicationCommandOptionType.Attachment,
          },
          {
            description: 'ECHO.OPTIONS.THUMBNAIL.DESCRIPTION',
            name: 'ECHO.OPTIONS.THUMBNAIL.NAME',
            type: ApplicationCommandOptionType.Attachment,
          },
          {
            description: 'ECHO.OPTIONS.TTS.DESCRIPTION',
            name: 'ECHO.OPTIONS.TTS.NAME',
            type: ApplicationCommandOptionType.Boolean,
          },
          {
            channelTypes: [
              ChannelType.GuildText,
              ChannelType.GuildNews,
              ChannelType.GuildNewsThread,
              ChannelType.GuildPublicThread,
              ChannelType.GuildPrivateThread,
              ChannelType.GuildVoice,
            ],
            description: 'ECHO.OPTIONS.CHANNEL.DESCRIPTION',
            name: 'ECHO.OPTIONS.CHANNEL.NAME',
            type: ApplicationCommandOptionType.Channel,
          },
        ],
      },
    ]);
  }

  async run(args: CommandArgs, interaction: BaseInteraction<'cached'>): Promise<any> {
    if (!interaction.isChatInputCommand()) return;

    const { client, embed } = args,
      { i18n } = client,
      { member, memberPermissions, options, user } = interaction,
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
        : (memberO ?? member)?.displayColor ?? Colors.Blurple,
      ttsO = options?.getBoolean('tts'),
      channelO = options?.getChannel('channel') as GuildTextBasedChannel,
      ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (interaction.isChatInputCommand()) {
      const enableEmbed = descriptionO || titleO || authorO || footerO || imageO || thumbnailO;

      if (
        !memberPermissions?.has(PermissionFlagsBits.ManageMessages) &&
        !botOwners.includes(user.id) &&
        (ephemeralO === false || channelO) &&
        interaction.guild
      ) {
        return interaction.reply({
          embeds: [
            embed({ type: 'error' }).setDescription(
              i18n.__mf('ECHO.INSUFFICIENT.PERMS', { perm: i18n.__('PERM.MANAGE_MESSAGES') }),
            ),
          ],
          ephemeral: true,
        });
      }

      if ((imageO && !isValidImage(imageO.contentType)) || (thumbnailO && !isValidImage(thumbnailO.contentType))) {
        return interaction.reply({
          embeds: [embed({ type: 'error' }).setDescription(i18n.__('ERROR.INVALID.IMAGE.TYPE'))],
          ephemeral: true,
        });
      }

      if (!contentO && !enableEmbed) {
        return interaction.reply({
          embeds: [embed({ type: 'error' }).setDescription(i18n.__('ECHO.INSUFFICIENT.ARGS'))],
          ephemeral: true,
        });
      }

      await interaction.deferReply({ ephemeral: ephemeralO });

      const eEmb = new EmbedBuilder().setColor(colorO),
        eMsg = {
          files: attachmentO
            ? [
                {
                  attachment: attachmentO.url,
                  name: attachmentO.name,
                },
              ]
            : [],
        } as MessageCreateOptions;

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
        if (imageO) eEmb.setImage(imageO.url);
        if (thumbnailO) eEmb.setThumbnail(thumbnailO.url);

        eMsg.embeds = [eEmb];
      }

      if (channelO) {
        if (!channelO.permissionsFor(client.user).has(PermissionFlagsBits.SendMessages)) {
          return interaction.editReply({
            embeds: [embed({ type: 'error' }).setDescription(i18n.__('ERROR.CANNOT_SEND_CHANNEL_MESSAGES'))],
          });
        }

        const msg = await channelO.send(eMsg);
        return interaction.editReply({
          embeds: [
            embed({ title: i18n.__('ECHO.SENT'), type: 'success' })
              .setDescription(i18n.__mf('ECHO.GO_TO', { msgURL: msg.url }))
              .addFields({
                name: i18n.__('GENERIC.CHANNEL'),
                value: `${channelO} - \`${channelO.id}\``,
              }),
          ],
        });
      }

      return interaction.editReply(eMsg);
    }
  }
}
