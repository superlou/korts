net = new RandomNet()

visibleNet = new Net()
visibleNet.get('devices').push randomFrom(net.clients())

executeCommand = (cmd)->
    tokens = cmd.split(' ')
    if tokens[0] == 'scan'
        centerDevice = visibleNet.findDeviceByName(tokens[1])
        scannedNet = net.netAround(centerDevice)
        visibleNet.appendNet(scannedNet)
        refreshGraph()


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

zoom = ->
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")")

svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(d3.behavior.zoom().scaleExtent([0.1, 8]).on("zoom", zoom))
    .append('g')

linksG = svg.append('g').attr('class', 'links')
nodesG = svg.append('g').attr('class', 'nodes')

force = d3.layout.force()
    .charge(-400)
    .linkDistance(20)
    .size([width, height])

refreshGraph = ->
    console.log visibleNet.get('devices')
    console.log visibleNet.get('routes')

    node = nodesG.selectAll(".node")
        .data(visibleNet.get('devices'), (d)->d.get('id'))
    
    nodeG = node.enter().append("g").attr('class', 'node')
    nodeG.append("circle")
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
    nodeG.append("text")
        .attr("dx", 12)
        .attr("dy", "0.35em")
        .text((d)->d.get('name'))


    link = linksG.selectAll(".link")
        .data(visibleNet.get('routes'), (d)->d.get('id'))
    
    link.enter().append("line")
        .attr('class', 'link')
        .style('stroke-width', (d)->Math.sqrt(d.weight))

    force
        .nodes(visibleNet.get('devices'))
        .links(visibleNet.get('routes'))
        .start()

    force.on 'tick', ->
        link.attr("x1", (d)->d.source.x)
        link.attr("y1", (d)->d.source.y)
        link.attr("x2", (d)->d.target.x)
        link.attr("y2", (d)->d.target.y)

        #node.attr('cx', (d)->d.x)
        #node.attr('cy', (d)->d.y)
        node.attr("transform", (d)->return "translate(" + d.x + "," + d.y + ")");

refreshGraph()
