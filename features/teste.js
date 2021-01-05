module.exports = (client, instance) => {
  client.on('message', (message) => {
    if (message.content === 'mw') {
      message.channel.send('mowund');
    }
  });
};
