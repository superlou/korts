Trunk = Net.extend
    initialize: ->
        this.generateTrunk()

    generateTrunk: ()->
        deviceIds = for i in [0..randomInt(3,8)]
            router = new Router()
            store.add(router)
            router.id

        this.set('deviceIds', deviceIds)

        for i in [0...@get('deviceIds').length-1]
            route = new Route
            	sourceId: @get('deviceIds')[i]
            	targetId: @get('deviceIds')[i+1]
            	weight: 100

            store.add(route)
            this.addRouteId route.id