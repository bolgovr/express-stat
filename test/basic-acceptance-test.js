var assert = require('assert');
var Zombie = require('zombie');
var dgram = require('dgram');
describe('express', function () {
  describe('application should work without stat middleware', function () {
    var app, browser;

    beforeEach(function (done) {
      app = require('./fixtures/express-app.js');
      app.listen(8083);
      browser = new Zombie();
      done();
    });

    afterEach(function (done) {
      app.close();
      done();
    });

    it('application should run', function (done) {
      browser.visit('http://localhost:8083/', function (error, browser) {
        assert.equal(browser.success, true);
        assert.equal(browser.response[0], 200); //http status code
        assert.equal(browser.response[2], "ok");
        done();
      });
    });
  });
  describe('middleware', function () {
    var app, stat, browser;
    beforeEach(function (done) {
      app = require('./fixtures/express-app.js');
      stat = require('../index.js');
      app.use(stat.stats());
      browser = new Zombie();
      done();
    });

    it('should expose stats method to response', function (done) {
      app.get('/test', function (req, res) {
        process.nextTick(function () {
          /*assert.ok(res.stats);*/
          done();
        });
      });
      app.listen(8083, function () {
        browser.visit('http://localhost:8083/test', function () {
        });
      });
    });
  });
  describe('application with stat middleware', function () {
    var app, browser, stat;
    beforeEach(function (done) {
      app = require('./fixtures/express-app.js');
      stat = require('../index.js');
      app.use(stat.stats());
      app.listen(8083);
      browser = new Zombie();
      done();
    });

    afterEach(function (done) {
      app.close();
      done();
    });

    it('should allow requests', function (done) {
      browser.visit('http://localhost:8083', function (error, browser) {
        assert.equal(browser.success, true);
        assert.equal(browser.response[0], 200); //http status code
        assert.equal(browser.response[2], "ok");
        done();
      });
    });

    it('should run stats client on port 40084', function (done) {
      var client = dgram.createSocket('udp4');
      var message = new Buffer(JSON.stringify({'command': 'ping'}));
      client.send(message, 0, message.length, 40084, "localhost");
      client.on('message', function (message, sender) {
        var msg = JSON.parse(message);
        assert.equal(sender.port, 40084);
        assert.equal(msg.command, 'pong');
        client.close();
        done();
      });
    });
  });
});
