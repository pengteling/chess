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