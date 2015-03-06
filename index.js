'use strict';

var reconnect= require('net-socket-reconnect')
var netBuf= require('net-buffer')
var net= require('net')

function Server()
{
	var server= net.createServer.apply(null, arguments)
	server.on('connection', function(socket)
	{
		socket.on('readable', netBuf.decode(socket, function(buffer)
		{
			var reqId= buffer.readUInt32LE(0)
			// no reqId, no reply expected
			if( 0===reqId )
				return server.emit('request', JSON.parse(buffer.slice(4).toString()) )

			return server.emit('request', JSON.parse(buffer.slice(4).toString()), function(obj)
			{
				var buffer= netBuf.encode(new Buffer(JSON.stringify(obj)), 4)
				buffer.writeUInt32LE(reqId, 2)
				socket.write(buffer)
				reqId= null, buffer= null, obj= null
			})
		}))
	})

	return server
}
exports.createServer= Server

function Connect()
{
	var socket= reconnect.apply(null, arguments)

	var requestTimeout= 1000
	if (arguments && typeof arguments[0])
		requestTimeout= arguments[0].requestTimeout || 1000
	var requestCount= 0
	var requestCallbacks= {}
	var requestTimeouts= {}
	var structConfirmed= undefined

	socket.request= function(obj, callback)
	{
		var reqId= ++requestCount
		var reqIdStr= (reqId).toString(32)

		// using 16 bit / per socket
		if( requestCount > 4294967290 )
			requestCount= 0
		
		var buffer= netBuf.encode(new Buffer(JSON.stringify(obj)), 4)

		if( undefined!==callback )
		{
			requestCallbacks[reqIdStr]= callback
			buffer.writeUInt32LE(reqId, 2)

			if( 0!==requestTimeout )
			{
				requestTimeouts[reqIdStr]= setTimeout(function()
				{
					callback()
					requestCallbacks[reqIdStr]= null
					delete requestCallbacks[reqIdStr]
					requestTimeouts[reqIdStr]= null
					delete requestTimeouts[reqIdStr]
					callback= null, reqId= null, reqIdStr= null
				}, requestTimeout)
			}
		}
		else{
			buffer.writeUInt32LE(0, 2)
			reqId= null, reqIdStr= null
		}

		socket.write(buffer)
		buffer= null, obj= null
	}

	socket.on('readable', netBuf.decode(socket, function(buffer)
	{
		var reqId= buffer.readUInt32LE(0)
		var reqIdStr= (reqId).toString(32)
		clearTimeout(requestTimeouts[reqIdStr])
		requestTimeouts[reqIdStr]= null
		delete requestTimeouts[reqIdStr]
		if( requestCallbacks[reqIdStr] )
			requestCallbacks[reqIdStr]( JSON.parse(buffer.slice(4)) )
		requestCallbacks[reqIdStr]= null
		delete requestCallbacks[reqIdStr]
		buffer= null, reqId= null, reqIdStr= null
	}))

	return socket
}

exports.connect= Connect