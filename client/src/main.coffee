store = new DumbStore()

visibleNet = null

clientIdCookie = $.cookie('korts-client-id')

if clientIdCookie == undefined
    clientUuid = null
    clientIdCookie = $.cookie('korts-client-id', null)
else
    clientUuid = clientIdCookie

$.post 'api/clientId', {'uuid': clientUuid},
    (data)->
        clientUuid = data.uuid
        console.log "Assigned uuid: " + clientUuid
        $.cookie('korts-client-id', clientUuid)
        subscribeToServer(uuid)
        fetchGame(uuid)


subscribeToServer = (uuid)->
    fayeClient = new Faye.Client('http://localhost:8000/faye')

    privateMsgChannel = '/messagesTo/' + clientUuid
    console.log "Private Message Channel: " + privateMsgChannel

    fayeClient.subscribe privateMsgChannel, (message)->
        if newNet = message.newNet
           devices = newNet.devices.map (attrs)->
                device = new Device(attrs)
                store.add device
                device

            routes = newNet.routes.map (attrs)->
                route = new Route(attrs)    
                store.add route
                route

            visibleNet.appendNet new Net(newNet.net)

            for route in visibleNet.routes()
                route.updateEndpoints()

            refreshGraph()
 

fetchGame = (uuid)->
    console.log 'Fetching content'
    $.get 'api/refreshNet', {'uuid': clientUuid},
        (data)->
            clientNet = data.clientData
            console.log clientNet

            clientNet.devices.map (attrs)->
                store.add new Device(attrs)

            clientNet.routes.map (attrs)->
                store.add new Route(attrs)  

            visibleNet = new Net(clientNet.net)

            for route in visibleNet.routes()
                route.updateEndpoints()

            initializeD3()
            refreshGraph()

executeCommand = (cmd)->
    $.post 'api/command', {'uuid': clientUuid, 'cmd': cmd}



$('.command').keypress (e)->
    if e.which == 13
        command = $('.command').val()
        executeCommand(command)
        $('.command').val('')


# ============
# Configure D3
# ============
color = null
linksG = null
nodesG = null
force = null

initializeD3 = ->
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
    console.log 'Devices:'
    console.log visibleNet.devices()
    console.log 'Routes:'
    console.log visibleNet.routes()

    node = nodesG.selectAll(".node")
        .data(visibleNet.devices(), (d)->d.id)
    
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
        .data(visibleNet.routes(), (d)->d.id)
    
    link.enter().append("line")
        .attr('class', 'link')
        .style('stroke-width', (d)->Math.sqrt(d.weight))

    force
        .nodes(visibleNet.devices())
        .links(visibleNet.routes())
        .start()

    force.on 'tick', ->
        link.attr("x1", (d)->d.source.x)
        link.attr("y1", (d)->d.source.y)
        link.attr("x2", (d)->d.target.x)
        link.attr("y2", (d)->d.target.y)

        #node.attr('cx', (d)->d.x)
        #node.attr('cy', (d)->d.y)
        node.attr("transform", (d)->return "translate(" + d.x + "," + d.y + ")")