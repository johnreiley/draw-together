import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, useHistory } from 'react-router-dom';
import Join from './components/Join';
import Home from './components/Home';
import CreateRoom from './components/CreateRoom';
import Draw from './components/Draw';
import GuardedRoute from './components/GuardedRoute';
import Socket from './services/SocketService';

function App() {
  const history = useHistory();
  const [uid, setUid] = useState();
  const [canvasState, setCanvasState] = useState();

  useEffect(() => {
    Socket.on('joinedRoom', handleJoinedRoom);
    Socket.on('roomCreated', handleRoomCreated);
  }, []);

  function handleJoinedRoom({uid, canvasState}) {
    console.log('JOINED ROOM');
    setUid(uid);
    setCanvasState(canvasState);
    history.push('/draw');
  }

  function handleRoomCreated({uid, roomId}) {
    console.log('ROOM CREATED');
    console.log('ROOM ID: ', roomId);
    setUid(uid);
    history.push('/draw');
  }

  const routes = (
    <>
      <Route exact path="/" component={Home} />
      <Route path="/joinRoom" component={Join} />
      <Route path="/createRoom" component={CreateRoom} />
      <GuardedRoute path="/draw" component={Draw} auth={uid} uid={uid} />
    </>
  )

  return (
    <div className="App">
      <div className="App-content">
        { routes }
      </div>
    </div>
  );
}

export default App;
