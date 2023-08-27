import './Live.css';
import { CSSTransition } from 'react-transition-group';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../SocketContext';

const LiveModal = props => {
  const socket = useSocket();
  const [rooms, SetRoomList] = useState('');

  useEffect(() => {
    socket.on('List_room', list => {
      SetRoomList(list);
    })
    return () => {
      socket.off('List_room');
    }
  })

  const closeOnEscapeKeyDown = e => {
    if ((e.charCode || e.keyCode) === 27) {
      props.onClose();
    }
  };
  const [selectedGame, setSelectedGame] = useState(null);
  const navigate = useNavigate();
  const handleGameSelect = (game) => {
    setSelectedGame(game);
  };

  const handleConfirm = () => {
    if (selectedGame) {
      navigate(`/live/${encodeURIComponent(selectedGame)}`);
    }
  };

  useEffect(() => {
    document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    return function cleanup() {
      document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    };
  },);

  return (
    <CSSTransition
      in={props.show}
      unmountOnExit
      timeout={{ enter: 0, exit: 300 }}
    >
      <div className='livemodal'>
        <div className='livemodal-content'>
          <h2 className='livemodal-title'>Choose a Pong Game</h2>
          <ul>
            {rooms && rooms.map((room, index) => (
              <li key={index} onClick={() => handleGameSelect(room)}>{room}</li>
            ))}
          </ul>
          <button onClick={handleConfirm}>Confirm</button>
          <button onClick={props.onClose}>Cancel</button>
        </div>
      </div>
    </CSSTransition>
  );
};

export default LiveModal;