const config = require('./config.json')
const token = process.env.token

const { ShardingManager } = require('discord.js');
const shard = new ShardingManager('./app.js', {
  token: token,
  autoSpawn: true
});

shard.spawn(2);

shard.on('launch', shard => console.log(`[SHARD] Shard ${shard.id}/${shard.totalShards}`));
