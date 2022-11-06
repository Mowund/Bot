import { Colors, EmbedBuilder, Events, InteractionType } from 'discord.js';
import { Event } from '../../lib/structures/Event.js';
import { App, EmbedBuilderOptions } from '../../lib/App.js';
import { debugLevel, defaultLocale } from '../defaults.js';

export default class InteractionCreateEvent extends Event {
  constructor() {
    super(Events.InteractionCreate);
  }

  async run(client: App, interaction: any): Promise<any> {
    const { chalk, i18n } = client,
      {
        channel,
        channelId,
        commandName,
        commandType,
        componentType,
        customId,
        guild,
        guildId,
        member,
        options: opts,
        type,
        user,
      } = interaction,
      intName = customId?.match(/^[^_]*/g)?.[0] ?? commandName,
      command = client.commands.find(({ structure }) => structure.some(({ name }) => name === intName)),
      embColor =
        member?.displayColor ||
        (user.accentColor === undefined ? (await user.fetch()).accentColor : user.accentColor) ||
        Colors.Blurple;

    if (guild && !guild.available) return;

    if (!command && intName !== 'generic')
      return console.error(`${chalk.red(customId ?? commandName)} interaction not found as ${chalk.red(intName)}`);

    const locale = i18n.getLocales().includes(interaction.locale) ? interaction.locale : defaultLocale,
      localize = (phrase: string, replace?: Record<string, any>) => client.localize({ locale, phrase }, replace),
      embed = (options: Omit<EmbedBuilderOptions, 'localizer' | 'member' | 'user'> = {}): EmbedBuilder =>
        client.embedBuilder({ ...options, color: options.color ?? embColor, localizer: localize, member, user });

    try {
      return command.run({ client, embed, locale, localize }, interaction);
    } catch (err) {
      if (interaction.type === InteractionType.ApplicationCommandAutocomplete) return;
      console.error(err);

      const eOpts = {
        embeds: [
          embed({ type: 'error' }).setDescription(`${localize('ERROR.EXECUTING_INTERACTION')}\n\`\`\`js\n${err}\`\`\``),
        ],
        ephemeral: true,
      };
      return interaction.deferred || interaction.replied ? interaction.followUp(eOpts) : interaction.reply(eOpts);
    } finally {
      if (debugLevel && interaction.type !== InteractionType.ApplicationCommandAutocomplete) {
        console.log(
          chalk.blue(user.tag) +
            chalk.gray(' (') +
            chalk.blue(user.id) +
            chalk.gray(') - ') +
            (guild
              ? chalk.cyan(guild.name) +
                chalk.gray(' (') +
                chalk.cyan(guildId) +
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
}
