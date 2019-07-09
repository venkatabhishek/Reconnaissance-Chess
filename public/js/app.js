var board1 = null
var board2 = null
var board3 = null
let status = $("#status");
let alpha = ['a','b','c','d','e','f','g','h']

status.html("start")

var game = new Chess()
var socket = io();

function removeHighlight() {
    $('#board1 .square-55d63').removeClass('highlight')
}

function addHighlight(square) {

    var let = alpha.indexOf(square.charAt(0))-1
    var num = parseInt(square.charAt(1))-1;

    for(var i = let; i < let+3; i++){
        for(var j = num; j < num+3; j++){
            try{
                // var $square = $('#board1 .square-' + alpha[i] + j);
                // $square.addClass('highlight')
            }catch(err){

            }
        }
    }
}

function onMouseoverSquare(square, piece) {
    addHighlight(square)
}

function onMouseoutSquare(square, piece) {
    removeHighlight()
}

function onDragStart(source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false

    if ((orientation == "white" && piece.search(/^b/) !== -1) ||
        (orientation == "black" && piece.search(/^w/) !== -1)) {
        return false
    }

    // only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
    }
}

function onDrop(source, target, piece, newPos, oldPos, orientation) {

    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    })

    if (move === null) return 'snapback'



    if (move.hasOwnProperty('captured')) {
        if (orientation == "black") {
            var clear = board1.position()
            delete clear[target]
            board1.position(clear)
        } else {
            var clear = board2.position()
            delete clear[target]
            board2.position(clear)
        }
    } else {
        status.html("regular")
    }



    board3.move(`${source}-${target}`)
    status.html(game.turn())

}

board1 = Chessboard('board1', {
    draggable: true,
    pieceTheme: 'img/{piece}.png',
    position: "start",
    onDrop: onDrop,
    onDragStart: onDragStart,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
})

board2 = Chessboard('board2', {
    draggable: true,
    pieceTheme: 'img/{piece}.png',
    position: "start",
    onDrop: onDrop,
    orientation: "black",
    onDragStart: onDragStart,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
})

board3 = Chessboard('board3', {
    draggable: true,
    pieceTheme: 'img/{piece}.png',
    position: "start",
    onDrop: onDrop,
    onDragStart: onDragStart,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
})

var clear = board3.position()


socket.on('move', function(pos) {
    board3.position(pos)
})
