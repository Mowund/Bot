import process from 'node:process';
import dotenv from 'dotenv-extended';
import { ShardingManager } from 'discord.js';
import { Chalk } from 'chalk';
import 'log-timestamp';

dotenv.load({ errorOnRegex: true });

const manager = new ShardingManager('./dist/src/bot.js', {
  token: process.env.DISCORD_TOKEN,
});

manager.on('shardCreate', shard => console.log(new Chalk({ level: 3 }).red(`Launched shard ${shard.id}`)));
manager.spawn();
