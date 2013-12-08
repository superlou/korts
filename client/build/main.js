(function() {
  var Client, Device, DumbStore, Net, RandomNet, Route, Router, Server, Trunk, clientIdCookie, clientUuid, color, executeCommand, fetchGame, force, initializeD3, linksG, nodesG, random, randomFrom, randomInt, refreshGraph, seed, store, subscribeToServer, visibleNet,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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

  DumbStore = Backbone.Model.extend({
    defaults: function() {
      return {
        pile: []
      };
    },
    add: function(obj) {
      return this.get('pile')[obj.id] = obj;
    },
    find: function(id) {
      var objs;
      if (id instanceof Array) {
        return objs = id.map(function(singleId) {
          return store.find(singleId);
        });
      } else {
        return this.get('pile')[id];
      }
    }
  });

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
    defaults: function() {
      return {
        id: uuid.v1(),
        name: "",
        type: "router",
        owner: 0
      };
    }
  });

  Server = Device.extend({
    defaults: function() {
      return {
        id: uuid.v1(),
        name: "",
        type: "server",
        owner: 0
      };
    }
  });

  Client = Device.extend({
    defaults: function() {
      return {
        id: uuid.v1(),
        name: "",
        type: "client",
        owner: 0
      };
    }
  });

  Route = Backbone.Model.extend({
    defaults: function() {
      return {
        id: uuid.v1(),
        sourceId: null,
        targetId: null,
        weight: 0,
        type: 'route'
      };
    },
    initialize: function(attrs) {
      Backbone.Model.prototype.initialize.call(this, attrs);
      if (attrs.weight) {
        return this.weight = attrs.weight;
      } else {
        return this.weight = 1;
      }
    },
    updateEndpoints: function() {
      this.source = store.find(this.get('sourceId'));
      return this.target = store.find(this.get('targetId'));
    }
  });

  Net = Backbone.Model.extend({
    defaults: function() {
      return {
        deviceIds: [],
        routeIds: []
      };
    },
    appendNet: function(net) {
      var deviceId, routeId, _i, _j, _len, _len1, _ref, _ref1, _results;
      _ref = net.get('deviceIds');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        deviceId = _ref[_i];
        if (__indexOf.call(this.get('deviceIds'), deviceId) < 0) {
          this.addDeviceId(deviceId);
        }
      }
      _ref1 = net.get('routeIds');
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        routeId = _ref1[_j];
        if (__indexOf.call(this.get('routeIds'), routeId) < 0) {
          _results.push(this.addRouteId(routeId));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    addDeviceId: function(deviceId) {
      return this.get('deviceIds').push(deviceId);
    },
    addRouteId: function(routeId) {
      return this.get('routeIds').push(routeId);
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
      var device, deviceId, i, _i, _len, _ref, _results;
      i = 1;
      _ref = this.get('deviceIds');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        deviceId = _ref[_i];
        device = store.find(deviceId);
        device.set('name', String(i));
        _results.push(i++);
      }
      return _results;
    },
    findDeviceByName: function(name) {
      var device, deviceId, _i, _len, _ref;
      _ref = this.get('deviceIds');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        deviceId = _ref[_i];
        device = store.find(deviceId);
        if (device.get('name') === name) {
          return device;
        }
      }
      return null;
    },
    devices: function() {
      return store.find(this.get('deviceIds'));
    },
    routes: function() {
      return store.find(this.get('routeIds'));
    },
    clients: function() {
      var deviceId, _i, _len, _ref, _results;
      _ref = this.get('deviceIds');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        deviceId = _ref[_i];
        if (store.find(deviceId).get('type') === "client") {
          _results.push(store.find(deviceId));
        }
      }
      return _results;
    },
    netAround: function(device) {
      var neighborDeviceIds, neighborRouteIds, route, routeId, _i, _len, _ref;
      neighborRouteIds = [];
      neighborDeviceIds = [];
      _ref = this.get('routeIds');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        routeId = _ref[_i];
        route = store.find(routeId);
        if (route.get('sourceId') === device.id) {
          neighborRouteIds.push(routeId);
          neighborDeviceIds.push(route.get('targetId'));
        }
        if (route.get('targetId') === device.id) {
          neighborRouteIds.push(routeId);
          neighborDeviceIds.push(route.get('sourceId'));
        }
      }
      return new Net({
        deviceIds: neighborDeviceIds,
        routeIds: neighborRouteIds
      });
    }
  });

  Trunk = Net.extend({
    initialize: function() {
      return this.generateTrunk();
    },
    generateTrunk: function() {
      var deviceIds, i, route, router, _i, _ref, _results;
      deviceIds = (function() {
        var _i, _ref, _results;
        _results = [];
        for (i = _i = 0, _ref = randomInt(3, 8); 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          router = new Router();
          store.add(router);
          _results.push(router.id);
        }
        return _results;
      })();
      this.set('deviceIds', deviceIds);
      _results = [];
      for (i = _i = 0, _ref = this.get('deviceIds').length - 1; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        route = new Route({
          sourceId: this.get('deviceIds')[i],
          targetId: this.get('deviceIds')[i + 1],
          weight: 100
        });
        store.add(route);
        _results.push(this.addRouteId(route.id));
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
      var client, clients, deviceId1, deviceId2, i, net, route, router, routers, trunk, trunkRouterId, trunks, trunks_count, _i, _j, _k, _l, _len, _ref, _ref1, _results;
      trunks_count = randomInt(1, 3);
      trunks = [];
      for (i = _i = 0; 0 <= trunks_count ? _i < trunks_count : _i > trunks_count; i = 0 <= trunks_count ? ++_i : --_i) {
        trunk = new Trunk();
        net = this.appendNet(trunk);
        trunks.push(trunk);
      }
      for (i = _j = 0, _ref = trunks_count - 1; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
        router = new Router();
        store.add(router);
        this.addDeviceId(router.id);
        deviceId1 = randomFrom(trunks[i].get('deviceIds'));
        deviceId2 = randomFrom(trunks[i + 1].get('deviceIds'));
        route = new Route({
          sourceId: deviceId1,
          targetId: router.id,
          weight: 10
        });
        store.add(route);
        this.addRouteId(route.id);
        route = new Route({
          sourceId: deviceId2,
          tagetId: router.id,
          weight: 10
        });
        store.add(route);
        this.addRouteId(route.id);
      }
      routers = [];
      for (i = _k = 0, _ref1 = randomInt(1, trunks_count) * 3; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; i = 0 <= _ref1 ? ++_k : --_k) {
        router = new Router();
        store.add(router);
        this.addDeviceId(router.id);
        routers.push(router);
        trunkRouterId = randomFrom(randomFrom(trunks).get('deviceIds'));
        route = new Route({
          sourceId: router.id,
          targetId: trunkRouterId,
          weight: 10
        });
        store.add(route);
        this.addRouteId(route.id);
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
            store.add(client);
            clients.push(client);
            this.addDeviceId(client.id);
            route = new Route({
              sourceId: client.id,
              targetId: router.id
            });
            store.add(route);
            _results1.push(this.addRouteId(route.id));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    }
  });

  store = new DumbStore();

  visibleNet = null;

  clientIdCookie = $.cookie('korts-client-id');

  if (clientIdCookie === void 0) {
    clientUuid = null;
    clientIdCookie = $.cookie('korts-client-id', null);
  } else {
    clientUuid = clientIdCookie;
  }

  $.post('api/clientId', {
    'uuid': clientUuid
  }, function(data) {
    clientUuid = data.uuid;
    console.log("Assigned uuid: " + clientUuid);
    $.cookie('korts-client-id', clientUuid);
    subscribeToServer(uuid);
    return fetchGame(uuid);
  });

  subscribeToServer = function(uuid) {
    var fayeClient, privateMsgChannel;
    fayeClient = new Faye.Client('http://localhost:8000/faye');
    privateMsgChannel = '/messagesTo/' + clientUuid;
    console.log("Private Message Channel: " + privateMsgChannel);
    return fayeClient.subscribe(privateMsgChannel, function(message) {
      var devices, newNet, route, routes, _i, _len, _ref;
      if (newNet = message.newNet) {
        devices = newNet.devices.map(function(attrs) {
          var device;
          device = new Device(attrs);
          store.add(device);
          return device;
        });
        routes = newNet.routes.map(function(attrs) {
          var route;
          route = new Route(attrs);
          store.add(route);
          return route;
        });
        visibleNet.appendNet(new Net(newNet.net));
        _ref = visibleNet.routes();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          route = _ref[_i];
          route.updateEndpoints();
        }
        return refreshGraph();
      }
    });
  };

  fetchGame = function(uuid) {
    console.log('Fetching content');
    return $.get('api/refreshNet', {
      'uuid': clientUuid
    }, function(data) {
      var clientNet, route, _i, _len, _ref;
      clientNet = data.clientData;
      console.log(clientNet);
      clientNet.devices.map(function(attrs) {
        return store.add(new Device(attrs));
      });
      clientNet.routes.map(function(attrs) {
        return store.add(new Route(attrs));
      });
      visibleNet = new Net(clientNet.net);
      _ref = visibleNet.routes();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        route = _ref[_i];
        route.updateEndpoints();
      }
      initializeD3();
      return refreshGraph();
    });
  };

  executeCommand = function(cmd) {
    return $.post('api/command', {
      'uuid': clientUuid,
      'cmd': cmd
    });
  };

  $('.command').keypress(function(e) {
    var command;
    if (e.which === 13) {
      command = $('.command').val();
      executeCommand(command);
      return $('.command').val('');
    }
  });

  color = null;

  linksG = null;

  nodesG = null;

  force = null;

  initializeD3 = function() {
    var height, svg, width, zoom;
    width = $(window).width();
    height = $(window).height();
    color = d3.scale.category20();
    zoom = function() {
      return svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    };
    svg = d3.select('body').append('svg').attr('width', width).attr('height', height).call(d3.behavior.zoom().scaleExtent([0.1, 8]).on("zoom", zoom)).append('g');
    linksG = svg.append('g').attr('class', 'links');
    nodesG = svg.append('g').attr('class', 'nodes');
    return force = d3.layout.force().charge(-400).linkDistance(20).size([width, height]);
  };

  refreshGraph = function() {
    var link, node, nodeG;
    console.log('Devices:');
    console.log(visibleNet.devices());
    console.log('Routes:');
    console.log(visibleNet.routes());
    node = nodesG.selectAll(".node").data(visibleNet.devices(), function(d) {
      return d.id;
    });
    nodeG = node.enter().append("g").attr('class', 'node');
    nodeG.append("circle").attr("r", 5).style('fill', function(d) {
      if (d.type === 'router') {
        return 'black';
      } else {
        return color(d.owner);
      }
    }).style('stroke', function(d) {
      return color(d.owner);
    }).style('stroke-width', 2).call(force.drag);
    nodeG.append("text").attr("dx", 12).attr("dy", "0.35em").text(function(d) {
      return d.get('name');
    });
    link = linksG.selectAll(".link").data(visibleNet.routes(), function(d) {
      return d.id;
    });
    link.enter().append("line").attr('class', 'link').style('stroke-width', function(d) {
      return Math.sqrt(d.weight);
    });
    force.nodes(visibleNet.devices()).links(visibleNet.routes()).start();
    return force.on('tick', function() {
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
  };

}).call(this);
