import { debugMode } from '../defaults.js';
import 'colors';

export const eventName = 'guildDelete';
export async function execute(client, i18n, guild) {
  const settings = await client.dbDelete(guild);
  if (debugMode) {
    console.log('Left '.red + guild.name.blue + ' ('.gray + guild.id.blue + '):'.gray);
    console.log(settings);
  }
}
