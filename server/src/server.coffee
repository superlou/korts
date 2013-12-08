express = require('express')
connect = require('connect')
http = require('http')
faye = require('faye')

app = express()
server = http.createServer(app)

# Serve client
clientDirectory = './client'
app.use(express.static(clientDirectory))
app.use(express.bodyParser())

# Create Faye server
bayeux = new faye.NodeAdapter
    mount: '/faye'
bayeux.attach(server)

# Start server
server.listen(process.env.PORT)

# Create Faye client
fayeClient = new faye.Client('http://localhost:8000/faye')

# Data store
store = new DumbStore()

# Application logic
game = {
    net: new RandomNet()
    clients: []
    clientNets: []
}

addClient = (game, clientId)->
    game.clients.push clientId
    game.clientNets[clientId] = new Net()
    game.clientNets[clientId].addDeviceId randomFrom(game.net.clients()).id

serializeNet = (net)->
    netAttrs = JSON.parse(JSON.stringify(net.attributes))
    devices = store.find(net.get('deviceIds'))
    routes = store.find(net.get('routeIds'))
    {
        net: netAttrs
        devices: devices
        routes: routes
    }

# If a client has an existing clientId, send back the
# client ID.  If the client has no clientId, or one
# that does not exist, add the client to the game.
app.post '/api/clientId', (req, res)->
    requestedUuid = req.body.uuid

    if requestedUuid in game.clients
        console.log 'Existing Client'
        clientId = requestedUuid
    else
        console.log 'New Client'
        clientId = uuid.v1()
        addClient(game, clientId)

    res.send {uuid: clientId}

app.get '/api/refreshNet', (req, res)->
    clientId = req.query.uuid
    clientNet = game.clientNets[clientId]
    res.send {clientData: serializeNet(clientNet)}

app.post '/api/command', (req, res)->
    clientId = req.body.uuid
    cmd = req.body.cmd

    tokens = cmd.split(' ')
    if tokens[0] == 'scan' or tokens[0] == 's'
        clientNet = game.clientNets[clientId]
        centerDevice = clientNet.findDeviceByName(tokens[1])
        scannedNet = game.net.netAround(centerDevice)
        clientNet.appendNet(scannedNet)
        
        clientMsgChannel = '/messagesTo/' + clientId
        fayeClient.publish clientMsgChannel, {
            newNet: serializeNet(scannedNet)
        }

    res.send {received: true}
