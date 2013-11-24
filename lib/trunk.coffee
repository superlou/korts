Trunk = Net.extend
    initialize: ->
        this.generateTrunk()

    generateTrunk: ()->
        devices = for i in [0..randomInt(3,8)]
            new Router()

        this.devices = devices

        for i in [0...this.devices.length-1]
            route = new Route(this.devices[i], this.devices[i+1], 100)
            this.routes.push(route)