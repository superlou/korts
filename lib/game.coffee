randomInt = (min, max)->
    min + Math.floor(Math.random() * (max - min + 1))

Net = Backbone.Model.extend
    devices: []
    routes: []

    appendNets: (nets)->
        for net in nets
            this.devices = this.devices.concat(net.devices)
            this.routes = this.routes.concat(net.routes)

Trunk = Net.extend
    initialize: ->
        this.generateTrunk()

    generateTrunk: ()->
        devices = for i in [0..randomInt(2,8)]
            {
                "id":   uuid.v1()
                "name": ""
                "type": "router"
                "owner": 0
            }

        this.devices = devices

RandomNet = Net.extend
    initialize: ->
        this.generateRandomNet()

    generateRandomNet: ->
        trunks_count = randomInt(1, 4)
        console.log "Trunks: " + trunks_count

        net = {
            devices: []
            routes: []
        }

        for i in [0...trunks_count]
            trunk = new Trunk()
            net = this.appendNets([trunk])

        net

net = new RandomNet()

width = $(window).width()
height = $(window).height()

color = d3.scale.category20()

force = d3.layout.force()
    .charge(-120)
    .linkDistance(100)
    .size([width, height])
    .nodes(net.devices)
    .links(net.routes)
    .start()

svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height)

link = svg.selectAll(".link")
    .data(net.routes)
    .enter().append("line")
    .attr('class', 'link')
    .style('stroke-width', (d)->Math.sqrt(d.value))

node = svg.selectAll(".node")
    .data(net.devices)
    .enter().append("g")

node.append("circle")
    .attr("r", 5)
    .style('fill', (d)->color(d.owner))
    .call(force.drag)

node.append("text")
    .attr("dx", 12)
    .attr("dy", "0.35em")
    .text((d)->d.name)

force.on 'tick', ->
    link.attr("x1", (d)->d.source.x)
    link.attr("y1", (d)->d.source.y)
    link.attr("x2", (d)->d.target.x)
    link.attr("y2", (d)->d.target.y)

    #node.attr("cx", (d)->d.x)
    #node.attr("cy", (d)->d.y)

    node.attr("transform", (d)->return "translate(" + d.x + "," + d.y + ")");