Net = Backbone.Model.extend
    devices: []
    routes: []

    appendNets: (nets)->
        for net in nets
            this.devices = this.devices.concat(net.devices)
            this.routes = this.routes.concat(net.routes)

    nameDevices: ->
    	i = 1
    	for device in this.devices
    		device.name = i
    		i++