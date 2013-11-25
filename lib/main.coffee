net = new RandomNet()

width = $(window).width()
height = $(window).height()

color = d3.scale.category20()

force = d3.layout.force()
    .charge(-400)
    .linkDistance(20)
    .size([width, height])
    .nodes(net.devices)
    .links(net.routes)
    .start()

zoom = ->
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")")

svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(d3.behavior.zoom().scaleExtent([0.1, 8]).on("zoom", zoom))
    .append('g')

link = svg.selectAll(".link")
    .data(net.routes)
    .enter().append("line")
    .attr('class', 'link')
    .style('stroke-width', (d)->Math.sqrt(d.weight))

node = svg.selectAll(".node")
    .data(net.devices)
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
    .text((d)->d.name)

force.on 'tick', ->
    link.attr("x1", (d)->d.source.x)
    link.attr("y1", (d)->d.source.y)
    link.attr("x2", (d)->d.target.x)
    link.attr("y2", (d)->d.target.y)

    node.attr("transform", (d)->return "translate(" + d.x + "," + d.y + ")");