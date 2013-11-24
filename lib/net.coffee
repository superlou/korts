Net = Backbone.Model.extend
    devices: []
    routes: []

    appendNets: (nets)->
        for net in nets
            this.devices = this.devices.concat(net.devices)
            this.routes = this.routes.concat(net.routes)