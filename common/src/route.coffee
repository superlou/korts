Route = Backbone.Model.extend
	defaults: ->
		{
			id: uuid.v1()
			sourceId: null
			targetId: null
			weight: 0
			type: 'route'
		}

	initialize: (attrs)->
		Backbone.Model.prototype.initialize.call(this, attrs)

		if attrs.weight
			this.weight = attrs.weight
		else
			this.weight = 1

	updateEndpoints: ->
		this.source = store.find(@get 'sourceId')
		this.target = store.find(@get 'targetId')