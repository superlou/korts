Trunk = Net.extend
    initialize: ->
        this.generateTrunk()

    generateTrunk: ()->
        devices = for i in [0..randomInt(3,8)]
            new Router()

        this.set('devices', devices)

        for i in [0...this.get('devices').length-1]
            route = new Route(this.get('devices')[i], this.get('devices')[i+1], 100)
            this.get('routes').push(route)