const express = require('express')
const path = require('path')
const uuidv1 = require('uuid/v1');
var Chess = require('chess.js').Chess;
const app = express()
const port = process.env.PORT || 3000;

var http = require('http').createServer(app);
var io = require('socket.io')(http);
var gameio = io.of('/game')
var adminio = io.of('/admin')

app.use(express.static('public'))

// game data

let games = {}
let admin = {}

app.get('/admin', (req, res) => {
    res.json(games)
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public/lobby.html"))
})

app.get('/temp', (req, res) => {
    const id = uuidv1();
    games[id] = {
        players: [],
        status: "waiting"
    }

    admin[id] = []

    res.redirect('/game?q=' + id)
})



app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, "public/game.html"))
})

adminio.on('connection', function(socket){

})

gameio.on('connection', function(socket) {
    var room = null;

    socket.on('join', function(id) {
        socket.join(id)
        room = id

        // if game exists
        if (games.hasOwnProperty(id)) {

            // only two players
            if (games[id].players.length < 2) {
                games[id].players.push(socket.id)

                // start game if two players present
                if (games[id].players.length == 2) {

                    games[id].status = "playing"
                    // fen for starting board
                    games[id].state = new Chess()


                    games[id].players.forEach(function(playerId, index) {
                        gameio.to(`${playerId}`).emit('start', index);
                    })

                }

            } else {
                socket.emit('redirect')
            }
        } else {
            socket.emit('redirect')
        }

    })

    socket.on('move', function(move){
        if(games.hasOwnProperty(room)){
            games[room].state.move({
            from: move.source,
            to: move.target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })

        var res = {
            fen: games[room].state.fen(),
        }

        if(move.captured){
            res['reveal'] = move.target;
        }

            socket.to(room).emit('move', res);
        }
    })


    socket.on('disconnect', function() {
        if (games.hasOwnProperty(room)) {
            var index = games[room].players.indexOf(socket.id)

            games[room].players.splice(index, 1)

            // close room if no players left
            if (games[room].players.length == 0) {
                delete games[room]
            }
        }
    })


});


http.listen(port, () => console.log(`Example app listening on port ${port}!`))