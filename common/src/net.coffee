Net = Backbone.Model.extend
    defaults: ->
        {
            deviceIds: []
            routeIds: []
        }

    appendNet: (net)->
        for deviceId in net.get('deviceIds')
            if deviceId not in @get('deviceIds')
                @addDeviceId deviceId

        for routeId in net.get('routeIds')
            if routeId not in @get('routeIds')
                @addRouteId routeId

    addDeviceId: (deviceId)->
        @get('deviceIds').push deviceId

    addRouteId: (routeId)->
        @get('routeIds').push routeId

    appendNets: (nets)->
        for net in nets
            this.appendNet(net)

    nameDevices: ->
        i = 1
        for deviceId in @get('deviceIds')
            device = store.find(deviceId)
            device.set('name', String(i))
            i++

    findDeviceByName: (name)->
        for deviceId in @get('deviceIds')
            device = store.find(deviceId)
            return device if device.get('name') == name

        null

    devices: ->
        store.find(@get('deviceIds'))

    routes: ->
        store.find(@get('routeIds'))

    clients: ->
        (store.find(deviceId) for deviceId in @get('deviceIds') when store.find(deviceId).get('type') == "client")

    netAround: (device)->
        neighborRouteIds = []
        neighborDeviceIds = []

        for routeId in @get('routeIds')
            route = store.find(routeId)
            if route.get('sourceId') == device.id
                neighborRouteIds.push routeId
                neighborDeviceIds.push route.get('targetId')

            if route.get('targetId') == device.id
                neighborRouteIds.push routeId
                neighborDeviceIds.push route.get('sourceId')

        new Net({deviceIds: neighborDeviceIds, routeIds: neighborRouteIds})

