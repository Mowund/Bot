const { ShardingManager } = require('discord.js');
require('colors');
require('log-timestamp');

var env;
try {
  env = require('./env.json');
} catch {
  env = process.env;
}

const manager = new ShardingManager('./bot.js', {
  token: env.TOKEN,
});

manager.on('shardCreate', (shard) =>
  console.log(`Launched shard ${shard.id}`.red)
);

manager.spawn();
