var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const fs = require('fs');
const arrayfun = require('./arrayfun.js');
var title;
server.listen(80);

app.get('/style.css', function(req, res) {
        res.sendfile(__dirname + '/public/style.css');
    });
app.get('/none.jpg', function(req, res) {
  res.sendfile(__dirname + '/public/none.jpg');
});
app.get('/live.png', function(req, res) {
  res.sendfile(__dirname + '/public/live.png');
});
app.get('/notlive.png', function(req, res) {
  res.sendfile(__dirname + '/public/notlive.png');
});

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
  socket.emit('news', {
    hello: 'world'
  });

  const WebSocket = require('ws');

  const ws = new WebSocket('ws://localhost:5672');

  //ws.on('open', function open() {
  //  ws.send('something');
  //});

  function updatequeue() {
     arrayfun.array(title, socket);
  }
  setInterval(updatequeue, 10*1000);

  ws.on('message', function incoming(data) {
      var jsonContent = JSON.parse(data);
      if (jsonContent.channel == "playState") {
        if (jsonContent.payload == true) {
          socket.emit('playpause', "&#9658;")
        } else {
          socket.emit('playpause', "&#10074;&#10074;")
        }
        //arrayfun.array(title, socket);
        console.log(title);
        console.log(jsonContent.payload);
      } else if (jsonContent.channel == "track") {
        title = jsonContent.payload.title;
        var artist = jsonContent.payload.artist;
        var album = jsonContent.payload.album;
        var albumArt = jsonContent.payload.albumArt;
        socket.emit('songTitle', title);
        socket.emit('songArtist', artist);
        socket.emit('songAlbum', album);
        socket.emit('albumArt', albumArt);
        console.log(jsonContent.payload);

      } else if (jsonContent.channel == "time") {
        var current = jsonContent.payload.current;
        var total = jsonContent.payload.total;
        //console.log(current);
        var percent = (current / total * 100).toFixed(5);
        socket.emit('percent', percent);
      } else if (jsonContent.channel == "queue") {
        var string = JSON.stringify(jsonContent.payload);
        fs.writeFile('queue.txt', string, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
    // success case, the file was saved
    console.log('Queue saved!');
    //if (string !== []) {
      arrayfun.array(title, socket);
    //} else {
    //  for (var i = 0; i < 5;) {
    //    //1
    //    i++
    //    socket.emit('songTitle' + i, "NONE");
    //    socket.emit('songArtist' + i, "NONE");
    //    socket.emit('songAlbum' + i, "NONE");
    //    socket.emit('albumArt' + i, "NONE");
    //  }
    //  socket.emit('songTitle', "NONE");
    //  socket.emit('songArtist', "NONE");
    //  socket.emit('songAlbum', "NONE");
    //  socket.emit('albumArt', "NONE");
    //}

});


        //console.log(jsonContent.payload)
      }
    //console.log(data);
});
});

function callexe() {

  require("child_process").exec(__dirname + "/APP-win32-x64/app.exe",function(error,stdout,stderr){ if (error) {
      console.log(error);
  }
  console.log("starting exe");
}) // notice this without a callback..
}

setTimeout(callexe, 5000);
