'use strict';

const { MessageEmbed } = require('discord.js'),
  { botColor, debugMode, botLanguage, imgOpts } = require('../defaults.js'),
  { getParam } = require('../utils.js');
require('colors');
require('log-timestamp');

module.exports = {
  name: 'interactionCreate',
  async execute(client, i18n, interaction) {
    const {
        channel,
        channelId,
        commandName,
        componentType,
        customId,
        targetType,
        type,
        guild,
        options: opts,
        user,
        member,
        message,
      } = interaction,
      intName = customId?.match(/^[^_]*/g)?.[0] ?? commandName,
      hasCommand =
        intName === 'generic' ? true : client.commands.find(({ data }) => data.find(({ name }) => name === intName));

    if (!hasCommand) return console.error(`${(customId ?? commandName).red} interaction not found as ${intName.red}`);
    const fUser = await user.fetch(),
      urlLanguage = getParam(message?.embeds[0], 'mowLang'),
      language =
        (botLanguage.supported.includes(urlLanguage)
          ? urlLanguage
          : interaction.inGuild() && (await client.dbGet(guild)).language) || botLanguage.default;

    i18n.setLocale(language);
    interaction.language = language;

    /**
     * Configure a predefined embed
     * @returns {string} A predefined embed
     * @param {Object} options The function's options
     * @param {Object} [options.addParams] Adds extra parameters to the embed's footer image url
     * @param {boolean} [options.interacted=false] Set footer as interacted instead of requested
     * @param {string} [options.title] Change the title but still including the type's emoji
     * @param {('error'|'success'|'warning'|'wip')} [options.type] The type of the embed
     */
    const embed = (options = {}) => {
      const emb = new MessageEmbed()
        .setColor(member?.displayColor || fUser.accentColor || botColor)
        .setFooter({
          text: i18n.__(
            `GENERIC.${options.interacted ? 'INTERACTED_BY' : 'REQUESTED_BY'}`,
            member?.displayName ?? user.username,
          ),
          iconURL: `${(member ?? user).displayAvatarURL(imgOpts)}&mowLang=${language}${
            options.addParams ? `&${new URLSearchParams(options.addParams).toString()}` : ''
          }`,
        })
        .setTimestamp(Date.now());
      switch (options.type) {
        case 'error':
          return emb.setColor('ff0000').setTitle(`❌ ${options.title || i18n.__('GENERIC.ERROR')}`);
        case 'success':
          return emb.setColor('00ff00').setTitle(`✅ ${options.title || i18n.__('GENERIC.SUCCESS')}`);
        case 'warning':
          return emb.setColor('ffff00').setTitle(`⚠️ ${options.title || i18n.__('GENERIC.WARNING')}`);
        case 'wip':
          return emb
            .setColor('ff8000')
            .setTitle(`🔨 ${options.title || i18n.__('GENERIC.WIP')}`)
            .setDescription(i18n.__('GENERIC.WIP_COMMAND'));
        default:
          return options.title ? emb.setTitle(options.title) : emb;
      }
    };
    try {
      switch (customId) {
        case 'generic_message_delete': {
          if (message.interaction.user.id !== user.id) {
            return interaction.reply({
              embeds: [embed({ type: 'error' }).setDescription(i18n.__('ERROR.UNALLOWED.COMMAND'))],
              ephemeral: true,
            });
          }

          return message.delete();
        }
        default:
          await hasCommand.execute(client, interaction, i18n, embed);
      }
    } catch (err) {
      if (interaction.isAutocomplete()) return;
      console.error(err);

      const eOpts = {
        embeds: [
          embed({ type: 'error' }).setDescription(`${i18n.__('ERROR.EXECUTING_INTERACTION')}\n\`\`\`js\n${err}\`\`\``),
        ],
        ephemeral: true,
      };
      return interaction.deferred || interaction.replied ? interaction.followUp(eOpts) : interaction.reply(eOpts);
    } finally {
      if (debugMode && !interaction.isAutocomplete()) {
        console.log(
          user.tag.blue +
            ' ('.gray +
            user.id.blue +
            ') -'.gray +
            (guild
              ? ` ${guild.name.cyan}${' ('.gray}${guild.id.cyan}${') - '.gray}${'#'.green}${channel.name.green}`
              : ' DM'.green) +
            ' ('.gray +
            channelId.green +
            '): '.gray +
            type.red +
            ':'.gray +
            (targetType?.red.concat(':'.gray) ?? componentType?.red.concat(':'.gray) ?? '') +
            (customId ?? commandName).yellow +
            ':'.gray +
            (opts?._group?.yellow.concat(':'.gray) ?? '') +
            (opts?._subcommand?.yellow.concat(':'.gray) ?? '') +
            JSON.stringify(interaction, (_, v) => (typeof v === 'bigint' ? v.toString() : v)).brightRed +
            (opts ? ':'.gray + JSON.stringify(opts) : ''),
        );
      }
    }
  },
};
