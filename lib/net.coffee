Net = Backbone.Model.extend
    defaults: ->
        {
            devices: []
            routes: []
        }

    appendNet: (net)->
        device_ids = (d.get('id') for d in this.get('devices'))

        for device in net.get('devices')
            if device.get('id') not in device_ids
                this.pushDevice device

        route_ids = (r.get('id') for r in this.get('routes'))

        for route in net.get('routes')
            if route.get('id') not in route_ids
                this.pushRoute route

    pushDevice: (device)->
        this.get('devices').push device

    pushRoute: (route)->
        this.get('routes').push route

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

