import { useRef } from 'react';
import { Link } from 'react-router-dom';
import BackButton from './BackButton';
import Header from './Header';
import Socket from '../services/SocketService';

function Join() {
  const nameInput = useRef();
  const roomCodeInput = useRef();

  let onSubmit = (e) => {
    e.preventDefault();

    // check fields
    let name = nameInput.current.value.toUpperCase();
    let roomCode = roomCodeInput.current.value.toUpperCase();
    Socket.emit('joinRoom', {name: name, roomId: roomCode});
  }

  return (
    <>
      <div className="row">
        <Header />
      </div>
      <div className="row">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="roomCodeInput" className="text-uppercase">Room Code</label>
            <input ref={roomCodeInput} type="text" id="roomCodeInput" className="form-control" maxLength="4" placeholder="enter 4-letter code" required />
          </div>
          <div className="form-group">
            <label htmlFor="nameInput" className="text-uppercase">Name</label>
            <input ref={nameInput} type="text" id="nameInput" className="form-control" maxLength="12" placeholder="enter your name" required />
          </div>
          <button type="submit" id="joinBtn" className="btn btn-success btn-large text-uppercase">Join</button>
        </form>
      </div>
    </>
  )
}

export default Join;