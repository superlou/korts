DumbStore = Backbone.Model.extend
	defaults: -> {
		pile: []
	}

	add: (obj)->
		this.get('pile')[obj.id] = obj

	find: (id)->
		if id instanceof Array
			objs = id.map (singleId)-> store.find(singleId)
		else
			this.get('pile')[id]