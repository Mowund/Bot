import { ActionRow, ButtonComponent, ButtonStyle, Embed, MessageFlags } from 'discord.js';
import { colors, debugMode, imgOpts, defaultLocale } from '../defaults.js';
import { getParam } from '../utils.js';
import 'log-timestamp';

export const eventName = 'interactionCreate';
export async function execute({ chalk, client, i18n, firebase }, interaction) {
  const {
      channel,
      channelId,
      commandName,
      componentType,
      customId,
      commandType,
      type,
      guild,
      options: opts,
      user,
      member,
      message,
    } = interaction,
    ephemeralO = opts?.getBoolean('ephemeral') ?? message?.flags.has(MessageFlags.Ephemeral) ?? true,
    intName = customId?.match(/^[^_]*/g)?.[0] ?? commandName,
    command =
      intName === 'generic' ? true : client.commands.find(({ data }) => data.find(({ name }) => name === intName)),
    embColor =
      member?.displayColor ||
      (user.accentColor === undefined ? (await user.fetch()).accentColor : user.accentColor) ||
      colors.blurple;

  if (!command)
    return console.error(`${chalk.red(customId ?? commandName)} interaction not found as ${chalk.red(intName)}`);

  let language =
    getParam(message?.embeds[0], 'mowLang') ??
    (!interaction.inGuild() || ephemeralO
      ? null
      : (await client.dbGet(guild))?.locale ??
        (interaction.guild?.features.includes('COMMUNITY') ? interaction.guildLocale : null));

  language = i18n.getLocales().includes(language)
    ? language
    : i18n.getLocales().includes(interaction.locale)
    ? interaction.locale
    : defaultLocale;

  /* console.log(1, getParam(message?.embeds[0], 'mowLang'));
  console.log(2, !interaction.inGuild());
  console.log(3, ephemeralO);
  console.log(4, interaction.locale);
  console.log(5, (await client.dbGet(guild))?.locale);
  console.log(6, interaction.guild?.features.includes('COMMUNITY'));
  console.log(7, interaction.guildLocale);
  console.log(8, interaction.locale);
  console.log(9, language);*/

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
    const emb = new Embed()
      .setColor(embColor)
      .setFooter({
        iconURL: `${(member ?? user).displayAvatarURL(imgOpts)}&mowLang=${language}${
          options.addParams ? `&${new URLSearchParams(options.addParams).toString()}` : ''
        }`,
        text: i18n.__mf(`GENERIC.${options.interacted ? 'INTERACTED_BY' : 'REQUESTED_BY'}`, {
          userName: member?.displayName ?? user.username,
        }),
      })
      .setTimestamp(Date.now());
    switch (options.type) {
      case 'error':
        return emb.setColor(colors.red).setTitle(`❌ ${options.title || i18n.__('GENERIC.ERROR')}`);
      case 'success':
        return emb.setColor(colors.green).setTitle(`✅ ${options.title || i18n.__('GENERIC.SUCCESS')}`);
      case 'warning':
        return emb.setColor(colors.yellow).setTitle(`⚠️ ${options.title || i18n.__('GENERIC.WARNING')}`);
      case 'wip':
        return emb
          .setColor(colors.orange)
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
        await command.execute({ chalk, client, embed, firebase, interaction, st: i18n });
    }
  } catch (err) {
    if (interaction.isAutocomplete()) return;
    console.error(err);

    const eOpts = {
      components:
        opts?.getBoolean('ephemeral') === false
          ? [
              new ActionRow().addComponents(
                new ButtonComponent()
                  .setLabel(i18n.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                  .setEmoji({ name: '🧹' })
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId('generic_message_delete'),
              ),
            ]
          : [],
      embeds: [
        embed({ type: 'error' }).setDescription(`${i18n.__('ERROR.EXECUTING_INTERACTION')}\n\`\`\`js\n${err}\`\`\``),
      ],
      ephemeral: true,
    };
    return interaction.deferred || interaction.replied ? interaction.followUp(eOpts) : interaction.reply(eOpts);
  } finally {
    if (debugMode && !interaction.isAutocomplete()) {
      console.log(
        chalk.blue(user.tag) +
          chalk.gray(' (') +
          chalk.blue(user.id) +
          chalk.gray(') - ') +
          (guild
            ? chalk.cyan(guild.name) +
              chalk.gray(' (') +
              chalk.cyan(guild.id) +
              chalk.gray(') - ') +
              chalk.green(`#${channel.name}`)
            : chalk.green('DM')) +
          chalk.gray(' (') +
          chalk.green(channelId) +
          chalk.gray('): ') +
          chalk.red(`${type}`) +
          chalk.gray(':') +
          (commandType
            ? chalk.red(`${commandType}`) + chalk.gray(':')
            : commandType
            ? chalk.red(`${componentType}`) + chalk.gray(':')
            : '') +
          chalk.yellow(customId ?? commandName) +
          chalk.gray(':') +
          (opts?._group ? chalk.yellow(opts?._group) + chalk.gray(':') : '') +
          (opts?._subcommand ? chalk.yellow(opts?._subcommand) + chalk.gray(':') : '') +
          chalk.redBright(JSON.stringify(interaction, (_, v) => (typeof v === 'bigint' ? v.toString() : v))) +
          (opts ? chalk.gray(':') + JSON.stringify(opts) : ''),
      );
    }
  }
}
