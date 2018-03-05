'use strict';

var _Board = require('./Board.js');

var _Board2 = _interopRequireDefault(_Board);

var _ws = require('./ws.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var board = void 0;
var undoBtn = document.getElementById('btn');
undoBtn.onclick = function () {
    //board.undo()
    _ws.ws.send("undo");
};
//var ws = new WebSocket("ws://localhost:8001")
_ws.ws.onopen = function () {
    console.log("连接成功");
};
_ws.ws.onmessage = function (e) {
    //console.log(e.data)
    if (e.data == "undo") {
        board.undo();
    } else {
        var json = JSON.parse(e.data);
        console.log(json);
        if (json.user) {
            console.log("游客" + json.user);
            board = new _Board2.default({
                bw: 100,
                bm: 50,
                group: json.user % 2 == 0 ? 'b' : 'r'
            });
            board.init();
            console.log(board);
        } else {
            board.websocketEvent(json);
        }
    }
};