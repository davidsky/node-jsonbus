'use strict';

var bus= require('./../index.js')

var server= bus.createServer().listen(8181)
server.on('request', function(req, callback){
	callback(req)
})

var requests= process.argv[2] || 10
var responses= 0
// var clients= []

var client= bus.connect({port:8181})

setInterval(function(){
	console.log(responses)
	responses= 0
}, 1000)

function onResponse(res){
	++responses
	client.request(res, onResponse)
}

for(var i= 0; requests>i; i++)
	client.request({client: i}, onResponse)
