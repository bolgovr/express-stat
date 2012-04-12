var Evt = require('eventemitter2').EventEmitter2;
var Harvester = function () {
  this.counters = {};
  this.on('counter::*', function (counterName) {
    console.log(this.event + ' updated');
  });
};
Harvester.prototype = new Evt({
  'wildcard': true,
  'delimiter': '::'
});
Harvester.prototype.injectCounter = function (obj, method, counterName) {
  var self = this;
  this.counters[counterName] = 0;
  this._createProxy(obj, method, this.counter(counterName));
};
Harvester.prototype.counter = function (counterName) {
  this.counters[counterName] = 0;
  var self = this;
  return function () {
    self.counters[counterName]++;
    self.emit('counter::' + counterName);
  };
};

Harvester.prototype._createProxy = function (obj, method, proxy) {
  var backup = obj[method];
  obj[method] = function () {
    proxy.apply({}, arguments);
    backup.apply(obj, arguments);
  };
};
Harvester.prototype.getSystemInfo = function () {
  this.emit('info::systemInfo', {
    'title': process.title,
    'versions': process.versions,
    'arch': process.arch,
    'memoryUsage': process.memoryUsage,
    'uptime': process.uptime(),
    'cwd': process.cwd()
  });
};

var StatsCollector = function (opts) {
  this.harvester = new Harvester();
  this.counters = {};
  this.data = {};
  this.intervals = {};
  this.injectBackup = {};
};
StatsCollector.prototype.listen = function (app) {
  var self = this.harvester;
  app.use(function (req, res, next) {
    res.stats = function (msg) {
      console.dir('msg - ' + msg);
    };
    self.injectCounter(res, 'send', 'send');
    next();
  });
  return app;
};
module.exports = new StatsCollector();

