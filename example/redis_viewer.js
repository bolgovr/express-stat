var client = require('redis').createClient();
client.subscribe('stats');
client.on('message', function (channel, message) {
  console.log('got message from ' + channel + ' : ' + message);
});
