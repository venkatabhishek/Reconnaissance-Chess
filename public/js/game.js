$(document).ready(function() {

    var board = null
    var game = null

    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');

    var socket = io();

    // board listeners

    function onDrop(source, target) {

        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })

        // illegal move
        if (move === null) return 'snapback'

        socket.emit('move', game.fen())

    }

    // join room
    socket.emit('join', q)

    // invalid game or < 2 players
    socket.on('redirect', function() {
        window.location = "/"
    })

    // status update
    socket.on('status', function(msg) {
        $("#status").html(msg)
    })

    // start game
    socket.on('start', function( side ) {
        // remove wait status
        $("#wait").css('display', 'none');

        // create board

        $("#board").css('display', 'block')

        board = Chessboard('board', {
            draggable: true,
            pieceTheme: 'img/{piece}.png',
            position: "start",
            orientation: side == 0 ? "white" : "black",
            onDrop: onDrop
        })

        game = new Chess();

    })

    // opponent move
    socket.on('move', function(fen){
        board.position(fen)
        var success = game.load(fen)
        console.log(success)
    })



})

