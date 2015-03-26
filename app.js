var http = require("http");
var socketio = require("socket.io");
var fs = require("fs");
 
var server = http.createServer(function(req, res) {
	res.writeHead(200, {"Content-Type":"text/html"});
	var output = fs.readFileSync("./index.html", "utf-8");
	res.end(output);
}).listen(process.env.VMC_APP_PORT || 3000);
 
var io = socketio.listen(server);

// ユーザ管理ハッシュ
var clientHash = {};

var clientId = 1;
// 領域初期化
var map = new Array(5);
for(i = 0; i < map.length; i++){
	map[i] = new Array(5);
	for(j = 0; j < map[i].length; j++){
		map[i][j] = "";
	}
}

io.sockets.on("connection", function (socket) {

	// 切断したときに送信
	socket.on("disconnect", function () {
//		io.sockets.emit("S_to_C_message", {value:"user disconnected"});
		var _clientId = clientHash[socket.id];
		for(i = 0; i < map.length; i++){
			for(j = 0; j < map[i].length; j++){
				if(map[i][j] == _clientId){
					map[i][j] = "";
					io.sockets.emit("update_position", {i:i, j:j, value:map[i][j]});
				}
			}
		}
	});

	socket.on('get_client_id', function (fn) {
		var _clientId = clientId++;
		clientHash[socket.id] = _clientId;
		fn(_clientId);
	});

	socket.on('map_init', function(fn){
		fn(map);
	});

	socket.on('set_position', function(data, fn){
		var i = data.i;
		var j = data.j;
		var clientId = data.clientId;
		if(map[i][j] == ""){
			map[i][j] = clientId;
			fn(clientId);
		}else if(map[i][j] == clientId){
			map[i][j] = "";
			fn("");
		}
		socket.broadcast.emit("update_position", {i:i, j:j, value:map[i][j]});
	});

});