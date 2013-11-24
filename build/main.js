(function() {
  var Net, RandomNet, Trunk, color, force, height, link, net, node, randomInt, svg, width;

  randomInt = function(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  };

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
      var devices, i;
      devices = (function() {
        var _i, _ref, _results;
        _results = [];
        for (i = _i = 0, _ref = randomInt(2, 8); 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          _results.push({
            "id": uuid.v1(),
            "name": "",
            "type": "router",
            "owner": 0
          });
        }
        return _results;
      })();
      return this.devices = devices;
    }
  });

  RandomNet = Net.extend({
    initialize: function() {
      return this.generateRandomNet();
    },
    generateRandomNet: function() {
      var i, net, trunk, trunks_count, _i;
      trunks_count = randomInt(1, 4);
      console.log("Trunks: " + trunks_count);
      net = {
        devices: [],
        routes: []
      };
      for (i = _i = 0; 0 <= trunks_count ? _i < trunks_count : _i > trunks_count; i = 0 <= trunks_count ? ++_i : --_i) {
        trunk = new Trunk();
        net = this.appendNets([trunk]);
      }
      return net;
    }
  });

  net = new RandomNet();

  width = $(window).width();

  height = $(window).height();

  color = d3.scale.category20();

  force = d3.layout.force().charge(-120).linkDistance(100).size([width, height]).nodes(net.devices).links(net.routes).start();

  svg = d3.select('body').append('svg').attr('width', width).attr('height', height);

  link = svg.selectAll(".link").data(net.routes).enter().append("line").attr('class', 'link').style('stroke-width', function(d) {
    return Math.sqrt(d.value);
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
