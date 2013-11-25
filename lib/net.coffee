Net = Backbone.Model.extend
    defaults:
        devices: []
        routes: []

    appendNet: (net)->
        this.set('devices', this.get('devices').concat(net.get('devices')))
        this.set('routes', this.get('routes').concat(net.get('routes')))

    appendNets: (nets)->
        for net in nets
            this.appendNet(net)

    nameDevices: ->
        i = 1
        for device in this.get('devices')
            device.set('name', String(i))
            i++

    findDeviceByName: (name)->
        for device in this.get('devices')
            return device if device.get('name') == name

        null

    clients: ->
        (device for device in this.get('devices') when device.type == "client")

    netAround: (device)->
        neighborRoutes = []
        neighborDevices = []

        for route in this.get('routes')
            if route.get('source') == device
                neighborRoutes.push route
                neighborDevices.push route.get('target')

            if route.get('target') == device
                neighborRoutes.push route
                neighborDevices.push route.get('source')

        new Net({devices: neighborDevices, routes: neighborRoutes})

