#JSONbus
Fast and simple JSON passing over TCP with auto reconnecting client.

## Usage: server
.createServer() accepts Nodejs's default parameters.
```js
var bus= require('jsonbus')
var server= bus.createServer().listen(8181)
server.on('request', function(obj, callback)
{
	console.log(obj) // {ping: 1}
	callback( {pong: 2} )
})
```
## Usage: client
.connect() accept Nodejs's default parameters.
```js
var bus= require('jsonbus')
var client= bus.connect(8181)

client.request({ping: 1}, function(obj){
	 console.log(obj) // {pong: 2}
})
```
> additionally .connect() can accept [reconnect](https://github.com/davidSky/node-net-socket-reconnect) options and {requestTimeout: 500}
> on request timeout the callback will be called with undefined

## Installation
```
npm install jsonbus
```





