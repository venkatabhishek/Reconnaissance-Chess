const express = require('express')
const path = require('path')
const uuidv1 = require('uuid/v1');
var Chess = require('chess.js').Chess;
const app = express()
const port = process.env.PORT || 3000;

var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static('public'))

// game data

let games = {}

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

    res.redirect('/game?q=' + id)
})



app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, "public/game.html"))
})

io.on('connection', function(socket) {
    console.log('a user connected');
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
                    games[id].state = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

                    games[id].players.forEach(function(playerId, index) {
                        io.to(`${playerId}`).emit('start', index);
                    })

                }

            } else {
                socket.emit('redirect')
            }
        } else {
            socket.emit('redirect')
        }

    })

    socket.on('move', function(fen){
        if(games.hasOwnProperty(room)){
            games[room].state = fen;

            socket.to(room).emit('move', fen);
        }
    })

    socket.on('scout', function(square){

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