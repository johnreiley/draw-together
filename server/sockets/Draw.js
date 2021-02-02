const { v4: uuidv4 } = require('uuid');
const randomize = require('randomatic');

// the roomId is the dictionary key
const rooms = {};

// this dictionary is for keeping track of 
// which room a socketId is associated with
const socketIdRoomDictionary = {};

let roomDefinition = {
  users: [
    {
      socketId: 'sj2i3kn3jkrj3kjr',
      uid: '283nj2-jhjhj2r-2j3rk3rr',
      name: 'John'
    }
  ],
  canvasState: {}
}

/**
 * This function contains all of the event handlers for the client
 */
function registerEvents(io, socket) {

  /****** CREATE ROOM ******/ 
  socket.on('createRoom', (name) => {
    // create a uid
    const uid = uuidv4();
    // create a roomId
    const roomId = randomize('A', 4);
    while (rooms[roomId]) {
      roomId = randomize('A', 4);
      console.log(roomId);
    }
    // make sure roomId is unique
    rooms[roomId] = {
      users: [{
        socketId: socket.id,
        uid: uid,
        name: name
      }],
    };
    socketIdRoomDictionary[socket.id] = roomId;
    socket.join(roomId);
    socket.emit('roomCreated', {uid, roomId})
    console.log("NEW ROOM CREATED: ", roomId);
  })

  /****** JOIN ROOM ******/ 
  socket.on('joinRoom', ({name, roomId}) => {
    console.log("JOINING NAME: ", name);
    console.log("TO ROOM ID: ", roomId);
    const uid = uuidv4();
    if (rooms[roomId]) {
      rooms[roomId].users.push(
        { 
          socketId: socket.id,
          uid: uid, 
          name: name 
        }
      )
      socketIdRoomDictionary[socket.id] = roomId;
      let canvasState = rooms[roomId].canvasState;
      socket.join(roomId);
      socket.emit('joinedRoom', {uid, canvasState});
      socket.broadcast.to(roomId).emit('userJoined', name);
    } else {
      // send back bad response
    }
  })

  /****** DRAW ******/ 
  socket.on('draw', ({uid, state}) => {
    let roomId = socketIdRoomDictionary[socket.id];
    console.log('ROOM ID: ', roomId);
    console.log('USER DREW: ', rooms[roomId].users.find(u => u.socketId === socket.id));
    console.log('UID: ', uid);
    rooms[roomId].canvasState = state;
    socket.broadcast.to(roomId).emit('draw', state);
  });

  /****** CLEAR ******/ 
  socket.on('clear', () => {
    let roomId = socketIdRoomDictionary[socket.id];
    rooms[roomId].canvasState = {}
    io.to(roomId).emit('clear');
  })

  /****** DISCONNECT ******/ 
  socket.on('disconnect', () => {
    console.log('user disconnected');
    // do some cleanup
    let roomId = socketIdRoomDictionary[socket.id];
    if (roomId && rooms[roomId] && rooms[roomId].users) {
      delete socketIdRoomDictionary[socket.id];
      let name = rooms[roomId].users.find(u => u.socketId === socket.id).name;
      if (name) {
        rooms[roomId].users = rooms[roomId].users.filter(u => u.socketId !== socket.id);
      }
      
      if (rooms[roomId].users > 0) {
        io.to(roomId).emit('userLeft', name);
      } else {
        delete rooms[roomId];
      }
    }
  })
}

module.exports = registerEvents;