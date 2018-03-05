(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Piece = require('./Piece.js');

var _Piece2 = _interopRequireDefault(_Piece);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var canvas = document.getElementById('canvas');
var context = canvas.getContext("2d");

var Board = function () {
  function Board(props) {
    _classCallCheck(this, Board);

    this.bw = props.bw;
    this.bm = props.bm;
    this.arr = [["c", "m", "x", "s", "j", "s", "x", "m", "c"], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, "p", 0, 0, 0, 0, 0, "p", 0], ["z", 0, "z", 0, "z", 0, "z", 0, "z"], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], ["z", 0, "z", 0, "z", 0, "z", 0, "z"], [0, "p", 0, 0, 0, 0, 0, "p", 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], ["c", "m", "x", "s", "j", "s", "x", "m", "c"]];
    //this.arr = this.chessArr
    this.group = props.group;
    this.step = 0;
    this.steps = [];
    this.current = null;
    this.imgArr = [];
    this.isover = false;
  }

  _createClass(Board, [{
    key: 'init',
    value: function init() {
      var _this = this;

      this.arr.forEach(function (row, i) {
        row.forEach(function (item, j) {
          //console.log(item)
          var group = void 0;
          if (_this.group === "r") {
            group = i < 5 ? "b" : "r";
          } else {
            group = i < 5 ? "r" : "b";
          }
          _this.arr[i][j] = {
            piece: item == 0 ? 0 : new _Piece2.default({
              group: group,
              text: item,
              pos: {
                x: j,
                y: i
              },
              board: _this
            }),
            pos: {
              x: j,
              y: i
              // ,
              // point: {
              //   x: this.bm + this.bw * j,
              //   y: this.bm + this.bw * i,
              // }

            } };
          if (item) {
            //图片缓存 不让图片闪烁
            _this.imgArr[group + "_" + item] = new Image();
            _this.imgArr[group + "_" + item].src = 'images/' + group + '_' + item + '.png';
          }
        });
      });
      setTimeout(function () {
        _this.putPieces();
        _this.initEvent();
      }, 500);
    }
  }, {
    key: 'websocketEvent',
    value: function websocketEvent(json) {

      if (this.step >= json.step) return;
      var currentPos = json.currentPos;
      var targetPos = json.targetPos;

      this.current = this.arr[9 - currentPos.y][8 - currentPos.x].piece;

      var mousePoint = this.arr[9 - targetPos.y][8 - targetPos.x];
      var mousePos = mousePoint.pos;

      if (!this.current) {
        //表示当前无选中棋子
        if (mousePoint.piece) {
          //表示鼠标选择了某颗棋
          // 选中这颗棋
          if (this.step % 2 == 0) {
            if (mousePoint.piece.group == "r") {
              this.current = mousePoint.piece;
              this.putPieces();
            } else {
              console.log("轮到红方走棋");
            }
          } else {
            if (mousePoint.piece.group == "b") {
              this.current = mousePoint.piece;
              this.putPieces();
            }
          }
        }
      } else {
        //当前有棋子选中的情况

        //切换本方棋子
        //console.log(mousePoint)

        if (mousePoint.piece) {
          if (mousePoint.piece.group == this.current.group) {
            this.current = mousePoint.piece;
            this.putPieces();
            return false;
          } else {
            //吃子
            if (this.current.canEat(mousePoint)) {
              this.current.eat(mousePoint);
              this.putPieces();
              return false;
            }
            console.log("吃子");
          }
        } else {
          if (this.current.canPut(mousePos)) {
            console.log("走棋");
            this.current.put(mousePos);
            this.putPieces();
          }
        }
      }
    }
  }, {
    key: 'initEvent',
    value: function initEvent() {
      var _this2 = this;

      var dis = function dis(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
      };
      canvas.onmousedown = function (e) {
        if (_this2.isover) return; //结束不让走棋      

        var mouse = {
          x: e.clientX - canvas.getBoundingClientRect().left,
          y: e.clientY - canvas.getBoundingClientRect().top
          //console.log(mouse)

        };var mousePos = void 0;
        _this2.arr.forEach(function (row, i) {
          row.forEach(function (item, j) {
            var point = _this2.posToPoint(item.pos);
            if (dis(point.x, point.y, mouse.x, mouse.y) < 0.425 * _this2.bw) {
              mousePos = {
                // x: item.pos.x,
                // y: item.pos.y
                x: j,
                y: i
                //console.log(mousePos)
              };
            }
          });
        });

        if (!mousePos) {
          //非着棋点
          return false;
        }

        var mousePoint = _this2.arr[mousePos.y][mousePos.x];
        //console.log(mousePoint)

        if (!_this2.current) {
          //表示当前无选中棋子
          if (mousePoint.piece) {
            //表示鼠标选择了某颗棋
            // 选中这颗棋
            if (mousePoint.piece.group !== _this2.group) return; //如果不是选中本方棋子不能走棋
            if (_this2.step % 2 == 0) {
              if (mousePoint.piece.group == "r") {
                _this2.current = mousePoint.piece;
                _this2.putPieces();
              } else {
                console.log("轮到红方走棋");
              }
            } else {
              if (mousePoint.piece.group == "b") {
                _this2.current = mousePoint.piece;
                _this2.putPieces();
              }
            }
          }
        } else {
          //当前有棋子选中的情况

          //切换本方棋子
          //console.log(mousePoint)

          if (mousePoint.piece) {
            if (mousePoint.piece.group == _this2.current.group) {
              _this2.current = mousePoint.piece;
              _this2.putPieces();
              return false;
            } else {
              //吃子
              if (_this2.current.canEat(mousePoint)) {
                _this2.current.eat(mousePoint);
                _this2.putPieces();
                return false;
              }
              console.log("吃子");
            }
          } else {
            if (_this2.current.canPut(mousePos)) {
              console.log("走棋");
              _this2.current.put(mousePos);
              _this2.putPieces();
            }
          }
        }
      };
    }
  }, {
    key: 'drawBoard',
    value: function drawBoard() {
      // var bw = 75; //棋盘格子大小
      // var bm = 50; //边距 
      var bw = this.bw;
      var bm = this.bm;

      canvas.width = bw * 8 + bm * 2;
      canvas.height = bw * 9 + bm * 2;

      context.lineWidth = 30;
      context.strokeRect(0, 0, canvas.width, canvas.height);

      context.lineWidth = 2;

      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 8; j++) {
          context.strokeRect(bm + j * bw, bm + i * bw, bw, bw);
        }
      }

      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 8; j++) {
          context.strokeRect(bm + j * bw, bm + (i + 5) * bw, bw, bw);
        }
      }

      context.strokeRect(bm, bm + bw * 4, bw * 8, bw);
      context.fillStyle = "#eb0000";
      context.font = 'bolder ' + bw * 2 / 3 + 'px \'Microsoft Yahei\'';
      context.textBaseline = "middle";
      context.fillText("楚河", canvas.width * 0.2, bm + bw * 4.5);
      var fontW = context.measureText("汉界").width;
      context.fillText("汉界", canvas.width * 0.8 - fontW, bm + bw * 4.5);

      //斜线
      context.beginPath();
      context.moveTo(bm + 3 * bw, bm);
      context.lineTo(bm + 5 * bw, bm + bw * 2);
      context.stroke();

      context.beginPath();
      context.moveTo(bm + 5 * bw, bm);
      context.lineTo(bm + 3 * bw, bm + bw * 2);
      context.stroke();

      context.beginPath();
      context.moveTo(bm + 3 * bw, bm + bw * 9);
      context.lineTo(bm + 5 * bw, bm + bw * 7);
      context.stroke();

      context.beginPath();
      context.moveTo(bm + 5 * bw, bm + bw * 9);
      context.lineTo(bm + 3 * bw, bm + bw * 7);
      context.stroke();

      context.lineWidth = 3;
      context.strokeStyle = "#eb0000";
      context.lineJoin = "round";
      context.lineCap = "round";

      drawPoint(1, 2);
      drawPoint(7, 2);
      drawPoint(1, 7);
      drawPoint(7, 7);

      for (var i = 0; i < 5; i++) {
        drawPoint(i * 2, 3);
        drawPoint(i * 2, 6);
      }

      function drawPoint(x, y) {
        context.save();

        context.translate(bm + bw * x, bm + bw * y);

        if (x > 0) {
          context.beginPath();
          context.lineTo(-6, -16);
          context.lineTo(-6, -6);
          context.lineTo(-16, -6);
          context.stroke();

          context.beginPath();
          context.lineTo(-6, 16);
          context.lineTo(-6, 6);
          context.lineTo(-16, 6);
          context.stroke();
        }

        if (x < 8) {

          context.beginPath();
          context.lineTo(6, -16);
          context.lineTo(6, -6);
          context.lineTo(16, -6);
          context.stroke();

          context.beginPath();
          context.lineTo(6, 16);
          context.lineTo(6, 6);
          context.lineTo(16, 6);
          context.stroke();
        }

        context.restore();
      }
    }
  }, {
    key: 'undo',
    value: function undo() {
      //悔棋
      if (this.step > 0) {
        //console.log(this.steps[this.step -1])
        var currentPiece = this.steps[this.step - 1].currentPiece;
        var currentPos = this.steps[this.step - 1].currentPos;
        var targetPos = this.steps[this.step - 1].targetPos;
        var targetPiece = this.steps[this.step - 1].targetPiece;

        this.arr[targetPos.y][targetPos.x].piece = targetPiece;
        this.arr[currentPos.y][currentPos.x].piece = currentPiece;
        currentPiece.pos = currentPos; //原来走动的棋子的pos要还原

        this.step--;
        this.steps[this.step] = null;
        this.putPieces();
      }
    }
  }, {
    key: 'posToPoint',
    value: function posToPoint(pos) {
      return {
        x: this.bm + this.bw * pos.x,
        y: this.bm + this.bw * pos.y
      };
    }
  }, {
    key: 'putPieces',
    value: function putPieces() {
      var _this3 = this;

      context.clearRect(0, 0, canvas.width, canvas.height);
      this.drawBoard();
      this.arr.forEach(function (row, i) {
        row.forEach(function (item, j) {
          if (item.piece) {
            //console.log(item)
            var piece = item.piece;
            _this3.putPiece(piece.group, piece.text, piece.pos.x, piece.pos.y);
          }
        });
      });
      if (this.current) {

        var img = new Image();
        //console.log(this.current)
        var point = this.posToPoint(this.current.pos);
        var imgW = this.bw * 1;
        img.src = 'images/' + this.current.group + '_box.png';
        img.onload = function () {

          context.drawImage(img, point.x - 1 / 2 * imgW, point.y - 1 / 2 * imgW, imgW, imgW);
        };
      }
    }
  }, {
    key: 'putPiece',
    value: function putPiece(group, text, x, y) {
      var bw = this.bw;
      var bm = this.bm;
      var imgW = bw * 0.85;
      // var img = new Image()
      // img.src = `images/${group}_${text}.png`
      var px = bm + x * bw - 1 / 2 * imgW;
      var py = bm + y * bw - 1 / 2 * imgW;

      context.drawImage(this.imgArr[group + "_" + text], px, py, imgW, imgW);
    }
  }]);

  return Board;
}();

