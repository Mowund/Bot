const { MessageEmbed, Permissions } = require('discord.js');
const tc = require('tinycolor2');
const { botColor, botOwners } = require('../botdefaults');

module.exports = {
  data: [
    {
      name: 'echo',
      description:
        'Echoes a message from the bot. (Requires: Manage messages on specified channel)',
      options: [
        {
          name: 'content',
          description: 'The content of the message. (Required if no embed)',
          type: 'STRING',
          required: false,
        },
        {
          name: 'description',
          description: 'The description of the embed. (Required if no content)',
          type: 'STRING',
          required: false,
        },
        {
          name: 'title',
          description: 'The title of the embed.',
          type: 'STRING',
          required: false,
        },
        {
          name: 'url',
          description: "The title's url of the embed.",
          type: 'STRING',
          required: false,
        },
        {
          name: 'color',
          description:
            "The color of the embed. Defaults to author's display color.",
          type: 'STRING',
          required: false,
        },
        {
          name: 'author',
          description: 'Set an author of the embed.',
          type: 'USER',
          required: false,
        },
        {
          name: 'footer',
          description: 'The footer of the embed.',
          type: 'STRING',
          required: false,
        },
        {
          name: 'timestamp',
          description:
            'Enables or disabled the timestamp on the embed. Disabled by default.',
          type: 'BOOLEAN',
          required: false,
        },
        {
          name: 'image',
          description: 'The image link of the embed.',
          type: 'STRING',
          required: false,
        },
        {
          name: 'thumbnail',
          description: 'The thumbnail link of the embed.',
          type: 'STRING',
          required: false,
        },
        {
          name: 'tts',
          description: 'Echoes the message in TTS. Defaults to false.',
          type: 'BOOLEAN',
          required: false,
        },
        {
          name: 'channel',
          description:
            'Echoes at a channel as a message. Defaults to interaction channel as a reply.',
          type: 'STRING',
          required: false,
        },
        {
          name: 'ephemeral',
          description: 'Send reply as an ephemeral message. Defaults to true.',
          type: 'BOOLEAN',
          required: false,
        },
      ],
    },
  ],
  async execute(client, interaction, getTS, emb) {
    var { user, member, guild, options } = interaction;
    var channelO = options?.getString('channel')?.replace(/[<#>]/g, '');
    var contentO = options?.getString('content');
    var descriptionO = options?.getString('description');
    var titleO = options?.getString('title');
    var urlO = options?.getString('url');
    var authorO = options?.getUser('author');
    var memberO = guild?.members.cache.get(authorO?.id) ?? member;
    var footerO = options?.getString('footer');
    var timestampO = options?.getBoolean('timestamp');
    var imageO = options?.getString('image');
    var thumbnailO = options?.getString('thumbnail');
    var colorO = tc(options?.getString('color')).isValid()
      ? tc(options?.getString('color')).toHex()
      : memberO?.displayColor ?? botColor;
    var ttsO = options?.getBoolean('tts') ?? false;
    var ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (
      !member?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) &&
      (ephemeralO == false || channelO) &&
      interaction.inGuild()
    )
      return interaction.reply({
        embeds: [
          emb({
            error:
              "You don't have `MANAGE_MESSAGES` permission to echo non-ephemeraly.",
          }),
        ],
        ephemeral: true,
      });

    if (!contentO && !descriptionO)
      return interaction.reply({
        embeds: [
          emb({
            error:
              'You need to provide a content for the message or a description for the embed.',
          }),
        ],
        ephemeral: true,
      });

    if (interaction.isCommand()) {
      await interaction.deferReply({ ephemeral: ephemeralO });

      var eEmb = new MessageEmbed().setColor(colorO);
      var eMsg = {};

      if (titleO) eEmb.setTitle(titleO);
      if (urlO) eEmb.setURL(urlO);
      if (authorO) eEmb.setAuthor(authorO.username, authorO.avatarURL());
      if (footerO) eEmb.setFooter(footerO);
      if (timestampO) eEmb.setTimestamp(Date.now());
      if (imageO) eEmb.setImage(imageO);
      if (thumbnailO) eEmb.setThumbnail(thumbnailO);

      if (contentO) eMsg.content = contentO;
      if (descriptionO) eMsg.embeds = [eEmb.setDescription(descriptionO)];
      if (ttsO) eMsg.tts = ttsO;

      if (channelO) {
        var result = await client.shard.broadcastEval(
          async (client, { channelO, eMsg, guild, user, botOwners }) => {
            try {
              let chan = await client.channels.cache.get(channelO);

              if (!chan) return 0;
              if (chan.guild.id != guild.id && !botOwners.includes(user.id))
                return 1;
              if (!chan.isText()) return 2;
              if (
                !chan
                  .permissionsFor(client.user)
                  .has(Permissions.FLAGS.SEND_MESSAGES)
              )
                return 3;

              await chan.send(eMsg);
              return 5;
            } catch (err) {
              console.log(err);
              return 4;
            }
          },
          {
            context: {
              channelO: channelO,
              eMsg: eMsg,
              guild: guild,
              user: user,
              botOwners: botOwners,
            },
          }
        );

        switch (result.find((e) => e > 0)) {
          case 1:
            return interaction.editReply({
              embeds: [
                emb({
                  error:
                    'Only bot owners can send messages to a channel on another server.',
                }),
              ],
            });
          case 2:
            return interaction.editReply({
              embeds: [
                emb({ type: 'error' }).setDescription(
                  'Not a text based channel.'
                ),
              ],
            });
          case 3:
            return interaction.editReply({
              embeds: [
                emb({ type: 'error' }).setDescription(
                  'Cannot send messages on specified channel.'
                ),
              ],
            });
          case 4:
            return interaction.editReply({
              embeds: [
                emb({ type: 'error' }).setDescription(
                  'Cannot access the specified channel.'
                ),
              ],
            });
          case 5:
            interaction.editReply({
              embeds: [
                emb()
                  .setTitle('Message Sent')
                  .addField('Channel', `<#${channelO}> - \`${channelO}\``),
              ],
            });

          default:
            return interaction.editReply({
              embeds: [
                emb({ type: 'error' }).setDescription(
                  'Channel not found across any shards.'
                ),
              ],
            });
        }
      }
      return interaction.editReply(eMsg);
    }
  },
};
