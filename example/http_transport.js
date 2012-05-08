var express = require('express');
var Stats = require('../index.js').statCollector;
var opts = {'transport': 'http', 'port': 8081, 'url': '/stats', 'statServers': ['abc'], 'maxCountersValue': 5};
var st = new Stats(opts);
var counters = {
  'ips': function (req, res) {
    return req.connection.remoteAddress;
  },
  'urls': function (req, res) {
    return req.originalUrl;
  },
  'client': function (req, res) {
    return req.headers['user-agent'] + "::" + req.connection.remoteAddress;
  }
};
var app = express.createServer();
app.use(st.useCounters(counters)); //use counters as middleware
st.attach(app); //expose stats object through req.stats

app.get('/', function (req, res) {
  res.send('/');
});
app.get('/ok', function (req, res) {
  res.send('/ok');
  req.stats.counter('ppls', Math.random());
});

app.listen(8080);
console.log('example app listen on 8080 port, for harvesting stats visit localhost:8081/stats/abc');
