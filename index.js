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
			var reqId= buffer.readUInt32BE(0)

			// no reqId, no reply expected
			if( !reqId )
				return server.emit('request', JSON.parse(buffer.slice(6).toString()) )

			return server.emit('request', JSON.parse(buffer.slice(6).toString()), function(obj)
			{
				var buffer= netBuf.encode(new Buffer(JSON.stringify(obj)), 6)
				buffer.writeUInt32BE(reqId, 2)
				socket.write(buffer)
			})
		}))
	})

	return server
}
exports.createServer= Server

var maxRequestCount= Math.pow(256, 4) - 1000

function Connect()
{
	var socket= reconnect.apply(null, arguments)

	if( arguments && arguments[0] && typeof arguments[0].requestTimeout )
		var requestTimeout= arguments[0].requestTimeout
	else
		var requestTimeout= 0

	var requestCount= 0
	var requests= {}
	
	function onTimeout(reqId){
		requests[reqId].callback()
		delete requests[reqId]
	}
	
	socket.request= function(obj, options)
	{
		if( options===undefined )
			var options= {}
		else if( typeof options==='function' )
			var options= {callback: options}

		var buffer= netBuf.encode(new Buffer(JSON.stringify(obj)), 6)

		if( options.callback===undefined ){
			buffer.writeUInt32BE(0, 2)
		}
		else
		{
			var reqId= ++requestCount

			if( requestCount > maxRequestCount )
				requestCount= 0

			requests[reqId]= options
			buffer.writeUInt32BE(reqId, 2)

			var timeout= options.timeout!==undefined? options.timeout: requestTimeout
			if( timeout )
				requests[reqId].timeout= setTimeout(onTimeout, timeout, reqId)
		}

		socket.write(buffer)
	}

	socket.on('readable', netBuf.decode(socket, function(buffer)
	{
		var reqId= buffer.readUInt32BE(0)

		clearTimeout( requests[reqId].timeout )

		if( requests[reqId] )
		{
			if( requests[reqId].keepAlive===undefined ){
				requests[reqId].callback( JSON.parse(buffer.slice(6)) )
				delete requests[reqId]
			}
			else{
				requests[reqId].callback( JSON.parse(buffer.slice(6)), function(){delete requests[reqId]})
			}
		}
	}))

	return socket
}

exports.connect= Connect