exports.default = Board;
},{"./Piece.js":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ws = require("./ws.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Piece = function () {
  function Piece(props) {
    _classCallCheck(this, Piece);

    this.group = props.group;
    this.text = props.text;
    this.pos = props.pos;
    this.board = props.board;
  }

  _createClass(Piece, [{
    key: "min",
    value: function min(v1, v2) {
      return v1 > v2 ? v2 : v1;
    }
  }, {
    key: "max",
    value: function max(v1, v2) {
      return v1 < v2 ? v2 : v1;
    }
  }, {
    key: "c",
    value: function c(targetPos) {
      var current = this.board.current;
      if (current.pos.x == targetPos.x || current.pos.y == targetPos.y) {
        var x1 = current.pos.x;
        var y1 = current.pos.y;
        var x2 = targetPos.x;
        var y2 = targetPos.y;

        if (x1 == x2) {
          for (var i = this.min(y1, y2) + 1; i < this.max(y1, y2); i++) {
            if (this.board.arr[i][x1].piece) {
              console.log("中间隔着棋子");
              return false;
            }
          }
        }

        if (y1 == y2) {
          for (var _i = this.min(x1, x2) + 1; _i < this.max(x1, x2); _i++) {
            if (this.board.arr[y1][_i].piece) {
              console.log("中间隔着棋子");
              return false;
            }
          }
        }

        return true;
      }
    }
  }, {
    key: "m",
    value: function m(targetPos) {
      var current = this.board.current;
      var x1 = current.pos.x;
      var y1 = current.pos.y;
      var x2 = targetPos.x;
      var y2 = targetPos.y;
      if (Math.abs(x1 - x2) == 1 && Math.abs(y1 - y2) == 2) {
        var bmx = x1;
        var bmy = (y1 + y2) / 2;
        if (this.board.arr[bmy][bmx].piece) {
          console.log("蹩马腿");
        } else {
          return true;
        }
      }
      if (Math.abs(x1 - x2) == 2 && Math.abs(y1 - y2) == 1) {
        var _bmx = (x1 + x2) / 2;
        var _bmy = y1;
        if (this.board.arr[_bmy][_bmx].piece) {
          console.log("蹩马腿");
        } else {
          return true;
        }
      }
    }
  }, {
    key: "x",
    value: function x(targetPos) {
      var current = this.board.current;
      var x1 = current.pos.x;
      var y1 = current.pos.y;
      var x2 = targetPos.x;
      var y2 = targetPos.y;
      if (Math.abs(x1 - x2) == 2 && Math.abs(y1 - y2) == 2) {
        if (current.group === this.board.group && y2 >= 5 || current.group !== this.board.group && y2 <= 4) {
          //没有过河
          //console.log("相可以走")

          var tx = (x1 + x2) / 2;
          var ty = (y1 + y2) / 2;
          if (this.board.arr[ty][tx].piece) {
            console.log("田心有子");
            return false;
          } else {
            return true;
          }
        }
      }
    }
  }, {
    key: "s",
    value: function s(targetPos) {
      var current = this.board.current;
      var x1 = current.pos.x;
      var y1 = current.pos.y;
      var x2 = targetPos.x;
      var y2 = targetPos.y;
      if (Math.abs(x1 - x2) == 1 && Math.abs(y1 - y2) == 1) {
        //仕走对角
        if (x2 >= 3 && x2 <= 5 && (y2 <= 2 || y2 >= 7)) {
          return true;
        } else {
          console.log("出宫");
        }
      }
    }
  }, {
    key: "j",
    value: function j(targetPos) {
      var current = this.board.current;
      var x1 = current.pos.x;
      var y1 = current.pos.y;
      var x2 = targetPos.x;
      var y2 = targetPos.y;
      /* 宫内走棋 */
      if (Math.abs(x1 - x2) + Math.abs(y1 - y2) == 1) {
        if (x2 >= 3 && x2 <= 5 && (y2 <= 2 || y2 >= 7)) {
          return true;
        } else {
          console.log("出宫");
        }
      }
      /* 直杀对方将 */
      if (x1 == x2 && this.board.arr[y2][x2].piece.text === "j") {
        for (var i = this.min(y1, y2) + 1; i < this.max(y1, y2); i++) {
          if (this.board.arr[i][x1].piece) {
            console.log("将不能飞");
            return false;
          }
        }
        return true;
      }
    }
  }, {
    key: "z",
    value: function z(targetPos) {
      var current = this.board.current;
      var x1 = current.pos.x;
      var y1 = current.pos.y;
      var x2 = targetPos.x;
      var y2 = targetPos.y;
      if (current.group === this.board.group) {

        if (y1 >= 5) {
          //未过河                
          if (y2 == y1 - 1 && x2 == x1) {
            return true;
          }
        } else {
          if (y2 == y1 - 1 && x2 == x1 || y2 == y1 && Math.abs(x2 - x1) == 1) {
            return true;
          }
        }
      }
      if (current.group !== this.board.group) {

        if (y1 < 5) {
          //未过河                
          if (y2 == y1 + 1 && x2 == x1) {
            return true;
          }
        } else {
          if (y2 == y1 + 1 && x2 == x1 || y2 == y1 && Math.abs(x2 - x1) == 1) {
            return true;
          }
        }
      }
    }
  }, {
    key: "p",
    value: function p(targetPos) {
      var current = this.board.current;
      var x1 = current.pos.x;
      var y1 = current.pos.y;
      var x2 = targetPos.x;
      var y2 = targetPos.y;

      if (x1 == x2) {
        var count = 0;
        for (var i = this.min(y1, y2) + 1; i < this.max(y1, y2); i++) {
          if (this.board.arr[i][x1].piece) {
            count++;
          }
        }
        if (count == 1) {
          return true;
        }
      }
      if (y1 == y2) {
        var _count = 0;
        for (var _i2 = this.min(x1, x2) + 1; _i2 < this.max(x1, x2); _i2++) {
          if (this.board.arr[y1][_i2].piece) {
            _count++;
          }
        }
        if (_count == 1) {
          return true;
        }
      }
    }
  }, {
    key: "canPut",
    value: function canPut(targetPos) {
      var type = this.board.current.text;
      if (type == "p") {
        type = "c";
      }
      return this[type](targetPos);
    }
  }, {
    key: "canEat",
    value: function canEat(targetPoint) {
      var type = this.board.current.text;
      var targetPos = targetPoint.pos;
      return this[type](targetPos);
    }
  }, {
    key: "put",
    value: function put(targetPos) {
      var x0 = this.board.current.pos.x;
      var y0 = this.board.current.pos.y;
      this.board.steps[this.board.step] = {
        currentPos: { x: x0, y: y0 },
        currentPiece: this.board.current,
        targetPos: targetPos,
        targetPiece: 0
      };
      var json = {
        targetPos: targetPos,
        currentPos: { x: x0, y: y0 },
        step: this.board.step + 1
        // let json = {
        //   targetPos: {x: targetPos.x, y:9 - targetPos.y},
        //   currentPos: { x: x0, y: 9- y0 }
        // }

      };_ws.ws.send(JSON.stringify(json));

      this.board.arr[targetPos.y][targetPos.x].piece = this.board.current; //arr中目标点位对象的棋子赋值成 当前棋子 
      this.board.arr[targetPos.y][targetPos.x].piece.pos = targetPos;

      this.board.arr[y0][x0].piece = 0;

      this.board.current = null;
      this.board.step++;
    }
  }, {
    key: "eat",
    value: function eat(targetPoint) {

      //console.log(targetPoint)
      if (targetPoint.piece.text == "j") {
        var winner = targetPoint.piece.group == "r" ? "黑" : "红";
        alert(winner + "方赢了！");
        this.board.isover = true;
      }

      var x0 = this.board.current.pos.x;
      var y0 = this.board.current.pos.y;

      this.board.steps[this.board.step] = {
        currentPos: { x: x0, y: y0 },
        currentPiece: this.board.current,
        targetPos: targetPoint.pos,
        targetPiece: targetPoint.piece
      };
      var json = {
        targetPos: targetPoint.pos,
        currentPos: { x: x0, y: y0 },
        step: this.board.step + 1
      };

      _ws.ws.send(JSON.stringify(json));

      this.board.arr[targetPoint.pos.y][targetPoint.pos.x].piece = this.board.current; //arr中目标点位对象的棋子赋值成 
      this.board.arr[targetPoint.pos.y][targetPoint.pos.x].piece.pos = targetPoint.pos;

      this.board.arr[y0][x0].piece = 0;

      this.board.current = null;
      this.board.step++;
    }
  }]);

  return Piece;
}();

exports.default = Piece;
},{"./ws.js":4}],3:[function(require,module,exports){
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
                bw: 75,
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
},{"./Board.js":1,"./ws.js":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ws = exports.ws = new WebSocket("ws://localhost:8001");
},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkE6XFzlhazlvIDor75cXGNoZXNzXFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJBOi/lhazlvIDor74vY2hlc3MvanMvQm9hcmQuanMiLCJBOi/lhazlvIDor74vY2hlc3MvanMvUGllY2UuanMiLCJBOi/lhazlvIDor74vY2hlc3MvanMvZmFrZV9jNjZlZGY5MS5qcyIsIkE6L+WFrOW8gOivvi9jaGVzcy9qcy93cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfUGllY2UgPSByZXF1aXJlKCcuL1BpZWNlLmpzJyk7XG5cbnZhciBfUGllY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUGllY2UpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xudmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXG52YXIgQm9hcmQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIEJvYXJkKHByb3BzKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEJvYXJkKTtcblxuICAgIHRoaXMuYncgPSBwcm9wcy5idztcbiAgICB0aGlzLmJtID0gcHJvcHMuYm07XG4gICAgdGhpcy5hcnIgPSBbW1wiY1wiLCBcIm1cIiwgXCJ4XCIsIFwic1wiLCBcImpcIiwgXCJzXCIsIFwieFwiLCBcIm1cIiwgXCJjXCJdLCBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sIFswLCBcInBcIiwgMCwgMCwgMCwgMCwgMCwgXCJwXCIsIDBdLCBbXCJ6XCIsIDAsIFwielwiLCAwLCBcInpcIiwgMCwgXCJ6XCIsIDAsIFwielwiXSwgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLCBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sIFtcInpcIiwgMCwgXCJ6XCIsIDAsIFwielwiLCAwLCBcInpcIiwgMCwgXCJ6XCJdLCBbMCwgXCJwXCIsIDAsIDAsIDAsIDAsIDAsIFwicFwiLCAwXSwgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLCBbXCJjXCIsIFwibVwiLCBcInhcIiwgXCJzXCIsIFwialwiLCBcInNcIiwgXCJ4XCIsIFwibVwiLCBcImNcIl1dO1xuICAgIC8vdGhpcy5hcnIgPSB0aGlzLmNoZXNzQXJyXG4gICAgdGhpcy5ncm91cCA9IHByb3BzLmdyb3VwO1xuICAgIHRoaXMuc3RlcCA9IDA7XG4gICAgdGhpcy5zdGVwcyA9IFtdO1xuICAgIHRoaXMuY3VycmVudCA9IG51bGw7XG4gICAgdGhpcy5pbWdBcnIgPSBbXTtcbiAgICB0aGlzLmlzb3ZlciA9IGZhbHNlO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKEJvYXJkLCBbe1xuICAgIGtleTogJ2luaXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdGhpcy5hcnIuZm9yRWFjaChmdW5jdGlvbiAocm93LCBpKSB7XG4gICAgICAgIHJvdy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBqKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhpdGVtKVxuICAgICAgICAgIHZhciBncm91cCA9IHZvaWQgMDtcbiAgICAgICAgICBpZiAoX3RoaXMuZ3JvdXAgPT09IFwiclwiKSB7XG4gICAgICAgICAgICBncm91cCA9IGkgPCA1ID8gXCJiXCIgOiBcInJcIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ3JvdXAgPSBpIDwgNSA/IFwiclwiIDogXCJiXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIF90aGlzLmFycltpXVtqXSA9IHtcbiAgICAgICAgICAgIHBpZWNlOiBpdGVtID09IDAgPyAwIDogbmV3IF9QaWVjZTIuZGVmYXVsdCh7XG4gICAgICAgICAgICAgIGdyb3VwOiBncm91cCxcbiAgICAgICAgICAgICAgdGV4dDogaXRlbSxcbiAgICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgeDogaixcbiAgICAgICAgICAgICAgICB5OiBpXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGJvYXJkOiBfdGhpc1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgeDogaixcbiAgICAgICAgICAgICAgeTogaVxuICAgICAgICAgICAgICAvLyAsXG4gICAgICAgICAgICAgIC8vIHBvaW50OiB7XG4gICAgICAgICAgICAgIC8vICAgeDogdGhpcy5ibSArIHRoaXMuYncgKiBqLFxuICAgICAgICAgICAgICAvLyAgIHk6IHRoaXMuYm0gKyB0aGlzLmJ3ICogaSxcbiAgICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICB9IH07XG4gICAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgIC8v5Zu+54mH57yT5a2YIOS4jeiuqeWbvueJh+mXqueDgVxuICAgICAgICAgICAgX3RoaXMuaW1nQXJyW2dyb3VwICsgXCJfXCIgKyBpdGVtXSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgX3RoaXMuaW1nQXJyW2dyb3VwICsgXCJfXCIgKyBpdGVtXS5zcmMgPSAnaW1hZ2VzLycgKyBncm91cCArICdfJyArIGl0ZW0gKyAnLnBuZyc7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIF90aGlzLnB1dFBpZWNlcygpO1xuICAgICAgICBfdGhpcy5pbml0RXZlbnQoKTtcbiAgICAgIH0sIDUwMCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnd2Vic29ja2V0RXZlbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB3ZWJzb2NrZXRFdmVudChqc29uKSB7XG5cbiAgICAgIGlmICh0aGlzLnN0ZXAgPj0ganNvbi5zdGVwKSByZXR1cm47XG4gICAgICB2YXIgY3VycmVudFBvcyA9IGpzb24uY3VycmVudFBvcztcbiAgICAgIHZhciB0YXJnZXRQb3MgPSBqc29uLnRhcmdldFBvcztcblxuICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5hcnJbOSAtIGN1cnJlbnRQb3MueV1bOCAtIGN1cnJlbnRQb3MueF0ucGllY2U7XG5cbiAgICAgIHZhciBtb3VzZVBvaW50ID0gdGhpcy5hcnJbOSAtIHRhcmdldFBvcy55XVs4IC0gdGFyZ2V0UG9zLnhdO1xuICAgICAgdmFyIG1vdXNlUG9zID0gbW91c2VQb2ludC5wb3M7XG5cbiAgICAgIGlmICghdGhpcy5jdXJyZW50KSB7XG4gICAgICAgIC8v6KGo56S65b2T5YmN5peg6YCJ5Lit5qOL5a2QXG4gICAgICAgIGlmIChtb3VzZVBvaW50LnBpZWNlKSB7XG4gICAgICAgICAgLy/ooajnpLrpvKDmoIfpgInmi6nkuobmn5Dpopfmo4tcbiAgICAgICAgICAvLyDpgInkuK3ov5npopfmo4tcbiAgICAgICAgICBpZiAodGhpcy5zdGVwICUgMiA9PSAwKSB7XG4gICAgICAgICAgICBpZiAobW91c2VQb2ludC5waWVjZS5ncm91cCA9PSBcInJcIikge1xuICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBtb3VzZVBvaW50LnBpZWNlO1xuICAgICAgICAgICAgICB0aGlzLnB1dFBpZWNlcygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLova7liLDnuqLmlrnotbDmo4tcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChtb3VzZVBvaW50LnBpZWNlLmdyb3VwID09IFwiYlwiKSB7XG4gICAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IG1vdXNlUG9pbnQucGllY2U7XG4gICAgICAgICAgICAgIHRoaXMucHV0UGllY2VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL+W9k+WJjeacieaji+WtkOmAieS4reeahOaDheWGtVxuXG4gICAgICAgIC8v5YiH5o2i5pys5pa55qOL5a2QXG4gICAgICAgIC8vY29uc29sZS5sb2cobW91c2VQb2ludClcblxuICAgICAgICBpZiAobW91c2VQb2ludC5waWVjZSkge1xuICAgICAgICAgIGlmIChtb3VzZVBvaW50LnBpZWNlLmdyb3VwID09IHRoaXMuY3VycmVudC5ncm91cCkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gbW91c2VQb2ludC5waWVjZTtcbiAgICAgICAgICAgIHRoaXMucHV0UGllY2VzKCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8v5ZCD5a2QXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50LmNhbkVhdChtb3VzZVBvaW50KSkge1xuICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQuZWF0KG1vdXNlUG9pbnQpO1xuICAgICAgICAgICAgICB0aGlzLnB1dFBpZWNlcygpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIuWQg+WtkFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuY3VycmVudC5jYW5QdXQobW91c2VQb3MpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIui1sOaji1wiKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC5wdXQobW91c2VQb3MpO1xuICAgICAgICAgICAgdGhpcy5wdXRQaWVjZXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdpbml0RXZlbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbml0RXZlbnQoKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgdmFyIGRpcyA9IGZ1bmN0aW9uIGRpcyh4MSwgeTEsIHgyLCB5Mikge1xuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KCh4MSAtIHgyKSAqICh4MSAtIHgyKSArICh5MSAtIHkyKSAqICh5MSAtIHkyKSk7XG4gICAgICB9O1xuICAgICAgY2FudmFzLm9ubW91c2Vkb3duID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKF90aGlzMi5pc292ZXIpIHJldHVybjsgLy/nu5PmnZ/kuI3orqnotbDmo4sgICAgICBcblxuICAgICAgICB2YXIgbW91c2UgPSB7XG4gICAgICAgICAgeDogZS5jbGllbnRYIC0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQsXG4gICAgICAgICAgeTogZS5jbGllbnRZIC0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcFxuICAgICAgICAgIC8vY29uc29sZS5sb2cobW91c2UpXG5cbiAgICAgICAgfTt2YXIgbW91c2VQb3MgPSB2b2lkIDA7XG4gICAgICAgIF90aGlzMi5hcnIuZm9yRWFjaChmdW5jdGlvbiAocm93LCBpKSB7XG4gICAgICAgICAgcm93LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGopIHtcbiAgICAgICAgICAgIHZhciBwb2ludCA9IF90aGlzMi5wb3NUb1BvaW50KGl0ZW0ucG9zKTtcbiAgICAgICAgICAgIGlmIChkaXMocG9pbnQueCwgcG9pbnQueSwgbW91c2UueCwgbW91c2UueSkgPCAwLjQyNSAqIF90aGlzMi5idykge1xuICAgICAgICAgICAgICBtb3VzZVBvcyA9IHtcbiAgICAgICAgICAgICAgICAvLyB4OiBpdGVtLnBvcy54LFxuICAgICAgICAgICAgICAgIC8vIHk6IGl0ZW0ucG9zLnlcbiAgICAgICAgICAgICAgICB4OiBqLFxuICAgICAgICAgICAgICAgIHk6IGlcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKG1vdXNlUG9zKVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIW1vdXNlUG9zKSB7XG4gICAgICAgICAgLy/pnZ7nnYDmo4vngrlcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbW91c2VQb2ludCA9IF90aGlzMi5hcnJbbW91c2VQb3MueV1bbW91c2VQb3MueF07XG4gICAgICAgIC8vY29uc29sZS5sb2cobW91c2VQb2ludClcblxuICAgICAgICBpZiAoIV90aGlzMi5jdXJyZW50KSB7XG4gICAgICAgICAgLy/ooajnpLrlvZPliY3ml6DpgInkuK3mo4vlrZBcbiAgICAgICAgICBpZiAobW91c2VQb2ludC5waWVjZSkge1xuICAgICAgICAgICAgLy/ooajnpLrpvKDmoIfpgInmi6nkuobmn5Dpopfmo4tcbiAgICAgICAgICAgIC8vIOmAieS4rei/memil+aji1xuICAgICAgICAgICAgaWYgKG1vdXNlUG9pbnQucGllY2UuZ3JvdXAgIT09IF90aGlzMi5ncm91cCkgcmV0dXJuOyAvL+WmguaenOS4jeaYr+mAieS4reacrOaWueaji+WtkOS4jeiDvei1sOaji1xuICAgICAgICAgICAgaWYgKF90aGlzMi5zdGVwICUgMiA9PSAwKSB7XG4gICAgICAgICAgICAgIGlmIChtb3VzZVBvaW50LnBpZWNlLmdyb3VwID09IFwiclwiKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLmN1cnJlbnQgPSBtb3VzZVBvaW50LnBpZWNlO1xuICAgICAgICAgICAgICAgIF90aGlzMi5wdXRQaWVjZXMoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIui9ruWIsOe6ouaWuei1sOaji1wiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKG1vdXNlUG9pbnQucGllY2UuZ3JvdXAgPT0gXCJiXCIpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuY3VycmVudCA9IG1vdXNlUG9pbnQucGllY2U7XG4gICAgICAgICAgICAgICAgX3RoaXMyLnB1dFBpZWNlcygpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8v5b2T5YmN5pyJ5qOL5a2Q6YCJ5Lit55qE5oOF5Ya1XG5cbiAgICAgICAgICAvL+WIh+aNouacrOaWueaji+WtkFxuICAgICAgICAgIC8vY29uc29sZS5sb2cobW91c2VQb2ludClcblxuICAgICAgICAgIGlmIChtb3VzZVBvaW50LnBpZWNlKSB7XG4gICAgICAgICAgICBpZiAobW91c2VQb2ludC5waWVjZS5ncm91cCA9PSBfdGhpczIuY3VycmVudC5ncm91cCkge1xuICAgICAgICAgICAgICBfdGhpczIuY3VycmVudCA9IG1vdXNlUG9pbnQucGllY2U7XG4gICAgICAgICAgICAgIF90aGlzMi5wdXRQaWVjZXMoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy/lkIPlrZBcbiAgICAgICAgICAgICAgaWYgKF90aGlzMi5jdXJyZW50LmNhbkVhdChtb3VzZVBvaW50KSkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5jdXJyZW50LmVhdChtb3VzZVBvaW50KTtcbiAgICAgICAgICAgICAgICBfdGhpczIucHV0UGllY2VzKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5ZCD5a2QXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMyLmN1cnJlbnQuY2FuUHV0KG1vdXNlUG9zKSkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIui1sOaji1wiKTtcbiAgICAgICAgICAgICAgX3RoaXMyLmN1cnJlbnQucHV0KG1vdXNlUG9zKTtcbiAgICAgICAgICAgICAgX3RoaXMyLnB1dFBpZWNlcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdkcmF3Qm9hcmQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkcmF3Qm9hcmQoKSB7XG4gICAgICAvLyB2YXIgYncgPSA3NTsgLy/mo4vnm5jmoLzlrZDlpKflsI9cbiAgICAgIC8vIHZhciBibSA9IDUwOyAvL+i+uei3nSBcbiAgICAgIHZhciBidyA9IHRoaXMuYnc7XG4gICAgICB2YXIgYm0gPSB0aGlzLmJtO1xuXG4gICAgICBjYW52YXMud2lkdGggPSBidyAqIDggKyBibSAqIDI7XG4gICAgICBjYW52YXMuaGVpZ2h0ID0gYncgKiA5ICsgYm0gKiAyO1xuXG4gICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDMwO1xuICAgICAgY29udGV4dC5zdHJva2VSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICAgIGNvbnRleHQubGluZVdpZHRoID0gMjtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCA4OyBqKyspIHtcbiAgICAgICAgICBjb250ZXh0LnN0cm9rZVJlY3QoYm0gKyBqICogYncsIGJtICsgaSAqIGJ3LCBidywgYncpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgODsgaisrKSB7XG4gICAgICAgICAgY29udGV4dC5zdHJva2VSZWN0KGJtICsgaiAqIGJ3LCBibSArIChpICsgNSkgKiBidywgYncsIGJ3KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb250ZXh0LnN0cm9rZVJlY3QoYm0sIGJtICsgYncgKiA0LCBidyAqIDgsIGJ3KTtcbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCIjZWIwMDAwXCI7XG4gICAgICBjb250ZXh0LmZvbnQgPSAnYm9sZGVyICcgKyBidyAqIDIgLyAzICsgJ3B4IFxcJ01pY3Jvc29mdCBZYWhlaVxcJyc7XG4gICAgICBjb250ZXh0LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG4gICAgICBjb250ZXh0LmZpbGxUZXh0KFwi5qWa5rKzXCIsIGNhbnZhcy53aWR0aCAqIDAuMiwgYm0gKyBidyAqIDQuNSk7XG4gICAgICB2YXIgZm9udFcgPSBjb250ZXh0Lm1lYXN1cmVUZXh0KFwi5rGJ55WMXCIpLndpZHRoO1xuICAgICAgY29udGV4dC5maWxsVGV4dChcIuaxieeVjFwiLCBjYW52YXMud2lkdGggKiAwLjggLSBmb250VywgYm0gKyBidyAqIDQuNSk7XG5cbiAgICAgIC8v5pac57q/XG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgY29udGV4dC5tb3ZlVG8oYm0gKyAzICogYncsIGJtKTtcbiAgICAgIGNvbnRleHQubGluZVRvKGJtICsgNSAqIGJ3LCBibSArIGJ3ICogMik7XG4gICAgICBjb250ZXh0LnN0cm9rZSgpO1xuXG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgY29udGV4dC5tb3ZlVG8oYm0gKyA1ICogYncsIGJtKTtcbiAgICAgIGNvbnRleHQubGluZVRvKGJtICsgMyAqIGJ3LCBibSArIGJ3ICogMik7XG4gICAgICBjb250ZXh0LnN0cm9rZSgpO1xuXG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgY29udGV4dC5tb3ZlVG8oYm0gKyAzICogYncsIGJtICsgYncgKiA5KTtcbiAgICAgIGNvbnRleHQubGluZVRvKGJtICsgNSAqIGJ3LCBibSArIGJ3ICogNyk7XG4gICAgICBjb250ZXh0LnN0cm9rZSgpO1xuXG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgY29udGV4dC5tb3ZlVG8oYm0gKyA1ICogYncsIGJtICsgYncgKiA5KTtcbiAgICAgIGNvbnRleHQubGluZVRvKGJtICsgMyAqIGJ3LCBibSArIGJ3ICogNyk7XG4gICAgICBjb250ZXh0LnN0cm9rZSgpO1xuXG4gICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDM7XG4gICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCIjZWIwMDAwXCI7XG4gICAgICBjb250ZXh0LmxpbmVKb2luID0gXCJyb3VuZFwiO1xuICAgICAgY29udGV4dC5saW5lQ2FwID0gXCJyb3VuZFwiO1xuXG4gICAgICBkcmF3UG9pbnQoMSwgMik7XG4gICAgICBkcmF3UG9pbnQoNywgMik7XG4gICAgICBkcmF3UG9pbnQoMSwgNyk7XG4gICAgICBkcmF3UG9pbnQoNywgNyk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgIGRyYXdQb2ludChpICogMiwgMyk7XG4gICAgICAgIGRyYXdQb2ludChpICogMiwgNik7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGRyYXdQb2ludCh4LCB5KSB7XG4gICAgICAgIGNvbnRleHQuc2F2ZSgpO1xuXG4gICAgICAgIGNvbnRleHQudHJhbnNsYXRlKGJtICsgYncgKiB4LCBibSArIGJ3ICogeSk7XG5cbiAgICAgICAgaWYgKHggPiAwKSB7XG4gICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICBjb250ZXh0LmxpbmVUbygtNiwgLTE2KTtcbiAgICAgICAgICBjb250ZXh0LmxpbmVUbygtNiwgLTYpO1xuICAgICAgICAgIGNvbnRleHQubGluZVRvKC0xNiwgLTYpO1xuICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG5cbiAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgIGNvbnRleHQubGluZVRvKC02LCAxNik7XG4gICAgICAgICAgY29udGV4dC5saW5lVG8oLTYsIDYpO1xuICAgICAgICAgIGNvbnRleHQubGluZVRvKC0xNiwgNik7XG4gICAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh4IDwgOCkge1xuXG4gICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICBjb250ZXh0LmxpbmVUbyg2LCAtMTYpO1xuICAgICAgICAgIGNvbnRleHQubGluZVRvKDYsIC02KTtcbiAgICAgICAgICBjb250ZXh0LmxpbmVUbygxNiwgLTYpO1xuICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG5cbiAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgIGNvbnRleHQubGluZVRvKDYsIDE2KTtcbiAgICAgICAgICBjb250ZXh0LmxpbmVUbyg2LCA2KTtcbiAgICAgICAgICBjb250ZXh0LmxpbmVUbygxNiwgNik7XG4gICAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQucmVzdG9yZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VuZG8nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1bmRvKCkge1xuICAgICAgLy/mgpTmo4tcbiAgICAgIGlmICh0aGlzLnN0ZXAgPiAwKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5zdGVwc1t0aGlzLnN0ZXAgLTFdKVxuICAgICAgICB2YXIgY3VycmVudFBpZWNlID0gdGhpcy5zdGVwc1t0aGlzLnN0ZXAgLSAxXS5jdXJyZW50UGllY2U7XG4gICAgICAgIHZhciBjdXJyZW50UG9zID0gdGhpcy5zdGVwc1t0aGlzLnN0ZXAgLSAxXS5jdXJyZW50UG9zO1xuICAgICAgICB2YXIgdGFyZ2V0UG9zID0gdGhpcy5zdGVwc1t0aGlzLnN0ZXAgLSAxXS50YXJnZXRQb3M7XG4gICAgICAgIHZhciB0YXJnZXRQaWVjZSA9IHRoaXMuc3RlcHNbdGhpcy5zdGVwIC0gMV0udGFyZ2V0UGllY2U7XG5cbiAgICAgICAgdGhpcy5hcnJbdGFyZ2V0UG9zLnldW3RhcmdldFBvcy54XS5waWVjZSA9IHRhcmdldFBpZWNlO1xuICAgICAgICB0aGlzLmFycltjdXJyZW50UG9zLnldW2N1cnJlbnRQb3MueF0ucGllY2UgPSBjdXJyZW50UGllY2U7XG4gICAgICAgIGN1cnJlbnRQaWVjZS5wb3MgPSBjdXJyZW50UG9zOyAvL+WOn+adpei1sOWKqOeahOaji+WtkOeahHBvc+imgei/mOWOn1xuXG4gICAgICAgIHRoaXMuc3RlcC0tO1xuICAgICAgICB0aGlzLnN0ZXBzW3RoaXMuc3RlcF0gPSBudWxsO1xuICAgICAgICB0aGlzLnB1dFBpZWNlcygpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3Bvc1RvUG9pbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwb3NUb1BvaW50KHBvcykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogdGhpcy5ibSArIHRoaXMuYncgKiBwb3MueCxcbiAgICAgICAgeTogdGhpcy5ibSArIHRoaXMuYncgKiBwb3MueVxuICAgICAgfTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdwdXRQaWVjZXMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwdXRQaWVjZXMoKSB7XG4gICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgIHRoaXMuZHJhd0JvYXJkKCk7XG4gICAgICB0aGlzLmFyci5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGkpIHtcbiAgICAgICAgcm93LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGopIHtcbiAgICAgICAgICBpZiAoaXRlbS5waWVjZSkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhpdGVtKVxuICAgICAgICAgICAgdmFyIHBpZWNlID0gaXRlbS5waWVjZTtcbiAgICAgICAgICAgIF90aGlzMy5wdXRQaWVjZShwaWVjZS5ncm91cCwgcGllY2UudGV4dCwgcGllY2UucG9zLngsIHBpZWNlLnBvcy55KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICBpZiAodGhpcy5jdXJyZW50KSB7XG5cbiAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMuY3VycmVudClcbiAgICAgICAgdmFyIHBvaW50ID0gdGhpcy5wb3NUb1BvaW50KHRoaXMuY3VycmVudC5wb3MpO1xuICAgICAgICB2YXIgaW1nVyA9IHRoaXMuYncgKiAxO1xuICAgICAgICBpbWcuc3JjID0gJ2ltYWdlcy8nICsgdGhpcy5jdXJyZW50Lmdyb3VwICsgJ19ib3gucG5nJztcbiAgICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGltZywgcG9pbnQueCAtIDEgLyAyICogaW1nVywgcG9pbnQueSAtIDEgLyAyICogaW1nVywgaW1nVywgaW1nVyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncHV0UGllY2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwdXRQaWVjZShncm91cCwgdGV4dCwgeCwgeSkge1xuICAgICAgdmFyIGJ3ID0gdGhpcy5idztcbiAgICAgIHZhciBibSA9IHRoaXMuYm07XG4gICAgICB2YXIgaW1nVyA9IGJ3ICogMC44NTtcbiAgICAgIC8vIHZhciBpbWcgPSBuZXcgSW1hZ2UoKVxuICAgICAgLy8gaW1nLnNyYyA9IGBpbWFnZXMvJHtncm91cH1fJHt0ZXh0fS5wbmdgXG4gICAgICB2YXIgcHggPSBibSArIHggKiBidyAtIDEgLyAyICogaW1nVztcbiAgICAgIHZhciBweSA9IGJtICsgeSAqIGJ3IC0gMSAvIDIgKiBpbWdXO1xuXG4gICAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZ0Fycltncm91cCArIFwiX1wiICsgdGV4dF0sIHB4LCBweSwgaW1nVywgaW1nVyk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEJvYXJkO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBCb2FyZDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF93cyA9IHJlcXVpcmUoXCIuL3dzLmpzXCIpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgUGllY2UgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFBpZWNlKHByb3BzKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBpZWNlKTtcblxuICAgIHRoaXMuZ3JvdXAgPSBwcm9wcy5ncm91cDtcbiAgICB0aGlzLnRleHQgPSBwcm9wcy50ZXh0O1xuICAgIHRoaXMucG9zID0gcHJvcHMucG9zO1xuICAgIHRoaXMuYm9hcmQgPSBwcm9wcy5ib2FyZDtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhQaWVjZSwgW3tcbiAgICBrZXk6IFwibWluXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1pbih2MSwgdjIpIHtcbiAgICAgIHJldHVybiB2MSA+IHYyID8gdjIgOiB2MTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibWF4XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1heCh2MSwgdjIpIHtcbiAgICAgIHJldHVybiB2MSA8IHYyID8gdjIgOiB2MTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiY1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjKHRhcmdldFBvcykge1xuICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmJvYXJkLmN1cnJlbnQ7XG4gICAgICBpZiAoY3VycmVudC5wb3MueCA9PSB0YXJnZXRQb3MueCB8fCBjdXJyZW50LnBvcy55ID09IHRhcmdldFBvcy55KSB7XG4gICAgICAgIHZhciB4MSA9IGN1cnJlbnQucG9zLng7XG4gICAgICAgIHZhciB5MSA9IGN1cnJlbnQucG9zLnk7XG4gICAgICAgIHZhciB4MiA9IHRhcmdldFBvcy54O1xuICAgICAgICB2YXIgeTIgPSB0YXJnZXRQb3MueTtcblxuICAgICAgICBpZiAoeDEgPT0geDIpIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gdGhpcy5taW4oeTEsIHkyKSArIDE7IGkgPCB0aGlzLm1heCh5MSwgeTIpOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJvYXJkLmFycltpXVt4MV0ucGllY2UpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLkuK3pl7TpmpTnnYDmo4vlrZBcIik7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoeTEgPT0geTIpIHtcbiAgICAgICAgICBmb3IgKHZhciBfaSA9IHRoaXMubWluKHgxLCB4MikgKyAxOyBfaSA8IHRoaXMubWF4KHgxLCB4Mik7IF9pKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJvYXJkLmFyclt5MV1bX2ldLnBpZWNlKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5Lit6Ze06ZqU552A5qOL5a2QXCIpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIm1cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbSh0YXJnZXRQb3MpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5ib2FyZC5jdXJyZW50O1xuICAgICAgdmFyIHgxID0gY3VycmVudC5wb3MueDtcbiAgICAgIHZhciB5MSA9IGN1cnJlbnQucG9zLnk7XG4gICAgICB2YXIgeDIgPSB0YXJnZXRQb3MueDtcbiAgICAgIHZhciB5MiA9IHRhcmdldFBvcy55O1xuICAgICAgaWYgKE1hdGguYWJzKHgxIC0geDIpID09IDEgJiYgTWF0aC5hYnMoeTEgLSB5MikgPT0gMikge1xuICAgICAgICB2YXIgYm14ID0geDE7XG4gICAgICAgIHZhciBibXkgPSAoeTEgKyB5MikgLyAyO1xuICAgICAgICBpZiAodGhpcy5ib2FyZC5hcnJbYm15XVtibXhdLnBpZWNlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCLouanpqazohb9cIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChNYXRoLmFicyh4MSAtIHgyKSA9PSAyICYmIE1hdGguYWJzKHkxIC0geTIpID09IDEpIHtcbiAgICAgICAgdmFyIF9ibXggPSAoeDEgKyB4MikgLyAyO1xuICAgICAgICB2YXIgX2JteSA9IHkxO1xuICAgICAgICBpZiAodGhpcy5ib2FyZC5hcnJbX2JteV1bX2JteF0ucGllY2UpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIui5qemprOiFv1wiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJ4XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHgodGFyZ2V0UG9zKSB7XG4gICAgICB2YXIgY3VycmVudCA9IHRoaXMuYm9hcmQuY3VycmVudDtcbiAgICAgIHZhciB4MSA9IGN1cnJlbnQucG9zLng7XG4gICAgICB2YXIgeTEgPSBjdXJyZW50LnBvcy55O1xuICAgICAgdmFyIHgyID0gdGFyZ2V0UG9zLng7XG4gICAgICB2YXIgeTIgPSB0YXJnZXRQb3MueTtcbiAgICAgIGlmIChNYXRoLmFicyh4MSAtIHgyKSA9PSAyICYmIE1hdGguYWJzKHkxIC0geTIpID09IDIpIHtcbiAgICAgICAgaWYgKGN1cnJlbnQuZ3JvdXAgPT09IHRoaXMuYm9hcmQuZ3JvdXAgJiYgeTIgPj0gNSB8fCBjdXJyZW50Lmdyb3VwICE9PSB0aGlzLmJvYXJkLmdyb3VwICYmIHkyIDw9IDQpIHtcbiAgICAgICAgICAvL+ayoeaciei/h+ays1xuICAgICAgICAgIC8vY29uc29sZS5sb2coXCLnm7jlj6/ku6XotbBcIilcblxuICAgICAgICAgIHZhciB0eCA9ICh4MSArIHgyKSAvIDI7XG4gICAgICAgICAgdmFyIHR5ID0gKHkxICsgeTIpIC8gMjtcbiAgICAgICAgICBpZiAodGhpcy5ib2FyZC5hcnJbdHldW3R4XS5waWVjZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLnlLDlv4PmnInlrZBcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHModGFyZ2V0UG9zKSB7XG4gICAgICB2YXIgY3VycmVudCA9IHRoaXMuYm9hcmQuY3VycmVudDtcbiAgICAgIHZhciB4MSA9IGN1cnJlbnQucG9zLng7XG4gICAgICB2YXIgeTEgPSBjdXJyZW50LnBvcy55O1xuICAgICAgdmFyIHgyID0gdGFyZ2V0UG9zLng7XG4gICAgICB2YXIgeTIgPSB0YXJnZXRQb3MueTtcbiAgICAgIGlmIChNYXRoLmFicyh4MSAtIHgyKSA9PSAxICYmIE1hdGguYWJzKHkxIC0geTIpID09IDEpIHtcbiAgICAgICAgLy/ku5XotbDlr7nop5JcbiAgICAgICAgaWYgKHgyID49IDMgJiYgeDIgPD0gNSAmJiAoeTIgPD0gMiB8fCB5MiA+PSA3KSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwi5Ye65a6rXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImpcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaih0YXJnZXRQb3MpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5ib2FyZC5jdXJyZW50O1xuICAgICAgdmFyIHgxID0gY3VycmVudC5wb3MueDtcbiAgICAgIHZhciB5MSA9IGN1cnJlbnQucG9zLnk7XG4gICAgICB2YXIgeDIgPSB0YXJnZXRQb3MueDtcbiAgICAgIHZhciB5MiA9IHRhcmdldFBvcy55O1xuICAgICAgLyog5a6r5YaF6LWw5qOLICovXG4gICAgICBpZiAoTWF0aC5hYnMoeDEgLSB4MikgKyBNYXRoLmFicyh5MSAtIHkyKSA9PSAxKSB7XG4gICAgICAgIGlmICh4MiA+PSAzICYmIHgyIDw9IDUgJiYgKHkyIDw9IDIgfHwgeTIgPj0gNykpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIuWHuuWuq1wiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLyog55u05p2A5a+55pa55bCGICovXG4gICAgICBpZiAoeDEgPT0geDIgJiYgdGhpcy5ib2FyZC5hcnJbeTJdW3gyXS5waWVjZS50ZXh0ID09PSBcImpcIikge1xuICAgICAgICBmb3IgKHZhciBpID0gdGhpcy5taW4oeTEsIHkyKSArIDE7IGkgPCB0aGlzLm1heCh5MSwgeTIpOyBpKyspIHtcbiAgICAgICAgICBpZiAodGhpcy5ib2FyZC5hcnJbaV1beDFdLnBpZWNlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIuWwhuS4jeiDvemjnlwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInpcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24geih0YXJnZXRQb3MpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5ib2FyZC5jdXJyZW50O1xuICAgICAgdmFyIHgxID0gY3VycmVudC5wb3MueDtcbiAgICAgIHZhciB5MSA9IGN1cnJlbnQucG9zLnk7XG4gICAgICB2YXIgeDIgPSB0YXJnZXRQb3MueDtcbiAgICAgIHZhciB5MiA9IHRhcmdldFBvcy55O1xuICAgICAgaWYgKGN1cnJlbnQuZ3JvdXAgPT09IHRoaXMuYm9hcmQuZ3JvdXApIHtcblxuICAgICAgICBpZiAoeTEgPj0gNSkge1xuICAgICAgICAgIC8v5pyq6L+H5rKzICAgICAgICAgICAgICAgIFxuICAgICAgICAgIGlmICh5MiA9PSB5MSAtIDEgJiYgeDIgPT0geDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoeTIgPT0geTEgLSAxICYmIHgyID09IHgxIHx8IHkyID09IHkxICYmIE1hdGguYWJzKHgyIC0geDEpID09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGN1cnJlbnQuZ3JvdXAgIT09IHRoaXMuYm9hcmQuZ3JvdXApIHtcblxuICAgICAgICBpZiAoeTEgPCA1KSB7XG4gICAgICAgICAgLy/mnKrov4fmsrMgICAgICAgICAgICAgICAgXG4gICAgICAgICAgaWYgKHkyID09IHkxICsgMSAmJiB4MiA9PSB4MSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh5MiA9PSB5MSArIDEgJiYgeDIgPT0geDEgfHwgeTIgPT0geTEgJiYgTWF0aC5hYnMoeDIgLSB4MSkgPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInBcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcCh0YXJnZXRQb3MpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5ib2FyZC5jdXJyZW50O1xuICAgICAgdmFyIHgxID0gY3VycmVudC5wb3MueDtcbiAgICAgIHZhciB5MSA9IGN1cnJlbnQucG9zLnk7XG4gICAgICB2YXIgeDIgPSB0YXJnZXRQb3MueDtcbiAgICAgIHZhciB5MiA9IHRhcmdldFBvcy55O1xuXG4gICAgICBpZiAoeDEgPT0geDIpIHtcbiAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IHRoaXMubWluKHkxLCB5MikgKyAxOyBpIDwgdGhpcy5tYXgoeTEsIHkyKTsgaSsrKSB7XG4gICAgICAgICAgaWYgKHRoaXMuYm9hcmQuYXJyW2ldW3gxXS5waWVjZSkge1xuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvdW50ID09IDEpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHkxID09IHkyKSB7XG4gICAgICAgIHZhciBfY291bnQgPSAwO1xuICAgICAgICBmb3IgKHZhciBfaTIgPSB0aGlzLm1pbih4MSwgeDIpICsgMTsgX2kyIDwgdGhpcy5tYXgoeDEsIHgyKTsgX2kyKyspIHtcbiAgICAgICAgICBpZiAodGhpcy5ib2FyZC5hcnJbeTFdW19pMl0ucGllY2UpIHtcbiAgICAgICAgICAgIF9jb3VudCsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoX2NvdW50ID09IDEpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJjYW5QdXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2FuUHV0KHRhcmdldFBvcykge1xuICAgICAgdmFyIHR5cGUgPSB0aGlzLmJvYXJkLmN1cnJlbnQudGV4dDtcbiAgICAgIGlmICh0eXBlID09IFwicFwiKSB7XG4gICAgICAgIHR5cGUgPSBcImNcIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzW3R5cGVdKHRhcmdldFBvcyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImNhbkVhdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjYW5FYXQodGFyZ2V0UG9pbnQpIHtcbiAgICAgIHZhciB0eXBlID0gdGhpcy5ib2FyZC5jdXJyZW50LnRleHQ7XG4gICAgICB2YXIgdGFyZ2V0UG9zID0gdGFyZ2V0UG9pbnQucG9zO1xuICAgICAgcmV0dXJuIHRoaXNbdHlwZV0odGFyZ2V0UG9zKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicHV0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHB1dCh0YXJnZXRQb3MpIHtcbiAgICAgIHZhciB4MCA9IHRoaXMuYm9hcmQuY3VycmVudC5wb3MueDtcbiAgICAgIHZhciB5MCA9IHRoaXMuYm9hcmQuY3VycmVudC5wb3MueTtcbiAgICAgIHRoaXMuYm9hcmQuc3RlcHNbdGhpcy5ib2FyZC5zdGVwXSA9IHtcbiAgICAgICAgY3VycmVudFBvczogeyB4OiB4MCwgeTogeTAgfSxcbiAgICAgICAgY3VycmVudFBpZWNlOiB0aGlzLmJvYXJkLmN1cnJlbnQsXG4gICAgICAgIHRhcmdldFBvczogdGFyZ2V0UG9zLFxuICAgICAgICB0YXJnZXRQaWVjZTogMFxuICAgICAgfTtcbiAgICAgIHZhciBqc29uID0ge1xuICAgICAgICB0YXJnZXRQb3M6IHRhcmdldFBvcyxcbiAgICAgICAgY3VycmVudFBvczogeyB4OiB4MCwgeTogeTAgfSxcbiAgICAgICAgc3RlcDogdGhpcy5ib2FyZC5zdGVwICsgMVxuICAgICAgICAvLyBsZXQganNvbiA9IHtcbiAgICAgICAgLy8gICB0YXJnZXRQb3M6IHt4OiB0YXJnZXRQb3MueCwgeTo5IC0gdGFyZ2V0UG9zLnl9LFxuICAgICAgICAvLyAgIGN1cnJlbnRQb3M6IHsgeDogeDAsIHk6IDktIHkwIH1cbiAgICAgICAgLy8gfVxuXG4gICAgICB9O193cy53cy5zZW5kKEpTT04uc3RyaW5naWZ5KGpzb24pKTtcblxuICAgICAgdGhpcy5ib2FyZC5hcnJbdGFyZ2V0UG9zLnldW3RhcmdldFBvcy54XS5waWVjZSA9IHRoaXMuYm9hcmQuY3VycmVudDsgLy9hcnLkuK3nm67moIfngrnkvY3lr7nosaHnmoTmo4vlrZDotYvlgLzmiJAg5b2T5YmN5qOL5a2QIFxuICAgICAgdGhpcy5ib2FyZC5hcnJbdGFyZ2V0UG9zLnldW3RhcmdldFBvcy54XS5waWVjZS5wb3MgPSB0YXJnZXRQb3M7XG5cbiAgICAgIHRoaXMuYm9hcmQuYXJyW3kwXVt4MF0ucGllY2UgPSAwO1xuXG4gICAgICB0aGlzLmJvYXJkLmN1cnJlbnQgPSBudWxsO1xuICAgICAgdGhpcy5ib2FyZC5zdGVwKys7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImVhdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBlYXQodGFyZ2V0UG9pbnQpIHtcblxuICAgICAgLy9jb25zb2xlLmxvZyh0YXJnZXRQb2ludClcbiAgICAgIGlmICh0YXJnZXRQb2ludC5waWVjZS50ZXh0ID09IFwialwiKSB7XG4gICAgICAgIHZhciB3aW5uZXIgPSB0YXJnZXRQb2ludC5waWVjZS5ncm91cCA9PSBcInJcIiA/IFwi6buRXCIgOiBcIue6olwiO1xuICAgICAgICBhbGVydCh3aW5uZXIgKyBcIuaWuei1ouS6hu+8gVwiKTtcbiAgICAgICAgdGhpcy5ib2FyZC5pc292ZXIgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgeDAgPSB0aGlzLmJvYXJkLmN1cnJlbnQucG9zLng7XG4gICAgICB2YXIgeTAgPSB0aGlzLmJvYXJkLmN1cnJlbnQucG9zLnk7XG5cbiAgICAgIHRoaXMuYm9hcmQuc3RlcHNbdGhpcy5ib2FyZC5zdGVwXSA9IHtcbiAgICAgICAgY3VycmVudFBvczogeyB4OiB4MCwgeTogeTAgfSxcbiAgICAgICAgY3VycmVudFBpZWNlOiB0aGlzLmJvYXJkLmN1cnJlbnQsXG4gICAgICAgIHRhcmdldFBvczogdGFyZ2V0UG9pbnQucG9zLFxuICAgICAgICB0YXJnZXRQaWVjZTogdGFyZ2V0UG9pbnQucGllY2VcbiAgICAgIH07XG4gICAgICB2YXIganNvbiA9IHtcbiAgICAgICAgdGFyZ2V0UG9zOiB0YXJnZXRQb2ludC5wb3MsXG4gICAgICAgIGN1cnJlbnRQb3M6IHsgeDogeDAsIHk6IHkwIH0sXG4gICAgICAgIHN0ZXA6IHRoaXMuYm9hcmQuc3RlcCArIDFcbiAgICAgIH07XG5cbiAgICAgIF93cy53cy5zZW5kKEpTT04uc3RyaW5naWZ5KGpzb24pKTtcblxuICAgICAgdGhpcy5ib2FyZC5hcnJbdGFyZ2V0UG9pbnQucG9zLnldW3RhcmdldFBvaW50LnBvcy54XS5waWVjZSA9IHRoaXMuYm9hcmQuY3VycmVudDsgLy9hcnLkuK3nm67moIfngrnkvY3lr7nosaHnmoTmo4vlrZDotYvlgLzmiJAgXG4gICAgICB0aGlzLmJvYXJkLmFyclt0YXJnZXRQb2ludC5wb3MueV1bdGFyZ2V0UG9pbnQucG9zLnhdLnBpZWNlLnBvcyA9IHRhcmdldFBvaW50LnBvcztcblxuICAgICAgdGhpcy5ib2FyZC5hcnJbeTBdW3gwXS5waWVjZSA9IDA7XG5cbiAgICAgIHRoaXMuYm9hcmQuY3VycmVudCA9IG51bGw7XG4gICAgICB0aGlzLmJvYXJkLnN0ZXArKztcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gUGllY2U7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFBpZWNlOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9Cb2FyZCA9IHJlcXVpcmUoJy4vQm9hcmQuanMnKTtcblxudmFyIF9Cb2FyZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Cb2FyZCk7XG5cbnZhciBfd3MgPSByZXF1aXJlKCcuL3dzLmpzJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBib2FyZCA9IHZvaWQgMDtcbnZhciB1bmRvQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bicpO1xudW5kb0J0bi5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgIC8vYm9hcmQudW5kbygpXG4gICAgX3dzLndzLnNlbmQoXCJ1bmRvXCIpO1xufTtcbi8vdmFyIHdzID0gbmV3IFdlYlNvY2tldChcIndzOi8vbG9jYWxob3N0OjgwMDFcIilcbl93cy53cy5vbm9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coXCLov57mjqXmiJDlip9cIik7XG59O1xuX3dzLndzLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgLy9jb25zb2xlLmxvZyhlLmRhdGEpXG4gICAgaWYgKGUuZGF0YSA9PSBcInVuZG9cIikge1xuICAgICAgICBib2FyZC51bmRvKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGpzb24gPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGpzb24pO1xuICAgICAgICBpZiAoanNvbi51c2VyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIua4uOWuolwiICsganNvbi51c2VyKTtcbiAgICAgICAgICAgIGJvYXJkID0gbmV3IF9Cb2FyZDIuZGVmYXVsdCh7XG4gICAgICAgICAgICAgICAgYnc6IDc1LFxuICAgICAgICAgICAgICAgIGJtOiA1MCxcbiAgICAgICAgICAgICAgICBncm91cDoganNvbi51c2VyICUgMiA9PSAwID8gJ2InIDogJ3InXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJvYXJkLmluaXQoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGJvYXJkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvYXJkLndlYnNvY2tldEV2ZW50KGpzb24pO1xuICAgICAgICB9XG4gICAgfVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbnZhciB3cyA9IGV4cG9ydHMud3MgPSBuZXcgV2ViU29ja2V0KFwid3M6Ly9sb2NhbGhvc3Q6ODAwMVwiKTsiXX0=
