import { debugMode } from '../defaults.js';
import 'colors';

export const eventName = 'guildCreate';
export async function execute(client, i18n, guild) {
  const settings = await client.dbSet(guild, { language: guild.preferredLocale }, { setFromCache: true });
  if (debugMode) {
    console.log('Joined '.green + guild.name.blue + ' ('.gray + guild.id.blue + '):'.gray);
    console.log(settings);
  }
}
