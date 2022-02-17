import {
  ActionRow,
  ApplicationCommandOptionType,
  ButtonComponent,
  ButtonStyle,
  Embed,
  PermissionFlagsBits,
} from 'discord.js';
import tc from 'tinycolor2';
import { colors, botOwners, imgOpts } from '../defaults.js';

export const data = [
  {
    description: 'Echoes a message from the bot (Requires: Manage messages on specified channel)',
    name: 'echo',
    options: [
      {
        description: 'The content of the message (Required if no embed)',
        name: 'content',
        type: ApplicationCommandOptionType.String,
      },
      {
        description: 'The description of the embed (Required if no content)',
        name: 'description',
        type: ApplicationCommandOptionType.String,
      },
      {
        description: 'The title of the embed',
        name: 'title',
        type: ApplicationCommandOptionType.String,
      },
      {
        description: "The title's url of the embed",
        name: 'url',
        type: ApplicationCommandOptionType.String,
      },
      {
        description: "The color of the embed (Default: Author's display color)",
        name: 'color',
        type: ApplicationCommandOptionType.String,
      },
      {
        description: 'Set an author of the embed',
        name: 'author',
        type: ApplicationCommandOptionType.User,
      },
      {
        description: 'The footer of the embed',
        name: 'footer',
        type: ApplicationCommandOptionType.String,
      },
      {
        description: 'Enables or disabled the timestamp on the embed (Default: Disabled)',
        name: 'timestamp',
        type: ApplicationCommandOptionType.Boolean,
      },
      {
        description: 'The image link of the embed',
        name: 'image',
        type: ApplicationCommandOptionType.String,
      },
      {
        description: 'The thumbnail link of the embed',
        name: 'thumbnail',
        type: ApplicationCommandOptionType.String,
      },
      {
        description: 'Echoes the message in TTS (Default: False)',
        name: 'tts',
        type: ApplicationCommandOptionType.Boolean,
      },
      {
        description: 'Echoes at a channel as a message (Default: Interaction channel as a reply)',
        name: 'channel',
        type: ApplicationCommandOptionType.String,
      },
      {
        description: 'Send reply as an ephemeral message (Default: True)',
        name: 'ephemeral',
        type: ApplicationCommandOptionType.Boolean,
      },
    ],
  },
];
export async function execute({ client, interaction, st, embed }) {
  const { user, member, memberPermissions, guild, options } = interaction,
    contentO = options?.getString('content'),
    descriptionO = options?.getString('description'),
    titleO = options?.getString('title'),
    urlO = options?.getString('url'),
    authorO = options?.getUser('author'),
    memberO = options?.getMember('author'),
    footerO = options?.getString('footer'),
    timestampO = options?.getBoolean('timestamp'),
    imageO = options?.getString('image'),
    thumbnailO = options?.getString('thumbnail'),
    colorO = tc(options?.getString('color')).isValid()
      ? tc(options?.getString('color')).toHex()
      : (memberO ?? member)?.displayColor ?? colors.blurple,
    ttsO = options?.getBoolean('tts') ?? false,
    channelO = options?.getString('channel')?.replace(/[<#>]/g, ''),
    ephemeralO = options?.getBoolean('ephemeral') ?? true;

  if (
    !memberPermissions?.has(PermissionFlagsBits.ManageMessages) &&
    !botOwners.includes(user.id) &&
    (ephemeralO === false || channelO) &&
    interaction.inGuild()
  ) {
    return interaction.reply({
      embeds: [
        embed({ type: 'error' }).setDescription("You don't have `MANAGE_MESSAGES` permission to echo non-ephemeraly"),
      ],
      ephemeral: true,
    });
  }

  if (!contentO && !descriptionO) {
    return interaction.reply({
      embeds: [
        embed({ type: 'error' }).setDescription(
          'You need to provide a content for the message or a description for the embed',
        ),
      ],
      ephemeral: true,
    });
  }

  if (interaction.isChatInputCommand()) {
    await interaction.deferReply({ ephemeral: ephemeralO });

    const eEmb = new Embed().setColor(colorO),
      eMsg = {},
      rows = !ephemeralO
        ? [
            new ActionRow().addComponents(
              new ButtonComponent()
                .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                .setEmoji({ name: '🧹' })
                .setStyle(ButtonStyle.Danger)
                .setCustomId('generic_message_delete'),
            ),
          ]
        : [];

    if (authorO) {
      eEmb.setAuthor({
        iconURL: (memberO ?? authorO).displayAvatarURL(imgOpts),
        name: memberO?.displayName ?? authorO.username,
      });
    }

    if (titleO) eEmb.setTitle(titleO);
    if (urlO) eEmb.setURL(urlO);
    if (footerO) eEmb.setFooter({ name: footerO });
    if (timestampO) eEmb.setTimestamp(Date.now());
    if (imageO) eEmb.setImage(imageO);
    if (thumbnailO) eEmb.setThumbnail(thumbnailO);
    if (contentO) eMsg.content = contentO;
    if (descriptionO) eMsg.embeds = [eEmb.setDescription(descriptionO)];
    if (ttsO) eMsg.tts = ttsO;

    if (channelO) {
      let result;
      if (botOwners.includes(user.id)) {
        result = await client.shard.broadcastEval(
          async (c, { ch, m, g, u, bO }) => {
            try {
              const chan = await c.channels.cache.get(ch);

              if (!chan) return 0;

              if (chan.guild.id !== g.id && !bO.includes(u.id)) return 1;

              if (!chan.isText()) return 2;

              if (!chan.permissionsFor(c.user).has(PermissionFlagsBits.SendMessages)) return 3;

              await chan.send(m);
              return 5;
            } catch (err) {
              console.log(err);
              return 4;
            }
          },
          {
            context: {
              bO: botOwners,
              ch: channelO,
              g: guild,
              m: eMsg,
              u: user,
            },
          },
        );
      } else {
        if (!interaction.inGuild()) {
          return interaction.editReply({
            components: rows,
            embeds: [embed({ type: 'error' }).setDescription("Can't find channels using DM without `globalsearch`")],
          });
        }
        const chan = await guild?.channels.cache.get(channelO);

        if (!chan) return (result = 6);

        if (!chan.isText()) return (result = 2);

        if (!chan.permissionsFor(client.user).has(PermissionFlagsBits.SendMessages)) return (result = 3);

        await chan.send(eMsg);
        return (result = 5);
      }

      switch (result?.find(e => e) || result) {
        case 1:
          return interaction.editReply({
            components: rows,
            embeds: [
              embed({ type: 'error' }).setDescription('Only bot owners send messages to a channel on another guild'),
            ],
          });
        case 2:
          return interaction.editReply({
            components: rows,
            embeds: [embed({ type: 'error' }).setDescription('Not a text based channel')],
          });
        case 3:
          return interaction.editReply({
            components: rows,
            embeds: [embed({ type: 'error' }).setDescription('Cannot send messages on specified channel')],
          });
        case 4:
          return interaction.editReply({
            components: rows,
            embeds: [embed({ type: 'error' }).setDescription('Cannot access the specified channel')],
          });
        case 5:
          return interaction.editReply({
            components: rows,
            embeds: [
              embed({ title: 'Message Sent', type: 'success' }).addField({
                name: 'Channel',
                value: `<#${channelO}> - \`${channelO}\``,
              }),
            ],
          });
        case 6:
          return interaction.editReply({
            components: rows,
            embeds: [embed({ type: 'error' }).setDescription('Channel not found accross any cached guilds')],
          });
      }
    }
    return interaction.editReply(eMsg);
  }
}
