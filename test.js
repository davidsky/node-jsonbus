'use strict';

var run= 20000//Number(process.argv[2])

var bus= require('./index.js')


// var Octobus= require('./index.js')


'use strict';

// var run= Number(process.argv[2])
var server= bus.createServer().listen(8181)

var count= 0
server.on('request', function(obj, callback)
{
	// console.log('request to server' ,obj)
	// if( ++count===run )
	// 	console.timeEnd('server')
	// else if(count===1)
	// 	console.time('server')

	// // if( req && req.get('heartbeat').ping )
	// // 	console.log('ping')
	callback( {heartbeat: {pong: 1} } )
})



// var bus= new Octobus('./structures')
var client= bus.connect(8181)

var count= 0
console.time('client')
for(var i= 0; run>i; ++i)
client.request({test:'ok'}, function(obj)
{
	// console.log('response to client', obj)
	if( ++count===run )
		console.timeEnd('client')
	// if( res && res.get('heartbeat').pong )
	// 	console.log('pong')
	// else
	// 	console.log('request timeout')
})
