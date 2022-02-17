import { debugMode } from '../defaults.js';

export const eventName = 'guildDelete';
export async function execute({ chalk, client }, guild) {
  const settings = await client.dbDelete(guild);
  await client.updateMowundDescription();

  if (debugMode) {
    console.log(
      chalk.red('Left ') + chalk.blue(guild.name) + chalk.gray(' (') + chalk.blue(guild.id) + chalk.gray('):'),
    );
    console.log(settings);
  }
}
