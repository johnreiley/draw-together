import { useRef } from 'react';
import Header from './Header';
import Socket from '../services/SocketService';

function CreateRoom() {
  const nameInput = useRef();

  let onSubmit = (e) => { 
    e.preventDefault();
    let name = nameInput.current.value.toUpperCase();
    Socket.emit('createRoom', name);
  }

  return (
    <>
      <div className="row">
        <Header />
      </div>
      <div className="row">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="nameInput" className="text-uppercase">Name</label>
            <input ref={nameInput} type="text" id="nameInput" className="form-control" maxLength="12" placeholder="enter your name" required />
          </div>
          <button type="submit" id="joinBtn" className="btn btn-success btn-large text-uppercase">Create Room</button>
        </form>
      </div>
    </>
  )
}

export default CreateRoom
