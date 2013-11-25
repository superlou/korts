(function() {
  var Client, Device, Net, RandomNet, Route, Router, Server, Trunk, color, force, height, link, net, node, random, randomFrom, randomInt, seed, svg, visible_net, width, zoom;

  seed = 10;

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
    defaults: {
      source: null,
      target: null,
      weight: 0
    },
    initialize: function(source, target, weight) {
      if (weight == null) {
        weight = 1;
      }
      this.source = source;
      this.target = target;
      return this.weight = weight;
    }
  });

  Net = Backbone.Model.extend({
    devices: [],
    routes: [],
    appendNets: function(nets) {
      var net, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = nets.length; _i < _len; _i++) {
        net = nets[_i];
        this.devices = this.devices.concat(net.devices);
        _results.push(this.routes = this.routes.concat(net.routes));
      }
      return _results;
    },
    nameDevices: function() {
      var device, i, _i, _len, _ref, _results;
      i = 1;
      _ref = this.devices;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        device = _ref[_i];
        device.name = i;
        _results.push(i++);
      }
      return _results;
    },
    clients: function() {
      var device, _i, _len, _ref, _results;
      _ref = this.devices;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        device = _ref[_i];
        if (device.type === "client") {
          _results.push(device);
        }
      }
      return _results;
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
      this.devices = devices;
      _results = [];
      for (i = _i = 0, _ref = this.devices.length - 1; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        route = new Route(this.devices[i], this.devices[i + 1], 100);
        _results.push(this.routes.push(route));
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
      net = {
        devices: [],
        routes: []
      };
      trunks = [];
      for (i = _i = 0; 0 <= trunks_count ? _i < trunks_count : _i > trunks_count; i = 0 <= trunks_count ? ++_i : --_i) {
        trunk = new Trunk();
        net = this.appendNets([trunk]);
        trunks.push(trunk);
      }
      for (i = _j = 0, _ref = trunks_count - 1; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
        router = new Router();
        this.devices.push(router);
        device1 = randomFrom(trunks[i].devices);
        device2 = randomFrom(trunks[i + 1].devices);
        route = new Route(device1, router, 10);
        this.routes.push(route);
        route = new Route(device2, router, 10);
        this.routes.push(route);
      }
      routers = [];
      for (i = _k = 0, _ref1 = randomInt(1, trunks_count) * 3; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; i = 0 <= _ref1 ? ++_k : --_k) {
        router = new Router();
        this.devices.push(router);
        routers.push(router);
        trunk_router = randomFrom(randomFrom(trunks).devices);
        route = new Route(router, trunk_router, 10);
        this.routes.push(route);
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
            this.devices.push(client);
            route = new Route(client, router);
            _results1.push(this.routes.push(route));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    }
  });

  net = new RandomNet();

  visible_net = new Net();

  visible_net.devices.push(randomFrom(net.clients()));

  width = $(window).width();

  height = $(window).height();

  color = d3.scale.category20();

  force = d3.layout.force().charge(-400).linkDistance(20).size([width, height]).nodes(visible_net.devices).links(visible_net.routes).start();

  zoom = function() {
    return svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  };

  svg = d3.select('body').append('svg').attr('width', width).attr('height', height).call(d3.behavior.zoom().scaleExtent([0.1, 8]).on("zoom", zoom)).append('g');

  link = svg.selectAll(".link").data(visible_net.routes).enter().append("line").attr('class', 'link').style('stroke-width', function(d) {
    return Math.sqrt(d.weight);
  });

  node = svg.selectAll(".node").data(visible_net.devices).enter().append("g");

  node.append("circle").attr("r", 5).style('fill', function(d) {
    if (d.type === 'router') {
      return 'black';
    } else {
      return color(d.owner);
    }
  }).style('stroke', function(d) {
    return color(d.owner);
  }).style('stroke-width', 2).call(force.drag);

  node.append("text").attr("dx", 12).attr("dy", "0.35em").text(function(d) {
    return d.name;
  });

  force.on('tick', function() {
    link.attr("x1", function(d) {
      return d.source.x;
    });
    link.attr("y1", function(d) {
      return d.source.y;
    });
    link.attr("x2", function(d) {
      return d.target.x;
    });
    link.attr("y2", function(d) {
      return d.target.y;
    });
    return node.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  });

}).call(this);
