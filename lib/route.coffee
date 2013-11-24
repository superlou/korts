Route = Backbone.Model.extend
	defaults:
		source: null
		target: null
		weight: 0

	initialize: (source, target, weight=1)->
		this.source = source
		this.target = target
		this.weight = weight