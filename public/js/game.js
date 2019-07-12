$(document).ready(function() {

    var board = null // represents player view
    var game = null // represents truth
    var stage = null

    let alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');

    var turnStage = $('#turnStage')
    var update = $("#update")

    var socket = io('/game');

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

    function onDragStart(source, piece, position, orientation) {

        // only pick if it is the play stage
        if (stage != "play") {
            return false
        }
    }

    function onMouseoverSquare(square, piece) {


        if (stage == "scout") {

            addHighlight(square)
        }

    }

    function onMouseoutSquare(square, piece) {
        removeHighlight()
    }

    // scout click

    $(document).on("click", ".square-55d63", function(e) {

        if (stage == "scout") {


            var square = $(e.currentTarget).data('square')

            var position = board.position()

            // reveal 3x3

            var let = alpha.indexOf(square.charAt(0)) - 1
            var num = parseInt(square.charAt(1)) - 1;

            for (var i = let; i < let + 3; i++) {
                for (var j = num; j < num + 3; j++) {
                    try {
                        var tempSquare = alpha[i] + j
                        var truthPiece = game.get(tempSquare)

                        if (truthPiece) {
                            position[tempSquare] = truthPiece.color + (truthPiece.type).toUpperCase()
                        } else {
                            delete position[tempSquare]
                        }

                    } catch (err) {

                    }
                }
            }

            removeHighlight()
            board.position(position)
            stage = "play"
            turnStage.html('Play phase')

        }

    })

    function onDrop(source, target, piece, newPos, oldPos, orientation) {

        if (source == "spare" || target == "offboard") {
            return true
        }

        if ((orientation == "white" && piece.charAt(0) == 'b') ||
            (orientation == "black" && piece.charAt(0) == 'w')) {
            return true;
        }


        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        }, { sloppy: true })

        // illegal move
        if (move === null) {
            return 'snapback'
        } else {
            stage = "wait"
            turnStage.html("Waiting for opponent...")

            socket.emit('move', {
                source,
                target,
                captured: move.captured,
                color: move.color
            })
        }

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

    // game over
    socket.on('winner', function(winner){
        if(winner == board.orientation().charAt(0)){
            $("#winner").html("Congrats! You Won!")
        }else{
            $("#winner").html("Sorry! You Lost!")
        }

    })

    // start game
    socket.on('start', function(side) {
        // remove wait status
        $("#wait").css('display', 'none');

        // create board

        $(".board-wrapper").css('display', 'block')

        game = new Chess();
        if (side == 0) {
            stage = "scout"
            turnStage.html('Scouting phase')
        } else {
            stage = "wait"
            turnStage.html('Waiting for opponent')
        }


        board = Chessboard('board', {
            draggable: true,
            pieceTheme: 'img/chess/{piece}.png',
            position: "start",
            dropOffBoard: 'trash',
            sparePieces: true,
            orientation: side == 0 ? "white" : "black",
            onDrop: onDrop,
            onMouseoutSquare: onMouseoutSquare,
            onMouseoverSquare: onMouseoverSquare,
            onDragStart: onDragStart
        })



    })

    // opponent move
    socket.on('move', function(data) {
        // reveal opponents move
        // board.position(fen)

        // reveal if piece captured
        if (data.reveal) {
            update.html("Your opponent has captured a piece! It was removed")
            var position = board.position()

            delete position[data.reveal]
            board.position(position)

        }

        var success = game.load(data.fen)
        stage = "scout"
        turnStage.html('Scouting phase')
    })



})

