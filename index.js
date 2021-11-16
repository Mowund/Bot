'use strict';

const { ShardingManager } = require('discord.js');
require('colors');
require('log-timestamp');

const manager = new ShardingManager('./bot.js', {
  token: process.env.TOKEN,
});

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`.red));
manager.spawn();
