import './Home.css';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import Socket from '../services/SocketService';

function Home() {

  return (
    <>
      <div className="row m-2">
        <Header />
      </div>
      <div className="row m-2">
        <div className="col home-options">
          <Link to="/joinRoom" className="btn btn-success btn-large">Join a Room</Link>
          <Link to="/createRoom" className="btn btn-secondary btn-large">Create a Room</Link>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Home
