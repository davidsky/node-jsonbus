'use strict';

var time
var diff
var bus= require('./index.js')

var server= bus.createServer().listen(8181)
server.on('request', function(obj, callback){
	// while( obj.times-->0 )
		callback({pong: obj.times})
})

var requests= process.argv[2] || 100
var client= bus.connect({port:8181})
var responses= 0

time= process.hrtime()
for(var i= 0; requests>i; i++)
{
	client.request({ping: 1, times: 5}, function(obj)
	{
		if( ++responses>=requests )
		{
			diff= process.hrtime(time)
			console.log('client sent and received', responses, 'responses in', diff[0]+'.'+diff[1], 'seconds')
			process.exit()
		}
	})
}