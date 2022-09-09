import { Colors, EmbedBuilder, Events, InteractionType } from 'discord.js';
import { Event } from '../../lib/util/Event.js';
import { App } from '../../lib/App.js';
import { debugLevel, imgOpts, defaultLocale } from '../defaults.js';
import { addSearchParams } from '../utils.js';

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

    if (!command && intName !== 'generic')
      return console.error(`${chalk.red(customId ?? commandName)} interaction not found as ${chalk.red(intName)}`);

    const language = i18n.getLocales().includes(interaction.locale) ? interaction.locale : defaultLocale;

    i18n.setLocale(language);

    const embed = (options?: {
      type?: 'error' | 'success' | 'warning' | 'wip';
      addParams?: Record<string, string>;
      footer?: 'interacted' | 'requested' | 'none';
      title?: string;
    }): EmbedBuilder => {
      const emb = new EmbedBuilder().setTimestamp(Date.now());
      options ??= {};

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
          return emb.setColor(Colors.Red).setTitle(`❌ ${options.title || i18n.__('GENERIC.ERROR')}`);
        case 'success':
          return emb.setColor(Colors.Green).setTitle(`✅ ${options.title || i18n.__('GENERIC.SUCCESS')}`);
        case 'warning':
          return emb.setColor(Colors.Yellow).setTitle(`⚠️ ${options.title || i18n.__('GENERIC.WARNING')}`);
        case 'wip':
          return emb
            .setColor(Colors.Orange)
            .setTitle(`🔨 ${options.title || i18n.__('GENERIC.WIP')}`)
            .setDescription(i18n.__('GENERIC.WIP_COMMAND'));
        default:
          return (options.title ? emb.setTitle(options.title) : emb).setColor(embColor);
      }
    };

    try {
      return command.run({ client, embed }, interaction);
    } catch (err) {
      if (interaction.type === InteractionType.ApplicationCommandAutocomplete) return;
      console.error(err);

      const eOpts = {
        embeds: [
          embed({ type: 'error' }).setDescription(`${i18n.__('ERROR.EXECUTING_INTERACTION')}\n\`\`\`js\n${err}\`\`\``),
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
}
