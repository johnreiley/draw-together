import Header from './Header';
import Footer from './Footer';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <>
      <div className="row">
        <Header />
      </div>
      <div className="row">
        <div className="col">
          <Link to="/joinRoom" className="btn btn-success btn-large">Join a Room</Link>
          <Link to="/createRoom" className="btn btn-secondary btn-large">Create a Room</Link>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Home
