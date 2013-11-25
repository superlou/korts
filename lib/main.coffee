net = new RandomNet()

visibleNet = new Net()
visibleNet.get('devices').push randomFrom(net.clients())

executeCommand = (cmd)->
    tokens = cmd.split(' ')
    if tokens[0] == 'scan'
        centerDevice = visibleNet.findDeviceByName(tokens[1])
        scannedNet = net.netAround(centerDevice)
        visibleNet.appendNet(scannedNet)


$('.command').keypress (e)->
    if e.which == 13
        command = $('.command').val()
        executeCommand(command)
        $('.command').val('')


# ============
# Configure D3
# ============
width = $(window).width()
height = $(window).height()

color = d3.scale.category20()

force = d3.layout.force()
    .charge(-400)
    .linkDistance(20)
    .size([width, height])
    .nodes(visibleNet.get('devices'))
    .links(visibleNet.get('routes'))
    .start()

zoom = ->
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")")

svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(d3.behavior.zoom().scaleExtent([0.1, 8]).on("zoom", zoom))
    .append('g')

link = svg.selectAll(".link")
    .data(visibleNet.get('routes'))
    .enter().append("line")
    .attr('class', 'link')
    .style('stroke-width', (d)->Math.sqrt(d.weight))

node = svg.selectAll(".node")
    .data(visibleNet.get('devices'))
    .enter().append("g")

node.append("circle")
    .attr("r", 5)
    .style('fill', (d)->
        if d.type == 'router'
            'black'
        else
            color(d.owner)
        )
    .style('stroke', (d)->color(d.owner))
    .style('stroke-width', 2)
    .call(force.drag)

node.append("text")
    .attr("dx", 12)
    .attr("dy", "0.35em")
    .text((d)->d.get('name'))

force.on 'tick', ->
    link.attr("x1", (d)->d.source.x)
    link.attr("y1", (d)->d.source.y)
    link.attr("x2", (d)->d.target.x)
    link.attr("y2", (d)->d.target.y)

    node.attr("transform", (d)->return "translate(" + d.x + "," + d.y + ")");