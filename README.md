#JSONbus
Fast and simple JSON message passing over TCP with a) auto reconnecting client and b) the ability for multiple server replies.

## Server
.createServer() accepts [default net.createServer options](https://nodejs.org/api/net.html#net_net_createserver_options_connectionlistener)
```js
var bus= require('jsonbus')
var server= bus.createServer().listen(8181)
server.on('request', function(obj, callback)
{
	console.log(obj) // {ping: 1}
	callback( {pong: 1} )
})
```

## Client
```js
var bus= require('jsonbus')
var client= bus.connect(8181)

client.request({ping: 1, times: 1}, function(obj){
	 console.log(obj) // {pong: 2}
})

var waitingForResponses= 5
client.request({ping: 5, times: 5}, {timeout: 250, keepCallback: true, callback: function(obj, end)
{
	 console.log(obj)
	 if( --waitingForResponses===0 )
	 {
		 end()
	 	// only available if keepCallback is set to true
	 	// used when single client request needs multiple server responses
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
* __options__ a callback function or options object {callback, keepCallback, timeout}
	* __callback__ 
	* __keepCallback__ client must manually call the end() on server's response to cleanup requests data
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





