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
      name: 'John',
      path: []
    }
  ],
  state: []
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
        name: name,
        path: []
      }],
      state: []
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
          name: name,
          path: []
        }
      )
      socketIdRoomDictionary[socket.id] = roomId;
      let state = rooms[roomId].state;
      socket.join(roomId);
      socket.emit('joinedRoom', {uid, state});
      socket.broadcast.to(roomId).emit('userJoined', name);
    } else {
      // send back bad response
    }
  })

  /****** DRAW ******/ 
  socket.on('draw', ({uid, state}) => {
    state = JSON.parse(state);
    // console.log(state);
    let roomId = socketIdRoomDictionary[socket.id];
    const newPath = filterExistingPaths(state['objects'], rooms[roomId].state['objects']);
    console.log("newPath length: ", newPath.length);
    // console.log('ROOM ID: ', roomId);
    // console.log('USER DREW: ', rooms[roomId].users.find(u => u.socketId === socket.id));
    // console.log('UID: ', uid);
    let user = rooms[roomId].users.find(u => u.socketId === socket.id);
    user.path.push([...newPath][0]);
    // console.log("PATH LENGTH: ", user.path.length);
    let newState = state;
    newState['objects'] = rooms[roomId].users.flatMap(u => u.path);
    rooms[roomId].state = newState;
    // console.log('ROOM STATE LENGTH: ', rooms[roomId].state.length);
    socket.broadcast.to(roomId).emit('draw', JSON.stringify(rooms[roomId].state));
  });

  /****** CLEAR ******/ 
  socket.on('clear', () => {
    const roomId = socketIdRoomDictionary[socket.id];
    const user = rooms[roomId].users.find(u => u.socketId === socket.id);
    user.path = [];
    let newState = rooms[roomId].state;
    newState['objects'] = rooms[roomId].users.flatMap(u => u.path);
    rooms[roomId].state = newState;
    // socket.broadcast.to(roomId).emit('clear', {name: user.name, state: newState});
    io.in(roomId).emit('clear', {name: user.name, state: JSON.stringify(newState)});
  })

  /****** UNDO ******/ 
  socket.on('undo', (prevState) => {
    prevState = JSON.parse(prevState);
    let roomId = socketIdRoomDictionary[socket.id];
    const user = getUserFromSocketId(socket.id);
    if (user !== undefined) {
      user.path = prevState;
      let newState = rooms[roomId].state;
      newState['objects'] = rooms[roomId].users.flatMap(u => u.path);
      rooms[roomId].state = newState;
      io.in(roomId).emit('undo', JSON.stringify(rooms[roomId].state));
    }
  });

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
      
      if (rooms[roomId].users.length > 0) {
        io.to(roomId).emit('userLeft', name);
      } else {
        delete rooms[roomId];
        console.log('DELETED ROOM: ', roomId);
      }
    }
  })
}

module.exports = registerEvents;


function getNameFromSocketId(socketId) {
  let roomId = socketIdRoomDictionary[socketId];
  if (roomId && rooms[roomId] && rooms[roomId].users) {
    return rooms[roomId].users.find(u => u.socketId === socketId).name;
  } else {
    return '';
  }
}
function getUserFromSocketId(socketId) {
  let roomId = socketIdRoomDictionary[socketId];
  if (roomId && rooms[roomId] && rooms[roomId].users) {
    return rooms[roomId].users.find(u => u.socketId === socketId);
  } else {
    return undefined;
  }
}

// function filterExistingPaths(objects, state) {
//   console.log("objects.length: ", objects.length);
//   console.log("state.length: ", state.length);
//   if (state.length === 0) {
//     return objects;
//   }
//   return objects.filter(o => {
//     let match = state.find(s => {
//       let alreadyExists = (s.left === o.left && s.top === s.left && 
//         s.stroke === o.stroke && s.path.length === o.path.length)
//       console.log("alreadyExists: ", alreadyExists, o.left);
//       return alreadyExists;
//     });
//     console.log(match);
//     return match === undefined && o.left >= 0 && o.top >= 0;
//   });
// }



function filterExistingPaths(newState, oldState) {
  if (oldState === undefined) {
    return newState;
  }
  // go through each path
  let newPaths = newState.filter(e1 => {
    // if the path doesn't match with a path in the state, return it (because it's a new one)
    let match = oldState.find(e2 => {
      return (e2 !== undefined && e1 !== undefined && e2.top === e1.top && 
        e2.left === e1.left && e2.stroke === e1.stroke && e2.path.length === e1.path.length);
    });
    return match === undefined;
  });

  return newPaths;
}