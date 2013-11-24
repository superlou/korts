(function() {
  var color, force, generateBackbone, generateNet, height, link, mergeNets, net, node, randomInt, svg, width;

  randomInt = function(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  generateBackbone = function() {
    var devices, i, net;
    net = {
      devices: [],
      routes: []
    };
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
    net.devices = devices;
    return net;
  };

  mergeNets = function(nets) {
    var devices, net, resultNet, routes, _i, _len;
    devices = [];
    routes = [];
    for (_i = 0, _len = nets.length; _i < _len; _i++) {
      net = nets[_i];
      devices = devices.concat(net.devices);
      routes = routes.concat(net.routes);
    }
    resultNet = {
      "devices": devices,
      "routes": routes
    };
    return resultNet;
  };

  generateNet = function() {
    var backbone, backbones_count, i, net, _i;
    backbones_count = randomInt(1, 4);
    console.log("Backbones: " + backbones_count);
    net = {
      devices: [],
      routes: []
    };
    for (i = _i = 0; 0 <= backbones_count ? _i < backbones_count : _i > backbones_count; i = 0 <= backbones_count ? ++_i : --_i) {
      backbone = generateBackbone();
      net = mergeNets([net, backbone]);
    }
    return net;
  };

  net = generateNet();

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
