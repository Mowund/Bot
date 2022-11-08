import { Events, Guild } from 'discord.js';
import { App } from '../../lib/App.js';
import { Event } from '../../lib/structures/Event.js';
import { debugLevel } from '../defaults.js';

export default class GuildCreateEvent extends Event {
  constructor() {
    super(Events.GuildCreate);
  }

  async run(client: App, guild: Guild): Promise<any> {
    const { chalk } = client,
      settings = await client.database.guilds.set(guild, {}, { setFromCache: true });
    client.updateMowundDescription();

    if (debugLevel) {
      console.log(
        chalk.green('Joined ') + chalk.blue(guild.name) + chalk.gray(' (') + chalk.blue(guild.id) + chalk.gray('):'),
      );
      console.log(settings);
    }
  }
}
