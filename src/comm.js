import Board from './Board.js'
import {ws} from './ws.js'
let board
let undoBtn = document.getElementById('btn');
undoBtn.onclick = () =>{    
    //board.undo()
    ws.send("undo")
}
//var ws = new WebSocket("ws://localhost:8001")
ws.onopen = function(){
    console.log("连接成功")
}
ws.onmessage = function(e){
    //console.log(e.data)
    if(e.data == "undo"){
        board.undo()
    }else{
        let json = JSON.parse(e.data)
        console.log(json)
        if(json.user){
            console.log("游客"+json.user)
            board = new Board({
                bw: 100,
                bm: 50,
                group: json.user % 2 == 0 ? 'b':'r'
            })
            board.init()
            console.log(board)
        }else{        
            board.websocketEvent(json)
        }
    }
}