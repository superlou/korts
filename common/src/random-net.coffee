RandomNet = Net.extend
    initialize: ->
        @generateRandomNet()
        @nameDevices()

    generateRandomNet: ->
        trunks_count = randomInt(1, 3)

        trunks = []
        for i in [0...trunks_count]
            trunk = new Trunk()
            net = this.appendNet(trunk)
            trunks.push trunk

        # Ensure all trunks are connected through at least one router
        for i in [0...trunks_count-1]
            router = new Router()
            store.add(router)
            @addDeviceId router.id

            deviceId1 = randomFrom(trunks[i].get('deviceIds'))
            deviceId2 = randomFrom(trunks[i+1].get('deviceIds'))
            
            route = new Route
                sourceId: deviceId1
                targetId: router.id
                weight: 10

            store.add route
            @addRouteId route.id

            route = new Route
                sourceId: deviceId2
                tagetId: router.id
                weight: 10

            store.add route     
            @addRouteId route.id

        # Add a bunch of clients connected to the trunks through
        # intermediate routers
        routers = []
        for i in [0...randomInt(1, trunks_count)*3]
            router = new Router()
            store.add router
            @addDeviceId router.id
            routers.push router

            trunkRouterId = randomFrom(randomFrom(trunks).get('deviceIds'))
            route = new Route
                sourceId: router.id
                targetId: trunkRouterId
                weight: 10
            store.add route
            @addRouteId route.id

        clients = []
        for router in routers
            for i in [3...randomInt(3,12)]
                client = new Client()
                store.add client
                clients.push client
                @addDeviceId client.id

                route = new Route
                    sourceId: client.id
                    targetId: router.id

                store.add route
                @addRouteId route.id