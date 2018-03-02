import { ws } from './ws.js'
export default class Piece {
  constructor(props) {
    this.group = props.group
    this.text = props.text
    this.pos = props.pos
    this.board = props.board
  }
  min(v1, v2) {
    return v1 > v2 ? v2 : v1
  }
  max(v1, v2) {
    return v1 < v2 ? v2 : v1
  }
  c(targetPos) {
    let current = this.board.current
    if (current.pos.x == targetPos.x || current.pos.y == targetPos.y) {
      let x1 = current.pos.x
      let y1 = current.pos.y
      let x2 = targetPos.x
      let y2 = targetPos.y

      if (x1 == x2) {
        for (let i = this.min(y1, y2) + 1; i < this.max(y1, y2); i++) {
          if (this.board.arr[i][x1].piece) {
            console.log("中间隔着棋子")
            return false
          }
        }
      }

      if (y1 == y2) {
        for (let i = this.min(x1, x2) + 1; i < this.max(x1, x2); i++) {
          if (this.board.arr[y1][i].piece) {
            console.log("中间隔着棋子")
            return false
          }
        }
      }

      return true
    }
  }
  m(targetPos) {
    let current = this.board.current
    let x1 = current.pos.x
    let y1 = current.pos.y
    let x2 = targetPos.x
    let y2 = targetPos.y
    if (Math.abs(x1 - x2) == 1 && Math.abs(y1 - y2) == 2) {
      let bmx = x1
      let bmy = (y1 + y2) / 2
      if (this.board.arr[bmy][bmx].piece) {
        console.log("蹩马腿")
      }
      else {
        return true
      }
    }
    if (Math.abs(x1 - x2) == 2 && Math.abs(y1 - y2) == 1) {
      let bmx = (x1 + x2) / 2
      let bmy = y1
      if (this.board.arr[bmy][bmx].piece) {
        console.log("蹩马腿")
      }
      else {
        return true
      }
    }
  }
  x(targetPos) {
    let current = this.board.current
    let x1 = current.pos.x
    let y1 = current.pos.y
    let x2 = targetPos.x
    let y2 = targetPos.y
    if (Math.abs(x1 - x2) == 2 && Math.abs(y1 - y2) == 2) {
      if ((current.group === this.board.group && y2 >= 5) || (current.group !== this.board.group && y2 <= 4)) { //没有过河
        //console.log("相可以走")

        let tx = (x1 + x2) / 2
        let ty = (y1 + y2) / 2
        if (this.board.arr[ty][tx].piece) {
          console.log("田心有子")
          return false
        } else {
          return true
        }
      }
    }
  }
  s(targetPos) {
    let current = this.board.current
    let x1 = current.pos.x
    let y1 = current.pos.y
    let x2 = targetPos.x
    let y2 = targetPos.y
    if (Math.abs(x1 - x2) == 1 && Math.abs(y1 - y2) == 1) { //仕走对角
      if (x2 >= 3 && x2 <= 5 && (y2 <= 2 || y2 >= 7)) {
        return true
      }
      else {
        console.log("出宫")
      }
    }
  }
  j(targetPos) {
    let current = this.board.current
    let x1 = current.pos.x
    let y1 = current.pos.y
    let x2 = targetPos.x
    let y2 = targetPos.y
    /* 宫内走棋 */
    if (Math.abs(x1 - x2) + Math.abs(y1 - y2) == 1) {
      if (x2 >= 3 && x2 <= 5 && (y2 <= 2 || y2 >= 7)) {
        return true
      }
      else {
        console.log("出宫")
      }
    }
    /* 直杀对方将 */
    if (x1 == x2 && this.board.arr[y2][x2].piece.text === "j") {
      for (let i = this.min(y1, y2) + 1; i < this.max(y1, y2); i++) {
        if (this.board.arr[i][x1].piece) {
          console.log("将不能飞")
          return false
        }

      }
      return true
    }
  }
  z(targetPos) {
    let current = this.board.current
    let x1 = current.pos.x
    let y1 = current.pos.y
    let x2 = targetPos.x
    let y2 = targetPos.y
    if (current.group === this.board.group) {

      if (y1 >= 5) {
        //未过河                
        if (y2 == y1 - 1 && x2 == x1) {
          return true
        }
      } else {
        if ((y2 == y1 - 1 && x2 == x1) || (y2 == y1 && Math.abs(x2 - x1) == 1)) {
          return true
        }
      }
    }
    if (current.group !== this.board.group) {

      if (y1 < 5) {
        //未过河                
        if (y2 == y1 + 1 && x2 == x1) {
          return true
        }
      } else {
        if ((y2 == y1 + 1 && x2 == x1) || (y2 == y1 && Math.abs(x2 - x1) == 1)) {
          return true
        }
      }
    }
  }
  p(targetPos) {
    let current = this.board.current
    let x1 = current.pos.x
    let y1 = current.pos.y
    let x2 = targetPos.x
    let y2 = targetPos.y

    if (x1 == x2) {
      let count = 0
      for (let i = this.min(y1, y2) + 1; i < this.max(y1, y2); i++) {
        if (this.board.arr[i][x1].piece) {
          count++
        }
      }
      if (count == 1) {
        return true
      }
    }
    if (y1 == y2) {
      let count = 0
      for (let i = this.min(x1, x2) + 1; i < this.max(x1, x2); i++) {
        if (this.board.arr[y1][i].piece) {
          count++
        }
      }
      if (count == 1) {
        return true
      }
    }
  }
  canPut(targetPos) {
    let type = this.board.current.text    
    if(type == "p"){
      type = "c"
    }
    return this[type](targetPos)
  }
  canEat(targetPoint) {
    let type = this.board.current.text
    let targetPos = targetPoint.pos    
    return this[type](targetPos)    
  }
  put(targetPos) {
    let x0 = this.board.current.pos.x
    let y0 = this.board.current.pos.y
    this.board.steps[this.board.step] = {
      currentPos: { x: x0, y: y0 },
      currentPiece: this.board.current,
      targetPos: targetPos,
      targetPiece: 0
    }
    let json = {
      targetPos: targetPos,
      currentPos: { x: x0, y: y0 },
      step: this.board.step +1
    }
    // let json = {
    //   targetPos: {x: targetPos.x, y:9 - targetPos.y},
    //   currentPos: { x: x0, y: 9- y0 }
    // }
    
    ws.send(JSON.stringify(json))


    this.board.arr[targetPos.y][targetPos.x].piece = this.board.current //arr中目标点位对象的棋子赋值成 当前棋子 
    this.board.arr[targetPos.y][targetPos.x].piece.pos = targetPos

    this.board.arr[y0][x0].piece = 0

    this.board.current = null
    this.board.step++

  }
  eat(targetPoint) {

    //console.log(targetPoint)
    if (targetPoint.piece.text == "j") {
      let winner = targetPoint.piece.group == "r" ? "黑" : "红"
      alert(winner + "方赢了！")
      this.board.isover = true
    }

    let x0 = this.board.current.pos.x
    let y0 = this.board.current.pos.y

    this.board.steps[this.board.step] = {
      currentPos: { x: x0, y: y0 },
      currentPiece: this.board.current,
      targetPos: targetPoint.pos,
      targetPiece: targetPoint.piece
    }
    let json = {
      targetPos: targetPoint.pos,
      currentPos: { x: x0, y: y0 },
      step: this.board.step +1
    }
    
    ws.send(JSON.stringify(json))

    this.board.arr[targetPoint.pos.y][targetPoint.pos.x].piece = this.board.current //arr中目标点位对象的棋子赋值成 
    this.board.arr[targetPoint.pos.y][targetPoint.pos.x].piece.pos = targetPoint.pos

    this.board.arr[y0][x0].piece = 0

    this.board.current = null
    this.board.step++


  }
}