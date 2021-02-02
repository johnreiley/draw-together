import React, { useContext } from 'react'
import { useSocket } from './SocketProvider';

const DrawContext = React.createContext();

export function useDraw() {
  return useContext(DrawContext);
}

export default function DrawProvider({ children }) {
  const [canvasState, setCanvasState] = useState();
  const socket = useSocket();

  function createRoom() {

  }

  function joinRoom() {

  }

  function clear() {

  }

  function draw() {

  }

  const methods = {
    createRoom,    
    joinRoom,
    clear,
    draw
  }

  return (
    <DrawContext.Provider value={methods}>
      {children}
    </DrawContext.Provider>
  )
}
