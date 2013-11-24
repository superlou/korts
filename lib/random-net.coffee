RandomNet = Net.extend
    initialize: ->
        this.generateRandomNet()

    generateRandomNet: ->
        trunks_count = randomInt(1, 3)
        #console.log "Trunks: " + trunks_count

        net = {
            devices: []
            routes: []
        }

        for i in [0...trunks_count]
            trunk = new Trunk()
            net = this.appendNets([trunk])