import './Draw.css';
import { useState, useEffect, useRef } from 'react';
import Socket from '../services/SocketService';
import { generateToast } from '../services/ToastService';
const fabric = require('fabric').fabric;

function Draw({uid}) {
  console.log("UID: ", uid);
  const [canvas, setCanvas] = useState(new fabric.Canvas());
  const [isInit, setIsInit] = useState(true);
  const [brushSize, setBrushSize] = useState("5");
  const [brushColor, setBrushColor] = useState('#000000');
  const [history, setHistory] = useState([]);
  const toolbar = useRef();
  const canvasWrapper = useRef();
  const userId = uid;

  useEffect(() => {
    console.log("useEffect()")
    if (isInit) {
      console.log('initialize the canvas...')
      setIsInit(false);
      const newCanvas = new fabric.Canvas('c', {
        isDrawingMode: true,
        backgroundColor: '#ffffff'
      })
      newCanvas.setDimensions(
        {width: canvasWrapper.current.offsetWidth, height: canvasWrapper.current.offsetHeight}
      );
      if (newCanvas.freeDrawingBrush) {
        newCanvas.freeDrawingBrush.color = brushColor;
        newCanvas.freeDrawingBrush.width = parseInt(brushSize, 10) || 1;
      }
      // auto adjust the canvas size
      window.onresize = function() {
        newCanvas.setDimensions(
          {width: canvasWrapper.current.offsetWidth, height: canvasWrapper.current.offsetHeight}
        );
      }
      newCanvas.on('path:created', () => {
        let state = JSON.stringify(newCanvas);
        setHistory([...history, state]);
        console.log("HISTORY: ", history)
        emitState(state);
      });
      setCanvas(newCanvas);
      
      Socket.on('draw', (state) => {
        newCanvas.loadFromJSON(state, () => {
          newCanvas.renderAll();
          setHistory([...history, JSON.stringify(canvas)]);
        });
      });
      Socket.on('clear', (name) => {
        setHistory([]);
        newCanvas.clear();
        newCanvas.setBackgroundColor('#ffffff');
        generateToast(`<strong>${name}</strong> cleared the drawing`, 2000);
      });
      Socket.on('joinedRoom', handleJoinedRoom);
      Socket.on('userJoined', handleUserJoined);
      Socket.on('userLeft', handleUserLeft);
    }

    return () => { canvas.dispose() }
  }, [])

  function updateBrushSize(e) {
    if (e.target.value !== brushSize) {
      e.target.checked = true;
      setBrushSize(e.target.value);
      canvas.freeDrawingBrush.width = parseInt(e.target.value, 10) || 1;
    }
  }

  function handleClear() { 
    resetState();
    Socket.emit('clear');
  }

  function handleUndo() {
    if (history.length > 1) {
      // grab the second to last because that's the previous state
      let prevState = history[history.length - 2];
      // set the history excluding the last item which is the current state
      setHistory([...history.slice(0, history.length - 1)]);
      if (prevState === null) {
        prevState = {};
      }
      updateState(prevState);
    } else {
      resetState();
    }
  }

  function handleSave(e) {
    e.currentTarget.download = "drawing.png";
    e.currentTarget.href = canvas.toDataURL();
  }

  function handleColorChange(e) {
    setBrushColor(e.currentTarget.value);
    var brush = canvas.freeDrawingBrush;
    brush.color = e.currentTarget.value;
    if (brush.getPatternSrc) {
      brush.source = brush.getPatternSrc.call(brush);
    }
  }

  function handleJoinedRoom({uid, canvasState}) {
    loadState(canvasState);
  }

  function handleUserJoined(name) {
    generateToast(`<strong>${name}</strong> joined`, 2000);
  }

  function handleUserLeft(name) {
    generateToast(`<strong>${name}</strong> left`, 2000);
  }

  /*****************************************************
   * THESE ARE FUNCTIONS FOR MAINTAINING THE STATE OF
   * THE CANVAS.
   ****************************************************/
  function emitState(state) {
    Socket.emit('draw', {uid: userId, state});
  }
  function saveState() {
    setHistory([...history, JSON.stringify(canvas)]);
    console.log("HISTORY: ", history)
    emitState();
  }
  function resetState() {
    setHistory([]);
    canvas.clear();
    canvas.setBackgroundColor('#ffffff');
  }
  function updateState(state) {
    canvas.loadFromJSON(state, () => {
      canvas.renderAll();
      emitState(state);
    })
    setCanvas(canvas);
  }
  function loadState(state) {
    canvas.loadFromJSON(state, () => {
      canvas.renderAll();
      setHistory([...history, JSON.stringify(canvas)]);
    });
  }
  /****************************************************/

  function toggleToolbar() {
    toolbar.current.classList.toggle('open');
  }

  return (
    <main className="draw-content">
      <div id="canvas-wrapper" ref={canvasWrapper}>
        <canvas id="c"></canvas>
      </div>
      <div id="tools" className="open" ref={toolbar}>
        <section>
          <button 
            id="toggle-tools-btn" 
            className="btn" 
            title="toggle tools"
            onClick={toggleToolbar}>
            <i className="material-icons">chevron_left</i>
          </button>
        </section>

        <section>
          <div id="drawing-width-options" className="mt-2">

            <label className="custom-radio-container" htmlFor="draw-radio-sm">
              <input 
                type="radio" 
                name="draw-size" 
                id="draw-radio-sm" 
                className="draw-size-option" 
                value="5" 
                onChange={updateBrushSize} />
              <span className="btn btn-outline-secondary icon-btn" id="draw-size-sm">
                <div className="circle-sm"></div>
              </span>
            </label>

            <label className="custom-radio-container" htmlFor="draw-radio-md">
              <input 
                type="radio" 
                name="draw-size" 
                id="draw-radio-md" 
                className="draw-size-option" 
                value="10"
                onChange={updateBrushSize}/>
              <span className="btn btn-outline-secondary icon-btn" id="draw-size-md">
                <div className="circle-md"></div>
              </span>
            </label>
            
            <label className="custom-radio-container" htmlFor="draw-radio-lg">
              <input
                type="radio"
                name="draw-size"
                id="draw-radio-lg"
                className="draw-size-option"
                value="25"
                onChange={updateBrushSize} />
              <span className="btn btn-outline-secondary icon-btn" id="draw-size-lg">
                <div className="circle-lg"></div>
              </span>
            </label>

            <label className="custom-radio-container" htmlFor="draw-radio-xl">
              <input
                type="radio"
                name="draw-size"
                id="draw-radio-xl"
                className="draw-size-option"
                value="50"
                onChange={updateBrushSize} />
              <span className="btn btn-outline-secondary icon-btn" id="draw-size-xl">
                <div className="circle-xl"></div>
              </span>
            </label>

          </div>
        </section>

        <section className="mb-2">
          <input 
            type="color" 
            value={brushColor}
            id="drawing-color" 
            title="color picker"
            onChange={handleColorChange} />
        </section>
        <br />

        <section>
          <button 
            id="undo-stroke" 
            className="btn btn-outline-secondary icon-btn mb-2" 
            title="undo"
            onClick={handleUndo}>
            <i className="material-icons">undo</i>
          </button>
          <button 
            id="clear-canvas" 
            className="btn btn-outline-danger icon-btn mb-2" 
            title="clear"
            onClick={handleClear}>
            <i className="material-icons">delete</i>
          </button>
          <a 
            id="save-image" 
            className="btn btn-outline-primary icon-btn" 
            title="save"
            onClick={handleSave}>
            <i className="material-icons">save</i>
          </a>
        </section>
      </div>
    </main>
  )
}

export default Draw;