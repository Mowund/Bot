import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionType, MessageFlags } from 'discord.js';
import { colors, debugMode, imgOpts, defaultLocale } from '../defaults.js';
import { addSearchParams } from '../utils.js';

export const eventName = 'interactionCreate';
export async function execute({ chalk, client, firebase, i18n }, interaction) {
  const {
      channel,
      channelId,
      commandName,
      commandType,
      componentType,
      customId,
      guild,
      member,
      message,
      options: opts,
      type,
      user,
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

  const language = i18n.getLocales().includes(interaction.locale) ? interaction.locale : defaultLocale;

  i18n.setLocale(language);
  interaction.language = language;

  /**
   * Configure a predefined embed
   * @returns {string} A predefined embed
   * @param {Object} options The function's options
   * @param {Object} [options.addParams] Adds extra parameters to the embed's footer image url
   * @param {('interacted'|'requested'|'none')} [options.footer='requested'] Sets the default footer type (Default: Interacted)
   * @param {string} [options.title] Change the title while still including the type's emoji
   * @param {('error'|'success'|'warning'|'wip')} [options.type] The type of the embed
   */
  const embed = (options = {}) => {
    const emb = new EmbedBuilder().setTimestamp(Date.now());

    if (options.footer !== 'none') {
      emb.setFooter({
        iconURL: addSearchParams(new URL((member ?? user).displayAvatarURL(imgOpts)), options.addParams).href,
        text: i18n.__mf(`GENERIC.${options.footer === 'interacted' ? 'INTERACTED_BY' : 'REQUESTED_BY'}`, {
          userName: member?.displayName ?? user.username,
        }),
      });
    }

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
        return (options.title ? emb.setTitle(options.title) : emb).setColor(embColor);
    }
  };

  try {
    switch (customId) {
      case 'generic_message_delete': {
        if (
          message.interaction?.user.id !== user.id &&
          !new URLSearchParams(message.embeds[message.embeds.length - 1]?.footer?.iconURL)
            .get('messageOwners')
            ?.split('-')
            .includes(user.id)
        ) {
          return interaction.reply({
            embeds: [embed({ type: 'error' }).setDescription(i18n.__('ERROR.UNALLOWED.COMMAND'))],
            ephemeral: true,
          });
        }

        return message.delete();
      }
      default:
        await command.execute({ chalk, embed, firebase, interaction, st: i18n });
    }
  } catch (err) {
    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) return;
    console.error(err);

    const eOpts = {
      components: !ephemeralO
        ? [
            new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setLabel(i18n.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                .setEmoji('🧹')
                .setStyle(ButtonStyle.Danger)
                .setCustomId('generic_message_delete'),
            ]),
          ]
        : [],
      embeds: [
        embed({ type: 'error' }).setDescription(`${i18n.__('ERROR.EXECUTING_INTERACTION')}\n\`\`\`js\n${err}\`\`\``),
      ],
      ephemeral: true,
    };
    return interaction.deferred || interaction.replied ? interaction.followUp(eOpts) : interaction.reply(eOpts);
  } finally {
    if (debugMode && interaction.type !== InteractionType.ApplicationCommandAutocomplete) {
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
