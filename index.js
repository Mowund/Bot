import process from 'node:process';
import { ShardingManager } from 'discord.js';
import 'log-timestamp';
import { Chalk } from 'chalk';

const manager = new ShardingManager('./bot.js', {
  token: process.env.TOKEN,
});

manager.on('shardCreate', shard => console.log(new Chalk({ level: 3 }).red(`Launched shard ${shard.id}`)));
manager.spawn();
