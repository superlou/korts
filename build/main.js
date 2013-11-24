(function() {
  var Device, Net, RandomNet, Route, Router, Server, Trunk, color, force, height, link, net, node, randomInt, svg, width;

  randomInt = function(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
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
      return this.generateRandomNet();
    },
    generateRandomNet: function() {
      var i, net, trunk, trunks_count, _i, _results;
      trunks_count = randomInt(1, 3);
      net = {
        devices: [],
        routes: []
      };
      _results = [];
      for (i = _i = 0; 0 <= trunks_count ? _i < trunks_count : _i > trunks_count; i = 0 <= trunks_count ? ++_i : --_i) {
        trunk = new Trunk();
        _results.push(net = this.appendNets([trunk]));
      }
      return _results;
    }
  });

  net = new RandomNet();

  width = $(window).width();

  height = $(window).height();

  color = d3.scale.category20();

  force = d3.layout.force().charge(-400).linkDistance(40).size([width, height]).nodes(net.devices).links(net.routes).start();

  svg = d3.select('body').append('svg').attr('width', width).attr('height', height);

  link = svg.selectAll(".link").data(net.routes).enter().append("line").attr('class', 'link').style('stroke-width', function(d) {
    return Math.sqrt(d.weight);
  });

  node = svg.selectAll(".node").data(net.devices).enter().append("g");

  node.append("circle").attr("r", 5).style('fill', function(d) {
    return color(d.owner);
  }).call(force.drag);

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
