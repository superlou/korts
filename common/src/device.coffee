Device = Backbone.Model.extend
	defaults: ->
		{
			id: uuid.v1()
			name: ""
			type: ""
			owner: 0
		}

Router = Device.extend
	defaults: ->
		{
			id: uuid.v1()
			name: ""
			type: "router"
			owner: 0
		} 

Server = Device.extend
	defaults: ->
		{
			id: uuid.v1()
			name: ""
			type: "server"
			owner: 0
		}

Client = Device.extend
	defaults: ->
		{
			id: uuid.v1()
			name: ""
			type: "client"
			owner: 0
		}