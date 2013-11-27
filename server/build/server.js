(function() {
  var Backbone, Client, Device, Net, RandomNet, Route, Router, Server, Trunk, bayeux, faye, http, net, random, randomFrom, randomInt, seed, server, uuid, _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore');

  Backbone = require('backbone');

  uuid = require('uuid');

  seed = 9;

  random = function() {
    var x;
    x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  randomInt = function(min, max) {
    return min + Math.floor(random() * (max - min + 1));
  };

  randomFrom = function(array) {
    return array[Math.floor(random() * array.length)];
  };

  Device = Backbone.Model.extend({
    defaults: function() {
      return {
        id: uuid.v1(),
        name: "",
        type: "",
        owner: 0
      };
    }
  });

  Router = Device.extend({
    type: "router"
  });

  Server = Device.extend({
    type: "server"
  });

  Client = Device.extend({
    type: "client"
  });

  Route = Backbone.Model.extend({
    defaults: function() {
      return {
        id: uuid.v1(),
        source: null,
        target: null,
        weight: 0
      };
    },
    initialize: function(source, target, weight) {
      if (weight == null) {
        weight = 1;
      }
      this.source = source;
      this.target = target;
      this.weight = weight;
      this.set('source', source);
      this.set('target', target);
      this.set('weight', weight);
      return this.set('id', uuid.v1());
    }
  });

  Net = Backbone.Model.extend({
    defaults: function() {
      return {
        devices: [],
        routes: []
      };
    },
    appendNet: function(net) {
      var d, device, device_ids, r, route, route_ids, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _results;
      device_ids = (function() {
        var _i, _len, _ref, _results;
        _ref = this.get('devices');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          d = _ref[_i];
          _results.push(d.get('id'));
        }
        return _results;
      }).call(this);
      _ref = net.get('devices');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        device = _ref[_i];
        if (_ref1 = device.get('id'), __indexOf.call(device_ids, _ref1) < 0) {
          this.pushDevice(device);
        }
      }
      route_ids = (function() {
        var _j, _len1, _ref2, _results;
        _ref2 = this.get('routes');
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          r = _ref2[_j];
          _results.push(r.get('id'));
        }
        return _results;
      }).call(this);
      _ref2 = net.get('routes');
      _results = [];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        route = _ref2[_j];
        if (_ref3 = route.get('id'), __indexOf.call(route_ids, _ref3) < 0) {
          _results.push(this.pushRoute(route));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    pushDevice: function(device) {
      return this.get('devices').push(device);
    },
    pushRoute: function(route) {
      return this.get('routes').push(route);
    },
    appendNets: function(nets) {
      var net, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = nets.length; _i < _len; _i++) {
        net = nets[_i];
        _results.push(this.appendNet(net));
      }
      return _results;
    },
    nameDevices: function() {
      var device, i, _i, _len, _ref, _results;
      i = 1;
      _ref = this.get('devices');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        device = _ref[_i];
        device.set('name', String(i));
        _results.push(i++);
      }
      return _results;
    },
    findDeviceByName: function(name) {
      var device, _i, _len, _ref;
      _ref = this.get('devices');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        device = _ref[_i];
        if (device.get('name') === name) {
          return device;
        }
      }
      return null;
    },
    clients: function() {
      var device, _i, _len, _ref, _results;
      _ref = this.get('devices');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        device = _ref[_i];
        if (device.type === "client") {
          _results.push(device);
        }
      }
      return _results;
    },
    netAround: function(device) {
      var neighborDevices, neighborRoutes, route, _i, _len, _ref;
      neighborRoutes = [];
      neighborDevices = [];
      _ref = this.get('routes');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        route = _ref[_i];
        if (route.get('source') === device) {
          neighborRoutes.push(route);
          neighborDevices.push(route.get('target'));
        }
        if (route.get('target') === device) {
          neighborRoutes.push(route);
          neighborDevices.push(route.get('source'));
        }
      }
      return new Net({
        devices: neighborDevices,
        routes: neighborRoutes
      });
    }
  });

  Trunk = Net.extend({
    initialize: function() {
      return this.generateTrunk();
    },
    generateTrunk: function() {
      var devices, i, route, _i, _ref, _results;
      devices = (function() {
        var _i, _ref, _results;
        _results = [];
        for (i = _i = 0, _ref = randomInt(3, 8); 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          _results.push(new Router());
        }
        return _results;
      })();
      this.set('devices', devices);
      _results = [];
      for (i = _i = 0, _ref = this.get('devices').length - 1; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        route = new Route(this.get('devices')[i], this.get('devices')[i + 1], 100);
        _results.push(this.pushRoute(route));
      }
      return _results;
    }
  });

  RandomNet = Net.extend({
    initialize: function() {
      this.generateRandomNet();
      return this.nameDevices();
    },
    generateRandomNet: function() {
      var client, clients, device1, device2, i, net, route, router, routers, trunk, trunk_router, trunks, trunks_count, _i, _j, _k, _l, _len, _ref, _ref1, _results;
      trunks_count = randomInt(1, 3);
      trunks = [];
      for (i = _i = 0; 0 <= trunks_count ? _i < trunks_count : _i > trunks_count; i = 0 <= trunks_count ? ++_i : --_i) {
        trunk = new Trunk();
        net = this.appendNet(trunk);
        trunks.push(trunk);
      }
      for (i = _j = 0, _ref = trunks_count - 1; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
        router = new Router();
        this.pushDevice(router);
        device1 = randomFrom(trunks[i].get('devices'));
        device2 = randomFrom(trunks[i + 1].get('devices'));
        route = new Route(device1, router, 10);
        this.pushRoute(route);
        route = new Route(device2, router, 10);
        this.pushRoute(route);
      }
      routers = [];
      for (i = _k = 0, _ref1 = randomInt(1, trunks_count) * 3; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; i = 0 <= _ref1 ? ++_k : --_k) {
        router = new Router();
        this.pushDevice(router);
        routers.push(router);
        trunk_router = randomFrom(randomFrom(trunks).get('devices'));
        route = new Route(router, trunk_router, 10);
        this.pushRoute(route);
      }
      clients = [];
      _results = [];
      for (_l = 0, _len = routers.length; _l < _len; _l++) {
        router = routers[_l];
        _results.push((function() {
          var _m, _ref2, _results1;
          _results1 = [];
          for (i = _m = 3, _ref2 = randomInt(3, 12); 3 <= _ref2 ? _m < _ref2 : _m > _ref2; i = 3 <= _ref2 ? ++_m : --_m) {
            client = new Client();
            clients.push(client);
            this.pushDevice(client);
            route = new Route(client, router);
            _results1.push(this.pushRoute(route));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    }
  });

  http = require('http');

  faye = require('faye');

  server = http.createServer();

  bayeux = new faye.NodeAdapter({
    mount: '/'
  });

  bayeux.attach(server);

  net = new RandomNet();

  module.exports = {
    listen: function(port) {
      return server.listen(port);
    }
  };

}).call(this);
