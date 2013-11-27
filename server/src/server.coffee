http = require('http')
faye = require('faye')

server = http.createServer()
bayeux = new faye.NodeAdapter
	mount: '/'

bayeux.attach(server)

net = new RandomNet()

module.exports = {
	listen: (port)->
		server.listen(port)
}