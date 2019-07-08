const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000;

var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public/app.html"))
})

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('move', function(pos){
      socket.broadcast.emit('move', pos)
  })
});


http.listen(port, () => console.log(`Example app listening on port ${port}!`))