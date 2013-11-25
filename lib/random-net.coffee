RandomNet = Net.extend
    initialize: ->
        this.generateRandomNet()
        this.nameDevices()

    generateRandomNet: ->
        trunks_count = randomInt(1, 3)

        net = {
            devices: []
            routes: []
        }

        trunks = []
        for i in [0...trunks_count]
            trunk = new Trunk()
            net = this.appendNets([trunk])
            trunks.push trunk

        # Ensure all trunks are connected through at least one router
        for i in [0...trunks_count-1]
            router = new Router()
            this.devices.push router

            device1 = randomFrom(trunks[i].devices)
            device2 = randomFrom(trunks[i+1].devices)
            
            route = new Route(device1, router, 10)
            this.routes.push(route)
            route = new Route(device2, router, 10)          
            this.routes.push(route)

        # Add a bunch of clients connected to the trunks through
        # intermediate routers
        routers = []
        for i in [0...randomInt(1, trunks_count)*3]
            router = new Router()
            this.devices.push router
            routers.push router

            trunk_router = randomFrom(randomFrom(trunks).devices)
            route = new Route(router, trunk_router, 10)
            this.routes.push route

        clients = []
        for router in routers
            for i in [3...randomInt(3,12)]
                client = new Client()
                clients.push client
                this.devices.push client

                route = new Route(client, router)
                this.routes.push route