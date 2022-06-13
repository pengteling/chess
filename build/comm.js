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
      /* 如果本地棋步数 >= 传来的步数 则不处理 */
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
        var sw = bw * 6 / 75;
        var lw = bw * 16 / 75;
        context.save();

        context.translate(bm + bw * x, bm + bw * y);

        // if (x > 0) {
        //   context.save()
        //   context.beginPath()
        //   context.rotate(0*Math.PI/180)          
        //   context.lineTo(-6, -16)
        //   context.lineTo(-6, -6)
        //   context.lineTo(-16, -6)        
        //   context.stroke()
        //   context.restore()

        //   context.save()
        //   context.beginPath()
        //   context.rotate(-90*Math.PI/180)
        //   context.lineTo(-6, -16)
        //   context.lineTo(-6, -6)
        //   context.lineTo(-16, -6)        
        //   context.stroke()
        //   context.restore()
        // }
        // if (x < 8) {
        //   context.save()
        //   context.beginPath()
        //   context.rotate(90*Math.PI/180)
        //   context.lineTo(-6, -16)
        //   context.lineTo(-6, -6)
        //   context.lineTo(-16, -6)        
        //   context.stroke()
        //   context.restore()

        //   context.save()
        //   context.beginPath()
        //   context.rotate(180*Math.PI/180)
        //   context.lineTo(-6, -16)
        //   context.lineTo(-6, -6)
        //   context.lineTo(-16, -6)        
        //   context.stroke()
        //   context.restore()
        // }


        if (x > 0) {
          context.beginPath();
          context.lineTo(-sw, -lw);
          context.lineTo(-sw, -sw);
          context.lineTo(-lw, -sw);
          context.stroke();

          context.beginPath();
          context.lineTo(-sw, lw);
          context.lineTo(-sw, sw);
          context.lineTo(-lw, sw);
          context.stroke();
        }

        if (x < 8) {

          context.beginPath();
          context.lineTo(sw, -lw);
          context.lineTo(sw, -sw);
          context.lineTo(lw, -sw);
          context.stroke();

          context.beginPath();
          context.lineTo(sw, lw);
          context.lineTo(sw, sw);
          context.lineTo(lw, sw);
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
},{"./Board.js":1,"./ws.js":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ws = exports.ws = new WebSocket("ws://localhost:8001");
},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkE6XFzlhazlvIDor75cXGNoZXNzXFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJBOi/lhazlvIDor74vY2hlc3MvanMvQm9hcmQuanMiLCJBOi/lhazlvIDor74vY2hlc3MvanMvUGllY2UuanMiLCJBOi/lhazlvIDor74vY2hlc3MvanMvZmFrZV85OTk4M2U0MC5qcyIsIkE6L+WFrOW8gOivvi9jaGVzcy9qcy93cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfUGllY2UgPSByZXF1aXJlKCcuL1BpZWNlLmpzJyk7XG5cbnZhciBfUGllY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUGllY2UpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xudmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXG52YXIgQm9hcmQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIEJvYXJkKHByb3BzKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEJvYXJkKTtcblxuICAgIHRoaXMuYncgPSBwcm9wcy5idztcbiAgICB0aGlzLmJtID0gcHJvcHMuYm07XG4gICAgdGhpcy5hcnIgPSBbW1wiY1wiLCBcIm1cIiwgXCJ4XCIsIFwic1wiLCBcImpcIiwgXCJzXCIsIFwieFwiLCBcIm1cIiwgXCJjXCJdLCBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sIFswLCBcInBcIiwgMCwgMCwgMCwgMCwgMCwgXCJwXCIsIDBdLCBbXCJ6XCIsIDAsIFwielwiLCAwLCBcInpcIiwgMCwgXCJ6XCIsIDAsIFwielwiXSwgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLCBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sIFtcInpcIiwgMCwgXCJ6XCIsIDAsIFwielwiLCAwLCBcInpcIiwgMCwgXCJ6XCJdLCBbMCwgXCJwXCIsIDAsIDAsIDAsIDAsIDAsIFwicFwiLCAwXSwgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLCBbXCJjXCIsIFwibVwiLCBcInhcIiwgXCJzXCIsIFwialwiLCBcInNcIiwgXCJ4XCIsIFwibVwiLCBcImNcIl1dO1xuICAgIC8vdGhpcy5hcnIgPSB0aGlzLmNoZXNzQXJyXG4gICAgdGhpcy5ncm91cCA9IHByb3BzLmdyb3VwO1xuICAgIHRoaXMuc3RlcCA9IDA7XG4gICAgdGhpcy5zdGVwcyA9IFtdO1xuICAgIHRoaXMuY3VycmVudCA9IG51bGw7XG4gICAgdGhpcy5pbWdBcnIgPSBbXTtcbiAgICB0aGlzLmlzb3ZlciA9IGZhbHNlO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKEJvYXJkLCBbe1xuICAgIGtleTogJ2luaXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdGhpcy5hcnIuZm9yRWFjaChmdW5jdGlvbiAocm93LCBpKSB7XG4gICAgICAgIHJvdy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBqKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhpdGVtKVxuICAgICAgICAgIHZhciBncm91cCA9IHZvaWQgMDtcbiAgICAgICAgICBpZiAoX3RoaXMuZ3JvdXAgPT09IFwiclwiKSB7XG4gICAgICAgICAgICBncm91cCA9IGkgPCA1ID8gXCJiXCIgOiBcInJcIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ3JvdXAgPSBpIDwgNSA/IFwiclwiIDogXCJiXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIF90aGlzLmFycltpXVtqXSA9IHtcbiAgICAgICAgICAgIHBpZWNlOiBpdGVtID09IDAgPyAwIDogbmV3IF9QaWVjZTIuZGVmYXVsdCh7XG4gICAgICAgICAgICAgIGdyb3VwOiBncm91cCxcbiAgICAgICAgICAgICAgdGV4dDogaXRlbSxcbiAgICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgeDogaixcbiAgICAgICAgICAgICAgICB5OiBpXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGJvYXJkOiBfdGhpc1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgeDogaixcbiAgICAgICAgICAgICAgeTogaVxuICAgICAgICAgICAgICAvLyAsXG4gICAgICAgICAgICAgIC8vIHBvaW50OiB7XG4gICAgICAgICAgICAgIC8vICAgeDogdGhpcy5ibSArIHRoaXMuYncgKiBqLFxuICAgICAgICAgICAgICAvLyAgIHk6IHRoaXMuYm0gKyB0aGlzLmJ3ICogaSxcbiAgICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICB9IH07XG4gICAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgIC8v5Zu+54mH57yT5a2YIOS4jeiuqeWbvueJh+mXqueDgVxuICAgICAgICAgICAgX3RoaXMuaW1nQXJyW2dyb3VwICsgXCJfXCIgKyBpdGVtXSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgX3RoaXMuaW1nQXJyW2dyb3VwICsgXCJfXCIgKyBpdGVtXS5zcmMgPSAnaW1hZ2VzLycgKyBncm91cCArICdfJyArIGl0ZW0gKyAnLnBuZyc7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIF90aGlzLnB1dFBpZWNlcygpO1xuICAgICAgICBfdGhpcy5pbml0RXZlbnQoKTtcbiAgICAgIH0sIDUwMCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnd2Vic29ja2V0RXZlbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB3ZWJzb2NrZXRFdmVudChqc29uKSB7XG4gICAgICAvKiDlpoLmnpzmnKzlnLDmo4vmraXmlbAgPj0g5Lyg5p2l55qE5q2l5pWwIOWImeS4jeWkhOeQhiAqL1xuICAgICAgaWYgKHRoaXMuc3RlcCA+PSBqc29uLnN0ZXApIHJldHVybjtcbiAgICAgIHZhciBjdXJyZW50UG9zID0ganNvbi5jdXJyZW50UG9zO1xuICAgICAgdmFyIHRhcmdldFBvcyA9IGpzb24udGFyZ2V0UG9zO1xuXG4gICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLmFycls5IC0gY3VycmVudFBvcy55XVs4IC0gY3VycmVudFBvcy54XS5waWVjZTtcblxuICAgICAgdmFyIG1vdXNlUG9pbnQgPSB0aGlzLmFycls5IC0gdGFyZ2V0UG9zLnldWzggLSB0YXJnZXRQb3MueF07XG4gICAgICB2YXIgbW91c2VQb3MgPSBtb3VzZVBvaW50LnBvcztcblxuICAgICAgaWYgKCF0aGlzLmN1cnJlbnQpIHtcbiAgICAgICAgLy/ooajnpLrlvZPliY3ml6DpgInkuK3mo4vlrZBcbiAgICAgICAgaWYgKG1vdXNlUG9pbnQucGllY2UpIHtcbiAgICAgICAgICAvL+ihqOekuum8oOagh+mAieaLqeS6huafkOmil+aji1xuICAgICAgICAgIC8vIOmAieS4rei/memil+aji1xuICAgICAgICAgIGlmICh0aGlzLnN0ZXAgJSAyID09IDApIHtcbiAgICAgICAgICAgIGlmIChtb3VzZVBvaW50LnBpZWNlLmdyb3VwID09IFwiclwiKSB7XG4gICAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IG1vdXNlUG9pbnQucGllY2U7XG4gICAgICAgICAgICAgIHRoaXMucHV0UGllY2VzKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIui9ruWIsOe6ouaWuei1sOaji1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG1vdXNlUG9pbnQucGllY2UuZ3JvdXAgPT0gXCJiXCIpIHtcbiAgICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gbW91c2VQb2ludC5waWVjZTtcbiAgICAgICAgICAgICAgdGhpcy5wdXRQaWVjZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8v5b2T5YmN5pyJ5qOL5a2Q6YCJ5Lit55qE5oOF5Ya1XG5cbiAgICAgICAgLy/liIfmjaLmnKzmlrnmo4vlrZBcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtb3VzZVBvaW50KVxuXG4gICAgICAgIGlmIChtb3VzZVBvaW50LnBpZWNlKSB7XG4gICAgICAgICAgaWYgKG1vdXNlUG9pbnQucGllY2UuZ3JvdXAgPT0gdGhpcy5jdXJyZW50Lmdyb3VwKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBtb3VzZVBvaW50LnBpZWNlO1xuICAgICAgICAgICAgdGhpcy5wdXRQaWVjZXMoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy/lkIPlrZBcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnQuY2FuRWF0KG1vdXNlUG9pbnQpKSB7XG4gICAgICAgICAgICAgIHRoaXMuY3VycmVudC5lYXQobW91c2VQb2ludCk7XG4gICAgICAgICAgICAgIHRoaXMucHV0UGllY2VzKCk7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5ZCD5a2QXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5jdXJyZW50LmNhblB1dChtb3VzZVBvcykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi6LWw5qOLXCIpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50LnB1dChtb3VzZVBvcyk7XG4gICAgICAgICAgICB0aGlzLnB1dFBpZWNlcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2luaXRFdmVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluaXRFdmVudCgpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICB2YXIgZGlzID0gZnVuY3Rpb24gZGlzKHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoKHgxIC0geDIpICogKHgxIC0geDIpICsgKHkxIC0geTIpICogKHkxIC0geTIpKTtcbiAgICAgIH07XG4gICAgICBjYW52YXMub25tb3VzZWRvd24gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoX3RoaXMyLmlzb3ZlcikgcmV0dXJuOyAvL+e7k+adn+S4jeiuqei1sOajiyAgICAgIFxuXG4gICAgICAgIHZhciBtb3VzZSA9IHtcbiAgICAgICAgICB4OiBlLmNsaWVudFggLSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCxcbiAgICAgICAgICB5OiBlLmNsaWVudFkgLSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wXG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhtb3VzZSlcblxuICAgICAgICB9O3ZhciBtb3VzZVBvcyA9IHZvaWQgMDtcbiAgICAgICAgX3RoaXMyLmFyci5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGkpIHtcbiAgICAgICAgICByb3cuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaikge1xuICAgICAgICAgICAgdmFyIHBvaW50ID0gX3RoaXMyLnBvc1RvUG9pbnQoaXRlbS5wb3MpO1xuICAgICAgICAgICAgaWYgKGRpcyhwb2ludC54LCBwb2ludC55LCBtb3VzZS54LCBtb3VzZS55KSA8IDAuNDI1ICogX3RoaXMyLmJ3KSB7XG4gICAgICAgICAgICAgIG1vdXNlUG9zID0ge1xuICAgICAgICAgICAgICAgIC8vIHg6IGl0ZW0ucG9zLngsXG4gICAgICAgICAgICAgICAgLy8geTogaXRlbS5wb3MueVxuICAgICAgICAgICAgICAgIHg6IGosXG4gICAgICAgICAgICAgICAgeTogaVxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cobW91c2VQb3MpXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghbW91c2VQb3MpIHtcbiAgICAgICAgICAvL+mdnuedgOaji+eCuVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBtb3VzZVBvaW50ID0gX3RoaXMyLmFyclttb3VzZVBvcy55XVttb3VzZVBvcy54XTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtb3VzZVBvaW50KVxuXG4gICAgICAgIGlmICghX3RoaXMyLmN1cnJlbnQpIHtcbiAgICAgICAgICAvL+ihqOekuuW9k+WJjeaXoOmAieS4reaji+WtkFxuICAgICAgICAgIGlmIChtb3VzZVBvaW50LnBpZWNlKSB7XG4gICAgICAgICAgICAvL+ihqOekuum8oOagh+mAieaLqeS6huafkOmil+aji1xuICAgICAgICAgICAgLy8g6YCJ5Lit6L+Z6aKX5qOLXG4gICAgICAgICAgICBpZiAobW91c2VQb2ludC5waWVjZS5ncm91cCAhPT0gX3RoaXMyLmdyb3VwKSByZXR1cm47IC8v5aaC5p6c5LiN5piv6YCJ5Lit5pys5pa55qOL5a2Q5LiN6IO96LWw5qOLXG4gICAgICAgICAgICBpZiAoX3RoaXMyLnN0ZXAgJSAyID09IDApIHtcbiAgICAgICAgICAgICAgaWYgKG1vdXNlUG9pbnQucGllY2UuZ3JvdXAgPT0gXCJyXCIpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuY3VycmVudCA9IG1vdXNlUG9pbnQucGllY2U7XG4gICAgICAgICAgICAgICAgX3RoaXMyLnB1dFBpZWNlcygpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi6L2u5Yiw57qi5pa56LWw5qOLXCIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAobW91c2VQb2ludC5waWVjZS5ncm91cCA9PSBcImJcIikge1xuICAgICAgICAgICAgICAgIF90aGlzMi5jdXJyZW50ID0gbW91c2VQb2ludC5waWVjZTtcbiAgICAgICAgICAgICAgICBfdGhpczIucHV0UGllY2VzKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy/lvZPliY3mnInmo4vlrZDpgInkuK3nmoTmg4XlhrVcblxuICAgICAgICAgIC8v5YiH5o2i5pys5pa55qOL5a2QXG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhtb3VzZVBvaW50KVxuXG4gICAgICAgICAgaWYgKG1vdXNlUG9pbnQucGllY2UpIHtcbiAgICAgICAgICAgIGlmIChtb3VzZVBvaW50LnBpZWNlLmdyb3VwID09IF90aGlzMi5jdXJyZW50Lmdyb3VwKSB7XG4gICAgICAgICAgICAgIF90aGlzMi5jdXJyZW50ID0gbW91c2VQb2ludC5waWVjZTtcbiAgICAgICAgICAgICAgX3RoaXMyLnB1dFBpZWNlcygpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvL+WQg+WtkFxuICAgICAgICAgICAgICBpZiAoX3RoaXMyLmN1cnJlbnQuY2FuRWF0KG1vdXNlUG9pbnQpKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLmN1cnJlbnQuZWF0KG1vdXNlUG9pbnQpO1xuICAgICAgICAgICAgICAgIF90aGlzMi5wdXRQaWVjZXMoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLlkIPlrZBcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChfdGhpczIuY3VycmVudC5jYW5QdXQobW91c2VQb3MpKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi6LWw5qOLXCIpO1xuICAgICAgICAgICAgICBfdGhpczIuY3VycmVudC5wdXQobW91c2VQb3MpO1xuICAgICAgICAgICAgICBfdGhpczIucHV0UGllY2VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2RyYXdCb2FyZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRyYXdCb2FyZCgpIHtcbiAgICAgIC8vIHZhciBidyA9IDc1OyAvL+aji+ebmOagvOWtkOWkp+Wwj1xuICAgICAgLy8gdmFyIGJtID0gNTA7IC8v6L656LedIFxuICAgICAgdmFyIGJ3ID0gdGhpcy5idztcbiAgICAgIHZhciBibSA9IHRoaXMuYm07XG5cbiAgICAgIGNhbnZhcy53aWR0aCA9IGJ3ICogOCArIGJtICogMjtcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSBidyAqIDkgKyBibSAqIDI7XG5cbiAgICAgIGNvbnRleHQubGluZVdpZHRoID0gMzA7XG4gICAgICBjb250ZXh0LnN0cm9rZVJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAgICAgY29udGV4dC5saW5lV2lkdGggPSAyO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDg7IGorKykge1xuICAgICAgICAgIGNvbnRleHQuc3Ryb2tlUmVjdChibSArIGogKiBidywgYm0gKyBpICogYncsIGJ3LCBidyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCA4OyBqKyspIHtcbiAgICAgICAgICBjb250ZXh0LnN0cm9rZVJlY3QoYm0gKyBqICogYncsIGJtICsgKGkgKyA1KSAqIGJ3LCBidywgYncpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnRleHQuc3Ryb2tlUmVjdChibSwgYm0gKyBidyAqIDQsIGJ3ICogOCwgYncpO1xuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBcIiNlYjAwMDBcIjtcbiAgICAgIGNvbnRleHQuZm9udCA9ICdib2xkZXIgJyArIGJ3ICogMiAvIDMgKyAncHggXFwnTWljcm9zb2Z0IFlhaGVpXFwnJztcbiAgICAgIGNvbnRleHQudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgIGNvbnRleHQuZmlsbFRleHQoXCLmpZrmsrNcIiwgY2FudmFzLndpZHRoICogMC4yLCBibSArIGJ3ICogNC41KTtcbiAgICAgIHZhciBmb250VyA9IGNvbnRleHQubWVhc3VyZVRleHQoXCLmsYnnlYxcIikud2lkdGg7XG4gICAgICBjb250ZXh0LmZpbGxUZXh0KFwi5rGJ55WMXCIsIGNhbnZhcy53aWR0aCAqIDAuOCAtIGZvbnRXLCBibSArIGJ3ICogNC41KTtcblxuICAgICAgLy/mlpznur9cbiAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICBjb250ZXh0Lm1vdmVUbyhibSArIDMgKiBidywgYm0pO1xuICAgICAgY29udGV4dC5saW5lVG8oYm0gKyA1ICogYncsIGJtICsgYncgKiAyKTtcbiAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG5cbiAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICBjb250ZXh0Lm1vdmVUbyhibSArIDUgKiBidywgYm0pO1xuICAgICAgY29udGV4dC5saW5lVG8oYm0gKyAzICogYncsIGJtICsgYncgKiAyKTtcbiAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG5cbiAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICBjb250ZXh0Lm1vdmVUbyhibSArIDMgKiBidywgYm0gKyBidyAqIDkpO1xuICAgICAgY29udGV4dC5saW5lVG8oYm0gKyA1ICogYncsIGJtICsgYncgKiA3KTtcbiAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG5cbiAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICBjb250ZXh0Lm1vdmVUbyhibSArIDUgKiBidywgYm0gKyBidyAqIDkpO1xuICAgICAgY29udGV4dC5saW5lVG8oYm0gKyAzICogYncsIGJtICsgYncgKiA3KTtcbiAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG5cbiAgICAgIGNvbnRleHQubGluZVdpZHRoID0gMztcbiAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcIiNlYjAwMDBcIjtcbiAgICAgIGNvbnRleHQubGluZUpvaW4gPSBcInJvdW5kXCI7XG4gICAgICBjb250ZXh0LmxpbmVDYXAgPSBcInJvdW5kXCI7XG5cbiAgICAgIGRyYXdQb2ludCgxLCAyKTtcbiAgICAgIGRyYXdQb2ludCg3LCAyKTtcbiAgICAgIGRyYXdQb2ludCgxLCA3KTtcbiAgICAgIGRyYXdQb2ludCg3LCA3KTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgZHJhd1BvaW50KGkgKiAyLCAzKTtcbiAgICAgICAgZHJhd1BvaW50KGkgKiAyLCA2KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZHJhd1BvaW50KHgsIHkpIHtcbiAgICAgICAgdmFyIHN3ID0gYncgKiA2IC8gNzU7XG4gICAgICAgIHZhciBsdyA9IGJ3ICogMTYgLyA3NTtcbiAgICAgICAgY29udGV4dC5zYXZlKCk7XG5cbiAgICAgICAgY29udGV4dC50cmFuc2xhdGUoYm0gKyBidyAqIHgsIGJtICsgYncgKiB5KTtcblxuICAgICAgICAvLyBpZiAoeCA+IDApIHtcbiAgICAgICAgLy8gICBjb250ZXh0LnNhdmUoKVxuICAgICAgICAvLyAgIGNvbnRleHQuYmVnaW5QYXRoKClcbiAgICAgICAgLy8gICBjb250ZXh0LnJvdGF0ZSgwKk1hdGguUEkvMTgwKSAgICAgICAgICBcbiAgICAgICAgLy8gICBjb250ZXh0LmxpbmVUbygtNiwgLTE2KVxuICAgICAgICAvLyAgIGNvbnRleHQubGluZVRvKC02LCAtNilcbiAgICAgICAgLy8gICBjb250ZXh0LmxpbmVUbygtMTYsIC02KSAgICAgICAgXG4gICAgICAgIC8vICAgY29udGV4dC5zdHJva2UoKVxuICAgICAgICAvLyAgIGNvbnRleHQucmVzdG9yZSgpXG5cbiAgICAgICAgLy8gICBjb250ZXh0LnNhdmUoKVxuICAgICAgICAvLyAgIGNvbnRleHQuYmVnaW5QYXRoKClcbiAgICAgICAgLy8gICBjb250ZXh0LnJvdGF0ZSgtOTAqTWF0aC5QSS8xODApXG4gICAgICAgIC8vICAgY29udGV4dC5saW5lVG8oLTYsIC0xNilcbiAgICAgICAgLy8gICBjb250ZXh0LmxpbmVUbygtNiwgLTYpXG4gICAgICAgIC8vICAgY29udGV4dC5saW5lVG8oLTE2LCAtNikgICAgICAgIFxuICAgICAgICAvLyAgIGNvbnRleHQuc3Ryb2tlKClcbiAgICAgICAgLy8gICBjb250ZXh0LnJlc3RvcmUoKVxuICAgICAgICAvLyB9XG4gICAgICAgIC8vIGlmICh4IDwgOCkge1xuICAgICAgICAvLyAgIGNvbnRleHQuc2F2ZSgpXG4gICAgICAgIC8vICAgY29udGV4dC5iZWdpblBhdGgoKVxuICAgICAgICAvLyAgIGNvbnRleHQucm90YXRlKDkwKk1hdGguUEkvMTgwKVxuICAgICAgICAvLyAgIGNvbnRleHQubGluZVRvKC02LCAtMTYpXG4gICAgICAgIC8vICAgY29udGV4dC5saW5lVG8oLTYsIC02KVxuICAgICAgICAvLyAgIGNvbnRleHQubGluZVRvKC0xNiwgLTYpICAgICAgICBcbiAgICAgICAgLy8gICBjb250ZXh0LnN0cm9rZSgpXG4gICAgICAgIC8vICAgY29udGV4dC5yZXN0b3JlKClcblxuICAgICAgICAvLyAgIGNvbnRleHQuc2F2ZSgpXG4gICAgICAgIC8vICAgY29udGV4dC5iZWdpblBhdGgoKVxuICAgICAgICAvLyAgIGNvbnRleHQucm90YXRlKDE4MCpNYXRoLlBJLzE4MClcbiAgICAgICAgLy8gICBjb250ZXh0LmxpbmVUbygtNiwgLTE2KVxuICAgICAgICAvLyAgIGNvbnRleHQubGluZVRvKC02LCAtNilcbiAgICAgICAgLy8gICBjb250ZXh0LmxpbmVUbygtMTYsIC02KSAgICAgICAgXG4gICAgICAgIC8vICAgY29udGV4dC5zdHJva2UoKVxuICAgICAgICAvLyAgIGNvbnRleHQucmVzdG9yZSgpXG4gICAgICAgIC8vIH1cblxuXG4gICAgICAgIGlmICh4ID4gMCkge1xuICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgY29udGV4dC5saW5lVG8oLXN3LCAtbHcpO1xuICAgICAgICAgIGNvbnRleHQubGluZVRvKC1zdywgLXN3KTtcbiAgICAgICAgICBjb250ZXh0LmxpbmVUbygtbHcsIC1zdyk7XG4gICAgICAgICAgY29udGV4dC5zdHJva2UoKTtcblxuICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgY29udGV4dC5saW5lVG8oLXN3LCBsdyk7XG4gICAgICAgICAgY29udGV4dC5saW5lVG8oLXN3LCBzdyk7XG4gICAgICAgICAgY29udGV4dC5saW5lVG8oLWx3LCBzdyk7XG4gICAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh4IDwgOCkge1xuXG4gICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICBjb250ZXh0LmxpbmVUbyhzdywgLWx3KTtcbiAgICAgICAgICBjb250ZXh0LmxpbmVUbyhzdywgLXN3KTtcbiAgICAgICAgICBjb250ZXh0LmxpbmVUbyhsdywgLXN3KTtcbiAgICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuXG4gICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICBjb250ZXh0LmxpbmVUbyhzdywgbHcpO1xuICAgICAgICAgIGNvbnRleHQubGluZVRvKHN3LCBzdyk7XG4gICAgICAgICAgY29udGV4dC5saW5lVG8obHcsIHN3KTtcbiAgICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5yZXN0b3JlKCk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndW5kbycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVuZG8oKSB7XG4gICAgICAvL+aClOaji1xuICAgICAgaWYgKHRoaXMuc3RlcCA+IDApIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnN0ZXBzW3RoaXMuc3RlcCAtMV0pXG4gICAgICAgIHZhciBjdXJyZW50UGllY2UgPSB0aGlzLnN0ZXBzW3RoaXMuc3RlcCAtIDFdLmN1cnJlbnRQaWVjZTtcbiAgICAgICAgdmFyIGN1cnJlbnRQb3MgPSB0aGlzLnN0ZXBzW3RoaXMuc3RlcCAtIDFdLmN1cnJlbnRQb3M7XG4gICAgICAgIHZhciB0YXJnZXRQb3MgPSB0aGlzLnN0ZXBzW3RoaXMuc3RlcCAtIDFdLnRhcmdldFBvcztcbiAgICAgICAgdmFyIHRhcmdldFBpZWNlID0gdGhpcy5zdGVwc1t0aGlzLnN0ZXAgLSAxXS50YXJnZXRQaWVjZTtcblxuICAgICAgICB0aGlzLmFyclt0YXJnZXRQb3MueV1bdGFyZ2V0UG9zLnhdLnBpZWNlID0gdGFyZ2V0UGllY2U7XG4gICAgICAgIHRoaXMuYXJyW2N1cnJlbnRQb3MueV1bY3VycmVudFBvcy54XS5waWVjZSA9IGN1cnJlbnRQaWVjZTtcbiAgICAgICAgY3VycmVudFBpZWNlLnBvcyA9IGN1cnJlbnRQb3M7IC8v5Y6f5p2l6LWw5Yqo55qE5qOL5a2Q55qEcG9z6KaB6L+Y5Y6fXG5cbiAgICAgICAgdGhpcy5zdGVwLS07XG4gICAgICAgIHRoaXMuc3RlcHNbdGhpcy5zdGVwXSA9IG51bGw7XG4gICAgICAgIHRoaXMucHV0UGllY2VzKCk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncG9zVG9Qb2ludCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHBvc1RvUG9pbnQocG9zKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLmJtICsgdGhpcy5idyAqIHBvcy54LFxuICAgICAgICB5OiB0aGlzLmJtICsgdGhpcy5idyAqIHBvcy55XG4gICAgICB9O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3B1dFBpZWNlcycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHB1dFBpZWNlcygpIHtcbiAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgdGhpcy5kcmF3Qm9hcmQoKTtcbiAgICAgIHRoaXMuYXJyLmZvckVhY2goZnVuY3Rpb24gKHJvdywgaSkge1xuICAgICAgICByb3cuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaikge1xuICAgICAgICAgIGlmIChpdGVtLnBpZWNlKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGl0ZW0pXG4gICAgICAgICAgICB2YXIgcGllY2UgPSBpdGVtLnBpZWNlO1xuICAgICAgICAgICAgX3RoaXMzLnB1dFBpZWNlKHBpZWNlLmdyb3VwLCBwaWVjZS50ZXh0LCBwaWVjZS5wb3MueCwgcGllY2UucG9zLnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLmN1cnJlbnQpIHtcblxuICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5jdXJyZW50KVxuICAgICAgICB2YXIgcG9pbnQgPSB0aGlzLnBvc1RvUG9pbnQodGhpcy5jdXJyZW50LnBvcyk7XG4gICAgICAgIHZhciBpbWdXID0gdGhpcy5idyAqIDE7XG4gICAgICAgIGltZy5zcmMgPSAnaW1hZ2VzLycgKyB0aGlzLmN1cnJlbnQuZ3JvdXAgKyAnX2JveC5wbmcnO1xuICAgICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaW1nLCBwb2ludC54IC0gMSAvIDIgKiBpbWdXLCBwb2ludC55IC0gMSAvIDIgKiBpbWdXLCBpbWdXLCBpbWdXKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdwdXRQaWVjZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHB1dFBpZWNlKGdyb3VwLCB0ZXh0LCB4LCB5KSB7XG4gICAgICB2YXIgYncgPSB0aGlzLmJ3O1xuICAgICAgdmFyIGJtID0gdGhpcy5ibTtcbiAgICAgIHZhciBpbWdXID0gYncgKiAwLjg1O1xuICAgICAgLy8gdmFyIGltZyA9IG5ldyBJbWFnZSgpXG4gICAgICAvLyBpbWcuc3JjID0gYGltYWdlcy8ke2dyb3VwfV8ke3RleHR9LnBuZ2BcbiAgICAgIHZhciBweCA9IGJtICsgeCAqIGJ3IC0gMSAvIDIgKiBpbWdXO1xuICAgICAgdmFyIHB5ID0gYm0gKyB5ICogYncgLSAxIC8gMiAqIGltZ1c7XG5cbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKHRoaXMuaW1nQXJyW2dyb3VwICsgXCJfXCIgKyB0ZXh0XSwgcHgsIHB5LCBpbWdXLCBpbWdXKTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gQm9hcmQ7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEJvYXJkOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3dzID0gcmVxdWlyZShcIi4vd3MuanNcIik7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBQaWVjZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUGllY2UocHJvcHMpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUGllY2UpO1xuXG4gICAgdGhpcy5ncm91cCA9IHByb3BzLmdyb3VwO1xuICAgIHRoaXMudGV4dCA9IHByb3BzLnRleHQ7XG4gICAgdGhpcy5wb3MgPSBwcm9wcy5wb3M7XG4gICAgdGhpcy5ib2FyZCA9IHByb3BzLmJvYXJkO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFBpZWNlLCBbe1xuICAgIGtleTogXCJtaW5cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbWluKHYxLCB2Mikge1xuICAgICAgcmV0dXJuIHYxID4gdjIgPyB2MiA6IHYxO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJtYXhcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbWF4KHYxLCB2Mikge1xuICAgICAgcmV0dXJuIHYxIDwgdjIgPyB2MiA6IHYxO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJjXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGModGFyZ2V0UG9zKSB7XG4gICAgICB2YXIgY3VycmVudCA9IHRoaXMuYm9hcmQuY3VycmVudDtcbiAgICAgIGlmIChjdXJyZW50LnBvcy54ID09IHRhcmdldFBvcy54IHx8IGN1cnJlbnQucG9zLnkgPT0gdGFyZ2V0UG9zLnkpIHtcbiAgICAgICAgdmFyIHgxID0gY3VycmVudC5wb3MueDtcbiAgICAgICAgdmFyIHkxID0gY3VycmVudC5wb3MueTtcbiAgICAgICAgdmFyIHgyID0gdGFyZ2V0UG9zLng7XG4gICAgICAgIHZhciB5MiA9IHRhcmdldFBvcy55O1xuXG4gICAgICAgIGlmICh4MSA9PSB4Mikge1xuICAgICAgICAgIGZvciAodmFyIGkgPSB0aGlzLm1pbih5MSwgeTIpICsgMTsgaSA8IHRoaXMubWF4KHkxLCB5Mik7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuYm9hcmQuYXJyW2ldW3gxXS5waWVjZSkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIuS4remXtOmalOedgOaji+WtkFwiKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh5MSA9PSB5Mikge1xuICAgICAgICAgIGZvciAodmFyIF9pID0gdGhpcy5taW4oeDEsIHgyKSArIDE7IF9pIDwgdGhpcy5tYXgoeDEsIHgyKTsgX2krKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuYm9hcmQuYXJyW3kxXVtfaV0ucGllY2UpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLkuK3pl7TpmpTnnYDmo4vlrZBcIik7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtKHRhcmdldFBvcykge1xuICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmJvYXJkLmN1cnJlbnQ7XG4gICAgICB2YXIgeDEgPSBjdXJyZW50LnBvcy54O1xuICAgICAgdmFyIHkxID0gY3VycmVudC5wb3MueTtcbiAgICAgIHZhciB4MiA9IHRhcmdldFBvcy54O1xuICAgICAgdmFyIHkyID0gdGFyZ2V0UG9zLnk7XG4gICAgICBpZiAoTWF0aC5hYnMoeDEgLSB4MikgPT0gMSAmJiBNYXRoLmFicyh5MSAtIHkyKSA9PSAyKSB7XG4gICAgICAgIHZhciBibXggPSB4MTtcbiAgICAgICAgdmFyIGJteSA9ICh5MSArIHkyKSAvIDI7XG4gICAgICAgIGlmICh0aGlzLmJvYXJkLmFycltibXldW2JteF0ucGllY2UpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIui5qemprOiFv1wiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKE1hdGguYWJzKHgxIC0geDIpID09IDIgJiYgTWF0aC5hYnMoeTEgLSB5MikgPT0gMSkge1xuICAgICAgICB2YXIgX2JteCA9ICh4MSArIHgyKSAvIDI7XG4gICAgICAgIHZhciBfYm15ID0geTE7XG4gICAgICAgIGlmICh0aGlzLmJvYXJkLmFycltfYm15XVtfYm14XS5waWVjZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwi6Lmp6ams6IW/XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInhcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24geCh0YXJnZXRQb3MpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5ib2FyZC5jdXJyZW50O1xuICAgICAgdmFyIHgxID0gY3VycmVudC5wb3MueDtcbiAgICAgIHZhciB5MSA9IGN1cnJlbnQucG9zLnk7XG4gICAgICB2YXIgeDIgPSB0YXJnZXRQb3MueDtcbiAgICAgIHZhciB5MiA9IHRhcmdldFBvcy55O1xuICAgICAgaWYgKE1hdGguYWJzKHgxIC0geDIpID09IDIgJiYgTWF0aC5hYnMoeTEgLSB5MikgPT0gMikge1xuICAgICAgICBpZiAoY3VycmVudC5ncm91cCA9PT0gdGhpcy5ib2FyZC5ncm91cCAmJiB5MiA+PSA1IHx8IGN1cnJlbnQuZ3JvdXAgIT09IHRoaXMuYm9hcmQuZ3JvdXAgJiYgeTIgPD0gNCkge1xuICAgICAgICAgIC8v5rKh5pyJ6L+H5rKzXG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhcIuebuOWPr+S7pei1sFwiKVxuXG4gICAgICAgICAgdmFyIHR4ID0gKHgxICsgeDIpIC8gMjtcbiAgICAgICAgICB2YXIgdHkgPSAoeTEgKyB5MikgLyAyO1xuICAgICAgICAgIGlmICh0aGlzLmJvYXJkLmFyclt0eV1bdHhdLnBpZWNlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIueUsOW/g+acieWtkFwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcyh0YXJnZXRQb3MpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5ib2FyZC5jdXJyZW50O1xuICAgICAgdmFyIHgxID0gY3VycmVudC5wb3MueDtcbiAgICAgIHZhciB5MSA9IGN1cnJlbnQucG9zLnk7XG4gICAgICB2YXIgeDIgPSB0YXJnZXRQb3MueDtcbiAgICAgIHZhciB5MiA9IHRhcmdldFBvcy55O1xuICAgICAgaWYgKE1hdGguYWJzKHgxIC0geDIpID09IDEgJiYgTWF0aC5hYnMoeTEgLSB5MikgPT0gMSkge1xuICAgICAgICAvL+S7lei1sOWvueinklxuICAgICAgICBpZiAoeDIgPj0gMyAmJiB4MiA8PSA1ICYmICh5MiA8PSAyIHx8IHkyID49IDcpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCLlh7rlrqtcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwialwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBqKHRhcmdldFBvcykge1xuICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmJvYXJkLmN1cnJlbnQ7XG4gICAgICB2YXIgeDEgPSBjdXJyZW50LnBvcy54O1xuICAgICAgdmFyIHkxID0gY3VycmVudC5wb3MueTtcbiAgICAgIHZhciB4MiA9IHRhcmdldFBvcy54O1xuICAgICAgdmFyIHkyID0gdGFyZ2V0UG9zLnk7XG4gICAgICAvKiDlrqvlhoXotbDmo4sgKi9cbiAgICAgIGlmIChNYXRoLmFicyh4MSAtIHgyKSArIE1hdGguYWJzKHkxIC0geTIpID09IDEpIHtcbiAgICAgICAgaWYgKHgyID49IDMgJiYgeDIgPD0gNSAmJiAoeTIgPD0gMiB8fCB5MiA+PSA3KSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwi5Ye65a6rXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvKiDnm7TmnYDlr7nmlrnlsIYgKi9cbiAgICAgIGlmICh4MSA9PSB4MiAmJiB0aGlzLmJvYXJkLmFyclt5Ml1beDJdLnBpZWNlLnRleHQgPT09IFwialwiKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSB0aGlzLm1pbih5MSwgeTIpICsgMTsgaSA8IHRoaXMubWF4KHkxLCB5Mik7IGkrKykge1xuICAgICAgICAgIGlmICh0aGlzLmJvYXJkLmFycltpXVt4MV0ucGllY2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5bCG5LiN6IO96aOeXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwielwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB6KHRhcmdldFBvcykge1xuICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmJvYXJkLmN1cnJlbnQ7XG4gICAgICB2YXIgeDEgPSBjdXJyZW50LnBvcy54O1xuICAgICAgdmFyIHkxID0gY3VycmVudC5wb3MueTtcbiAgICAgIHZhciB4MiA9IHRhcmdldFBvcy54O1xuICAgICAgdmFyIHkyID0gdGFyZ2V0UG9zLnk7XG4gICAgICBpZiAoY3VycmVudC5ncm91cCA9PT0gdGhpcy5ib2FyZC5ncm91cCkge1xuXG4gICAgICAgIGlmICh5MSA+PSA1KSB7XG4gICAgICAgICAgLy/mnKrov4fmsrMgICAgICAgICAgICAgICAgXG4gICAgICAgICAgaWYgKHkyID09IHkxIC0gMSAmJiB4MiA9PSB4MSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh5MiA9PSB5MSAtIDEgJiYgeDIgPT0geDEgfHwgeTIgPT0geTEgJiYgTWF0aC5hYnMoeDIgLSB4MSkgPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudC5ncm91cCAhPT0gdGhpcy5ib2FyZC5ncm91cCkge1xuXG4gICAgICAgIGlmICh5MSA8IDUpIHtcbiAgICAgICAgICAvL+acqui/h+aysyAgICAgICAgICAgICAgICBcbiAgICAgICAgICBpZiAoeTIgPT0geTEgKyAxICYmIHgyID09IHgxKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHkyID09IHkxICsgMSAmJiB4MiA9PSB4MSB8fCB5MiA9PSB5MSAmJiBNYXRoLmFicyh4MiAtIHgxKSA9PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwKHRhcmdldFBvcykge1xuICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmJvYXJkLmN1cnJlbnQ7XG4gICAgICB2YXIgeDEgPSBjdXJyZW50LnBvcy54O1xuICAgICAgdmFyIHkxID0gY3VycmVudC5wb3MueTtcbiAgICAgIHZhciB4MiA9IHRhcmdldFBvcy54O1xuICAgICAgdmFyIHkyID0gdGFyZ2V0UG9zLnk7XG5cbiAgICAgIGlmICh4MSA9PSB4Mikge1xuICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gdGhpcy5taW4oeTEsIHkyKSArIDE7IGkgPCB0aGlzLm1heCh5MSwgeTIpOyBpKyspIHtcbiAgICAgICAgICBpZiAodGhpcy5ib2FyZC5hcnJbaV1beDFdLnBpZWNlKSB7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY291bnQgPT0gMSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoeTEgPT0geTIpIHtcbiAgICAgICAgdmFyIF9jb3VudCA9IDA7XG4gICAgICAgIGZvciAodmFyIF9pMiA9IHRoaXMubWluKHgxLCB4MikgKyAxOyBfaTIgPCB0aGlzLm1heCh4MSwgeDIpOyBfaTIrKykge1xuICAgICAgICAgIGlmICh0aGlzLmJvYXJkLmFyclt5MV1bX2kyXS5waWVjZSkge1xuICAgICAgICAgICAgX2NvdW50Kys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChfY291bnQgPT0gMSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImNhblB1dFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjYW5QdXQodGFyZ2V0UG9zKSB7XG4gICAgICB2YXIgdHlwZSA9IHRoaXMuYm9hcmQuY3VycmVudC50ZXh0O1xuICAgICAgaWYgKHR5cGUgPT0gXCJwXCIpIHtcbiAgICAgICAgdHlwZSA9IFwiY1wiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXNbdHlwZV0odGFyZ2V0UG9zKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiY2FuRWF0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNhbkVhdCh0YXJnZXRQb2ludCkge1xuICAgICAgdmFyIHR5cGUgPSB0aGlzLmJvYXJkLmN1cnJlbnQudGV4dDtcbiAgICAgIHZhciB0YXJnZXRQb3MgPSB0YXJnZXRQb2ludC5wb3M7XG4gICAgICByZXR1cm4gdGhpc1t0eXBlXSh0YXJnZXRQb3MpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJwdXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcHV0KHRhcmdldFBvcykge1xuICAgICAgdmFyIHgwID0gdGhpcy5ib2FyZC5jdXJyZW50LnBvcy54O1xuICAgICAgdmFyIHkwID0gdGhpcy5ib2FyZC5jdXJyZW50LnBvcy55O1xuICAgICAgdGhpcy5ib2FyZC5zdGVwc1t0aGlzLmJvYXJkLnN0ZXBdID0ge1xuICAgICAgICBjdXJyZW50UG9zOiB7IHg6IHgwLCB5OiB5MCB9LFxuICAgICAgICBjdXJyZW50UGllY2U6IHRoaXMuYm9hcmQuY3VycmVudCxcbiAgICAgICAgdGFyZ2V0UG9zOiB0YXJnZXRQb3MsXG4gICAgICAgIHRhcmdldFBpZWNlOiAwXG4gICAgICB9O1xuICAgICAgdmFyIGpzb24gPSB7XG4gICAgICAgIHRhcmdldFBvczogdGFyZ2V0UG9zLFxuICAgICAgICBjdXJyZW50UG9zOiB7IHg6IHgwLCB5OiB5MCB9LFxuICAgICAgICBzdGVwOiB0aGlzLmJvYXJkLnN0ZXAgKyAxXG4gICAgICAgIC8vIGxldCBqc29uID0ge1xuICAgICAgICAvLyAgIHRhcmdldFBvczoge3g6IHRhcmdldFBvcy54LCB5OjkgLSB0YXJnZXRQb3MueX0sXG4gICAgICAgIC8vICAgY3VycmVudFBvczogeyB4OiB4MCwgeTogOS0geTAgfVxuICAgICAgICAvLyB9XG5cbiAgICAgIH07X3dzLndzLnNlbmQoSlNPTi5zdHJpbmdpZnkoanNvbikpO1xuXG4gICAgICB0aGlzLmJvYXJkLmFyclt0YXJnZXRQb3MueV1bdGFyZ2V0UG9zLnhdLnBpZWNlID0gdGhpcy5ib2FyZC5jdXJyZW50OyAvL2FycuS4reebruagh+eCueS9jeWvueixoeeahOaji+WtkOi1i+WAvOaIkCDlvZPliY3mo4vlrZAgXG4gICAgICB0aGlzLmJvYXJkLmFyclt0YXJnZXRQb3MueV1bdGFyZ2V0UG9zLnhdLnBpZWNlLnBvcyA9IHRhcmdldFBvcztcblxuICAgICAgdGhpcy5ib2FyZC5hcnJbeTBdW3gwXS5waWVjZSA9IDA7XG5cbiAgICAgIHRoaXMuYm9hcmQuY3VycmVudCA9IG51bGw7XG4gICAgICB0aGlzLmJvYXJkLnN0ZXArKztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZWF0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGVhdCh0YXJnZXRQb2ludCkge1xuXG4gICAgICAvL2NvbnNvbGUubG9nKHRhcmdldFBvaW50KVxuICAgICAgaWYgKHRhcmdldFBvaW50LnBpZWNlLnRleHQgPT0gXCJqXCIpIHtcbiAgICAgICAgdmFyIHdpbm5lciA9IHRhcmdldFBvaW50LnBpZWNlLmdyb3VwID09IFwiclwiID8gXCLpu5FcIiA6IFwi57qiXCI7XG4gICAgICAgIGFsZXJ0KHdpbm5lciArIFwi5pa56LWi5LqG77yBXCIpO1xuICAgICAgICB0aGlzLmJvYXJkLmlzb3ZlciA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHZhciB4MCA9IHRoaXMuYm9hcmQuY3VycmVudC5wb3MueDtcbiAgICAgIHZhciB5MCA9IHRoaXMuYm9hcmQuY3VycmVudC5wb3MueTtcblxuICAgICAgdGhpcy5ib2FyZC5zdGVwc1t0aGlzLmJvYXJkLnN0ZXBdID0ge1xuICAgICAgICBjdXJyZW50UG9zOiB7IHg6IHgwLCB5OiB5MCB9LFxuICAgICAgICBjdXJyZW50UGllY2U6IHRoaXMuYm9hcmQuY3VycmVudCxcbiAgICAgICAgdGFyZ2V0UG9zOiB0YXJnZXRQb2ludC5wb3MsXG4gICAgICAgIHRhcmdldFBpZWNlOiB0YXJnZXRQb2ludC5waWVjZVxuICAgICAgfTtcbiAgICAgIHZhciBqc29uID0ge1xuICAgICAgICB0YXJnZXRQb3M6IHRhcmdldFBvaW50LnBvcyxcbiAgICAgICAgY3VycmVudFBvczogeyB4OiB4MCwgeTogeTAgfSxcbiAgICAgICAgc3RlcDogdGhpcy5ib2FyZC5zdGVwICsgMVxuICAgICAgfTtcblxuICAgICAgX3dzLndzLnNlbmQoSlNPTi5zdHJpbmdpZnkoanNvbikpO1xuXG4gICAgICB0aGlzLmJvYXJkLmFyclt0YXJnZXRQb2ludC5wb3MueV1bdGFyZ2V0UG9pbnQucG9zLnhdLnBpZWNlID0gdGhpcy5ib2FyZC5jdXJyZW50OyAvL2FycuS4reebruagh+eCueS9jeWvueixoeeahOaji+WtkOi1i+WAvOaIkCBcbiAgICAgIHRoaXMuYm9hcmQuYXJyW3RhcmdldFBvaW50LnBvcy55XVt0YXJnZXRQb2ludC5wb3MueF0ucGllY2UucG9zID0gdGFyZ2V0UG9pbnQucG9zO1xuXG4gICAgICB0aGlzLmJvYXJkLmFyclt5MF1beDBdLnBpZWNlID0gMDtcblxuICAgICAgdGhpcy5ib2FyZC5jdXJyZW50ID0gbnVsbDtcbiAgICAgIHRoaXMuYm9hcmQuc3RlcCsrO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBQaWVjZTtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gUGllY2U7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX0JvYXJkID0gcmVxdWlyZSgnLi9Cb2FyZC5qcycpO1xuXG52YXIgX0JvYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0JvYXJkKTtcblxudmFyIF93cyA9IHJlcXVpcmUoJy4vd3MuanMnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGJvYXJkID0gdm9pZCAwO1xudmFyIHVuZG9CdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuJyk7XG51bmRvQnRuLm9uY2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy9ib2FyZC51bmRvKClcbiAgICBfd3Mud3Muc2VuZChcInVuZG9cIik7XG59O1xuLy92YXIgd3MgPSBuZXcgV2ViU29ja2V0KFwid3M6Ly9sb2NhbGhvc3Q6ODAwMVwiKVxuX3dzLndzLm9ub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZyhcIui/nuaOpeaIkOWKn1wiKTtcbn07XG5fd3Mud3Mub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAvL2NvbnNvbGUubG9nKGUuZGF0YSlcbiAgICBpZiAoZS5kYXRhID09IFwidW5kb1wiKSB7XG4gICAgICAgIGJvYXJkLnVuZG8oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIganNvbiA9IEpTT04ucGFyc2UoZS5kYXRhKTtcbiAgICAgICAgY29uc29sZS5sb2coanNvbik7XG4gICAgICAgIGlmIChqc29uLnVzZXIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5ri45a6iXCIgKyBqc29uLnVzZXIpO1xuICAgICAgICAgICAgYm9hcmQgPSBuZXcgX0JvYXJkMi5kZWZhdWx0KHtcbiAgICAgICAgICAgICAgICBidzogMTAwLFxuICAgICAgICAgICAgICAgIGJtOiA1MCxcbiAgICAgICAgICAgICAgICBncm91cDoganNvbi51c2VyICUgMiA9PSAwID8gJ2InIDogJ3InXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJvYXJkLmluaXQoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGJvYXJkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvYXJkLndlYnNvY2tldEV2ZW50KGpzb24pO1xuICAgICAgICB9XG4gICAgfVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbnZhciB3cyA9IGV4cG9ydHMud3MgPSBuZXcgV2ViU29ja2V0KFwid3M6Ly9sb2NhbGhvc3Q6ODAwMVwiKTsiXX0=
