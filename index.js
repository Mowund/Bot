const { ShardingManager } = require('discord.js');
const { env } = require('./utils');
require('colors');
require('log-timestamp');

const manager = new ShardingManager('./bot.js', {
  token: env('TOKEN'),
});

manager.on('shardCreate', (shard) =>
  console.log(`Launched shard ${shard.id}`.red)
);

manager.spawn();
