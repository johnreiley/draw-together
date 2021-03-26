import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, useHistory, Switch } from 'react-router-dom';
import Join from './components/Join';
import Home from './components/Home';
import CreateRoom from './components/CreateRoom';
import Draw from './components/Draw';
import GuardedRoute from './components/GuardedRoute';
import Socket from './services/SocketService';
import { generateToast } from './services/ToastService';

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
    let message = `The room code is <strong>${roomId}</strong>. Share it with your friends.`;
    generateToast(message, 60000);
  }

  const routes = (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/joinRoom" component={Join} />
      <Route path="/createRoom" component={CreateRoom} />
      <GuardedRoute path="/draw" component={Draw} auth={uid} uid={uid} />
    </Switch>
  )

  return (
    <Switch>
      <div className="App">
        <div className="App-content">
          { routes }
        </div>
      </div>
    </Switch>
  );
}

export default App;
