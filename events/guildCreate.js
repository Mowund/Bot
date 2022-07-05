import { debugMode } from '../defaults.js';

export const eventName = 'guildCreate';
export async function execute({ chalk, client }, guild) {
  console.log(await client.dbGet(guild, { searchOnly: 'cache' }));
  const settings = await client.dbSet(guild, {}, { setFromCache: true });
  await client.updateMowundDescription();

  if (debugMode) {
    console.log(
      chalk.green('Joined ') + chalk.blue(guild.name) + chalk.gray(' (') + chalk.blue(guild.id) + chalk.gray('):'),
    );
    console.log(settings);
  }
}
