'use strict';

var bus= require('./../index.js')

var requests= process.argv[2] || 10
var responses= 0

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
