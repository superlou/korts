Trunk = Net.extend
    initialize: ->
        this.generateTrunk()

    generateTrunk: ()->
        devices = for i in [0..randomInt(2,8)]
            {
                "id":   uuid.v1()
                "name": ""
                "type": "router"
                "owner": 0
            }

        this.devices = devices