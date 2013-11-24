Route = Backbone.Model.extend
	defaults:
		src: null
		dest: null

	initialize: (src, dest)->
		this.src = src
		this.dest = dest