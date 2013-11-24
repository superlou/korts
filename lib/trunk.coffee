Trunk = Net.extend
    initialize: ->
        this.generateTrunk()

    generateTrunk: ()->
        devices = for i in [0..randomInt(2,8)]
            new Router()

        this.devices = devices
        console.log this.routes

        for i in [0...this.devices.length-1]
            route = new Route(this.devices[i], this.devices[i+1])
            this.routes.push(route)