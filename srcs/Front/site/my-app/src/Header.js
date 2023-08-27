import React, { useEffect, useState } from 'react';
import DropdownMenu from './dropdownMenu/DropdownMenu';
import { useNavigate } from 'react-router-dom';
import Modal from '../src/modal/Modal';
import { useSocket } from './SocketContext';
import SearchFriends from './SearchFriends/SearchFriends';
import Loupe from './loupe-blanc-min.png';

const Header = () => {
  const socket = useSocket();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [getAll, setGetAll] = useState([]);
  const [timer, setTimer] = useState(0);
  const [display, setDisplay] = useState(false);
  const [invitor, setInvitor] = useState('');
  const [accept, setAccepted] = useState('');
  const [status, setStatus] = useState('');
  const username = localStorage.getItem('userName');
  const navigate = useNavigate();

  if (username) {
    socket.auth = { username };
    socket.connect();
    socket.emit("status");
  }

  const PageGame = () => { navigate('/game'); };
  const goHome = () => {
    navigate('/home');
    window.location.reload();
  };

  const AcceptGame = () => {
    setDisplay(false);
    socket.emit("GoGame", invitor);
    PageGame();
  }

  const RefuseGame = () => {
    setDisplay(false);
  }


  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);

      return () => clearInterval(countdown);
    }
    else
      setDisplay(false);
  }, [timer]);


  useEffect(() => {
    socket.on("status_user", (my_status) => {
      setStatus(my_status);
    })
    socket.on("GameAccepted", () => {
      setTimer(0);
      setDisplay(true);
      setInvitor('');
      setAccepted(true);
      navigate('/game');
    })
    socket.on("InviteGame", (opponnent) => {
      setDisplay(true);
      if (!invitor) {
        setTimer(30);
        setInvitor(opponnent);
      };
    });
    socket.on('TimeResponseInvite', (opponnent) => {
      setTimer(30);
      setDisplay(true);
    });
    socket.on("NoGame", () => {
      setDisplay(false);
      setTimer(0);
      setInvitor('');
      setAccepted(false);
      RefuseGame();
    });
    return () => {
      socket.off("GameAccepted")
      socket.off('InviteGame');
      socket.off('TimeResponseInvite');
      socket.off('NoGame');
    };
  })


  const GetAll = async () => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/users/all";
    fetch(final, {
      credentials: 'include',
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setGetAll(data.data);
        setIsModalOpen(true);
      })
  }

  return (
    <header>
      <div className="left-section">
        <button className="modal-button" onClick={GetAll}><img src={Loupe} style={{ height: "100%" }} alt="loupe" /></button>
      </div>
      <div className="center-section">
        <h1 className="title" onClick={() => goHome()}>Ft_transcendence</h1>
      </div>
      <Modal onClose={() => RefuseGame()} show={display} title="Let's Play">
        {invitor && (
          <>
            <button onClick={() => AcceptGame()}>Accept Invite</button>
            <button onClick={() => RefuseGame()}>Refuse Invite</button>
          </>
        )}
        {accept && PageGame()}
      </Modal>
      <DropdownMenu status_user={status} />
      <SearchFriends users={getAll} show={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  )
}

export default Header;