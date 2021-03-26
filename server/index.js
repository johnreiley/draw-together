const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const registerEvents = require('./sockets/Draw');

if (process.env.NODE_ENV !== 'production') {
  var cors = require('cors');
  app.use(cors());
}

app.use('/static', express.static(path.join(__dirname, '../client/build//static')));
app.get('*', (req, res) => {
  res.sendFile('index.html', {root: path.join(__dirname, '../client/build/')});
});

io.on('connection', (socket) => {
  console.log(`a user connected at socket ${socket.id}`);
  registerEvents(io, socket);
})

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});