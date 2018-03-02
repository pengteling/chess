var ws = require("nodejs-websocket")

var count = 0
// Scream server example: "hi" -> "HI!!!"
var server = ws.createServer(function (conn) {
	count ++
	console.log("New connection")
	conn.sendText("{\"user\":"+count+"}")
	conn.on("text", function (str) {
		console.log("Received "+str)
		
		server.connections.forEach(function (conn2) {
			conn2.sendText(str)
		})
	})
	conn.on("close", function (code, reason) {
		console.log("Connection closed")
	})
	conn.on("error",function(err){
		console.log(err)
	})
}).listen(8001)