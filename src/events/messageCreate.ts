import { Events, TextChannel } from 'discord.js';
import { Event } from '../../lib/util/Event.js';
import { App } from '../../lib/App.js';
import { AppMessage } from '../../lib/util/Message.js';
import { debugLevel } from '../defaults.js';

export default class MessageCreateEvent extends Event {
  constructor() {
    super(Events.MessageCreate);
  }

  async run(client: App, message: AppMessage): Promise<any> {
    const { chalk } = client;
    // TODO
    if (!message.guild?.available || message.author.bot || message.guild.id !== '420007989261500418') return;

    const scamReportTimeout = 15000;
    if (client.badDomains.some(w => message.content.includes(w))) {
      if (!message.author.lastScamTimestamp || Date.now() - message.author.lastScamTimestamp > scamReportTimeout) {
        const guildSettings = await client.dbGet(message.guild);

        if (guildSettings.log.badDomains && guildSettings.log.channel) {
          const logChannel = message.guild.channels.cache.get(guildSettings.logChannel) as TextChannel;

          logChannel.send(`Bad word: ${message.content}`);
          if (debugLevel) console.log(chalk.gray('Bad word detected: ') + chalk.red(message.content));
        }
      }
      message.author.lastScamTimestamp = message.createdTimestamp;
    } else if (Date.now() - message.author.lastScamTimestamp > scamReportTimeout) {
      delete message.author.lastScamTimestamp;
    }
  }
}
