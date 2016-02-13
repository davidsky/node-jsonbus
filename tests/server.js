'use strict';

var bus= require('./../index.js')

var server= bus.createServer().listen(8181)
server.on('request', function(req, callback){
	callback(req)
})