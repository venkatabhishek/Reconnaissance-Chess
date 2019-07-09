$(document).ready(function() {

    var board = null
    var game = null
    var stage = null

    let alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');

    var socket = io();

    // helpers

    function removeHighlight() {
        $('#board .square-55d63').removeClass('highlight')
    }

    function addHighlight(square) {

        var let = alpha.indexOf(square.charAt(0)) - 1
        var num = parseInt(square.charAt(1)) - 1;

        for (var i = let; i < let + 3; i++) {
            for (var j = num; j < num + 3; j++) {
                try {
                    var $square = $('#board .square-' + alpha[i] + j);
                    $square.addClass('highlight')
                } catch (err) {

                }
            }
        }
    }

    // board listeners

    function onMouseoverSquare(square, piece) {


        if (stage == "scout") {

            addHighlight(square)
        }

    }

    function onMouseoutSquare(square, piece) {
        removeHighlight()
    }

    // scout click

    $(document).on("click", ".square-55d63", function(e){

        if(stage == "scout"){

            console.log($(e.target).data('square'))
        }
    })

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
    socket.on('start', function(side) {
        // remove wait status
        $("#wait").css('display', 'none');

        // create board

        $("#board").css('display', 'block')

        game = new Chess();
        stage = "scout"

        board = Chessboard('board', {
            draggable: true,
            pieceTheme: 'img/{piece}.png',
            position: "start",
            orientation: side == 0 ? "white" : "black",
            onDrop: onDrop,
            onMouseoutSquare: onMouseoutSquare,
            onMouseoverSquare: onMouseoverSquare,
        })



    })

    // opponent move
    socket.on('move', function(fen) {
        board.position(fen)
        var success = game.load(fen)
        console.log(success)
    })



})

