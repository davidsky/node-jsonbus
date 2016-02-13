#JSONbus
Very fast, async and simple JSON message passing over TCP with auto reconnecting client and the ability to have multiple server responses to client's single request.

## Server
.createServer() accepts [default net.createServer options](https://nodejs.org/api/net.html#net_net_createserver_options_connectionlistener)
```js
var bus= require('jsonbus')
var server= bus.createServer().listen(8181)
server.on('request', function(res, callback)
{
	if( callback )
		callback({pong: 1, haveMore: false})
})
```

## Client
```js
var bus= require('jsonbus')
var client= bus.connect(8181)

// no server response aka "fire and forget"
client.request({ping: 1, times: 1})

// single server response
client.request({ping: 1, times: 1}, function(res){
	 console.log(res)
})

// multiple server responses
client.request({ping: 5, times: 5}, {timeout: 250, keepAlive: true, callback: function(res, end)
{
	 if( !res.haveMore)
	 {
	 	// end() available when keepAlive= true
	 	// use when server need to send multiple responses
		end()
	 }
}})
```

## bus.connect(options)
* __options__ accepts:
	* [__default net.connect options__](https://nodejs.org/api/net.html#net_socket_connect_options_connectlistener)
	* [__reconnect options__](https://github.com/davidSky/node-net-socket-reconnect)
	* __requestTimeout__ in milliseconds, default is 0 (no timeout), callback will be called with undefined arguments

## client.request(object, options)
* __object__ any JSON.stringify-able object
* __options__ a callback function or options object {callback, keepAlive, timeout}
	* __callback__ 
	* __keepAlive__ client must manually call the end() on server's response to cleanup requests data
	* __timeout__ overrides .connect's requestTimeout


## Benchmarking
Below is Mac Air 2013 results (25k send->receive->reply->receive on a single core)
```shell
 $ node test.js 25000
 > client sent and received 25000 responses in 0.892473207 seconds
```

## Installation
```
npm install jsonbus
```





