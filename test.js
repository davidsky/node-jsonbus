'use strict';


var bus= require('./index.js')


var server= bus.createServer().listen(8181)
server.on('request', function(obj, callback)
{
	console.log('server got request', obj)
	callback( { pong: 2 } )
})


var client= bus.connect(8181)
client.request({ ping: 1 }, function(obj)
{
	console.log('client got response', obj)
})
