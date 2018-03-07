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