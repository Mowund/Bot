const { MessageEmbed } = require('discord.js');
const { botColor, debugMode } = require('../botdefaults.js');
const db = require('../database.js');
require('colors');
require('log-timestamp');

module.exports = {
  name: 'interactionCreate',
  async execute(client, interaction) {
    var {
      channel,
      channelId,
      commandName,
      componentType,
      customId,
      targetType,
      type,
      guild,
      options,
      user,
      member,
      message,
    } = interaction;

    intName = customId?.match(/^[^_]*/g)?.toString() ?? commandName;
    hasCommand =
      intName == 'generic'
        ? true
        : client.commands.find(({ data }) =>
            data.find(({ name }) => name == intName)
          );

    if (!hasCommand) {
      return console.error(
        (customId ?? commandName).red +
          ' interaction not found as ' +
          intName.red
      );
    }

    language = db.getLanguage(guild);

    function getTS(message, options) {
      return db.getString(language, message, options);
    }
    var userO = options?.getUser('user') ?? user;
    var memberO = guild?.members.cache.get(userO.id) ?? userO;

    /**
     * Configure a predefined embed
     * @param {object} [options] Defines the options
     * @param {boolean} [options.interacted] Set footer as interacted instead of requested
     * @param {('error'|'generic'|'success'|'warn')} [options.type] The type of the embed, defaults to generic
     * @return {string} A predefined embed
     */
    function emb(options) {
      let emb = new MessageEmbed()
        .setColor(memberO.displayColor ?? botColor)
        .setFooter(
          getTS(
            ['GENERIC', options?.interacted ? 'INTERACTED_BY' : 'REQUESTED_BY'],
            {
              stringKeys: { USER: user.username },
            }
          ),
          member?.avatarURL() ?? user.avatarURL()
        )
        .setTimestamp(Date.now());
      switch (options?.type) {
        case 'error':
          return emb
            .setColor('ff0000')
            .setTitle('❌ ' + getTS(['GENERIC', 'ERROR']));
        case 'success':
          return emb
            .setColor('00ff00')
            .setTitle('✅ ' + getTS(['GENERIC', 'SUCCESS']));
        case 'warn':
          return emb
            .setColor('ffff00')
            .setTitle('⚠️ ' + getTS(['GENERIC', 'WARNING']));
        case 'wip':
          return emb
            .setColor('ff8000')
            .setTitle('🔨 ' + getTS(['GENERIC', 'WIP']))
            .setDescription(getTS(['GENERIC', 'WIP_COMMAND']));
      }

      return emb;
    }

    try {
      switch (customId) {
        case 'generic_message_delete': {
          if (user.id == message.interaction.user.id) {
            return message.delete();
          } else {
            return interaction.reply({
              embeds: [
                emb({ type: 'error' }).setDescription(
                  getTS(['ERROR', 'UNALLOWED', 'COMMAND'])
                ),
              ],
            });
          }
        }
        default:
          await hasCommand.execute(client, interaction, getTS, emb);
      }
    } catch (err) {
      console.error(err);
      interaction.deferred || interaction.replied
        ? interaction.followUp({
            embeds: [
              emb({ type: 'error' }).setDescription(
                getTS(['ERROR', 'EXECUTING_INTERACTION'])
              ),
            ],
            ephemeral: true,
          })
        : interaction.reply({
            embeds: [
              emb({ type: 'error' }).setDescription(
                getTS(['ERROR', 'EXECUTING_INTERACTION'])
              ),
            ],
            ephemeral: true,
          });
    } finally {
      if (debugMode)
        console.log(
          user.username.blue +
            ' ('.gray +
            user.id.blue +
            ') -'.gray +
            (guild
              ? ' ' +
                guild.name.cyan +
                ' ('.gray +
                guild.id.cyan +
                ') - '.gray +
                '#'.green +
                channel.name.green
              : ' DM'.green) +
            ' ('.gray +
            channelId.green +
            '): '.gray +
            type.red +
            ':'.gray +
            (targetType?.red.concat(':'.gray) ??
              componentType?.red.concat(':'.gray) ??
              '') +
            (customId ?? commandName).yellow +
            ':'.gray +
            (options?._group?.yellow.concat(':'.gray) ?? '') +
            (options?._subcommand?.yellow.concat(':'.gray) ?? '') +
            //+ JSON.stringify(interaction).brightRed
            (options ? ':'.gray + JSON.stringify(options) : '')
        );
    }
  },
};
