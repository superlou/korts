Device = Backbone.Model.extend
	defaults: ->
		{
			id: uuid.v1()
			name: ""
			type: ""
			owner: 0
		}

Router = Device.extend
	type: "router"   

Server = Device.extend
	type: "server"
