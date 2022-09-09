import { Events, Guild } from 'discord.js';
import { App } from '../../lib/App.js';
import { Event } from '../../lib/util/Event.js';
import { debugLevel } from '../defaults.js';

export default class GuildDeleteEvent extends Event {
  constructor() {
    super(Events.GuildDelete);
  }

  async run(client: App, guild: Guild): Promise<any> {
    const { chalk } = client,
      settings = await client.dbDelete(guild);
    await client.updateMowundDescription();

    if (debugLevel) {
      console.log(
        chalk.red('Left ') + chalk.blue(guild.name) + chalk.gray(' (') + chalk.blue(guild.id) + chalk.gray('):'),
      );
      console.log(settings);
    }
  }
}
