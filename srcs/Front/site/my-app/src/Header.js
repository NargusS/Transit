import React, { useEffect, useState } from 'react';
import DropdownMenu from './dropdownMenu/DropdownMenu';
import {useNavigate} from 'react-router-dom';
import Modal from '../src/modal/Modal';
import { useSocket } from './SocketContext'; 
// import { Socket } from 'socket.io-client';
import SearchFriends from './SearchFriends/SearchFriends';


const Header = () => {
  const socket = useSocket();
  
  const navigate = useNavigate();
  const goHome= () => {
    // socket.disconnect();
    navigate('/home');
  };
  
  
  const PageGame = () => {
    // socket.disconnect();
    navigate('/game');
  };
  
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [getAll, setGetAll] = useState([]);
  const [timer, setTimer] = useState(0); // Initial timer value in seconds
  const [display, setDisplay] = useState(false);
  const [gest, SetGest] = useState('');
  const [invitor, setInvitor] = useState('');
  const [accept, setAccepted] = useState('');
  const [me, setMe] = useState('');
  const [status, setStatus] = useState('');
  
    const username = localStorage.getItem('userName');
    if(username)
    {
      //   console.log("Je me connecte dans le header");
      socket.auth = { username };
    //   if(socket.disconnected)
        socket.connect();
        socket.emit("status");
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
        // socket.on('session', ({user_info}) => {
        //     console.log("user =" + user_info);
        //     // console.log("blacklist " + user_info.user.blacklist);
        //     console.log("Userid = " + user_info.userId);
        //     console.log("username " + user_info.username);
        //     setMe(user_info);
        //     // console.log('sessionId = ' + socket.username);
        //   });

        socket.on("status_user", (my_status) => 
        {
          setStatus(my_status);
        })

        socket.on("GameAccepted", () => {
          console.log("Game accepté pureeeee");
          setTimer(0);
          setDisplay(true);
          setInvitor('');
          setAccepted(true);
          navigate('/game');
        })

        socket.on("InviteGame", (opponnent) => {
          console.log("INviteGame: begin");
          console.log(opponnent)
          setDisplay(true);
          if(!invitor)
          {
              // SetGest(me);

              setTimer(30);
              setInvitor(opponnent);
          };
        });

        socket.on('TimeResponseInvite', (opponnent) => {
          SetGest(opponnent);
          setTimer(30);
          setInvitor(me);
          setDisplay(true);
        });

        socket.on("NoGame", () => {
          setDisplay(false);
          setTimer(0);
          setInvitor('');
          SetGest('');
          setAccepted(false);
          RefuseGame();
        });

        return () => {
          // socket.off('user disconnected');
          // socket.off('session');
          socket.off("GameAccepted")
          socket.off('InviteGame');
          socket.off('TimeResponseInvite');
          socket.off('NoGame');
        };
    })

    const AcceptGame = () => {
      // console.log("Invitator: " + invitor);
      setDisplay(false);
        socket.emit("GoGame", invitor);
      // socket.disconnect();  
      PageGame();
    }

    const RefuseGame = () => {
      setDisplay(false);
      // socket.emit('NoGameAnymore', invitor);
    }
    const GetAll = async () =>{
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
            // const userList = data.data.filter((user) => user.isBlocked === false);
            const userList = data.data;
            setGetAll(userList);
            console.log(userList);
            setIsModalOpen(true);
        })
    }

    return (
        <header>
          <div className="left-section">
                <button className="modal-button" onClick={GetAll}>
                Search
                </button>
            </div>
            {/* <h1 style={{cursor:'pointer'}} onClick={goHome}>Ft_transcendence</h1> */}
            <div className="center-section">
                <h1 className="title" onClick={() => goHome()}>
                Ft_transcendence
                </h1>
            </div>
              <Modal onClose={() => RefuseGame()} show={display} title="Let's Play">
                {invitor && (
                    <>
                    <button onClick={() => AcceptGame()}>Accept Invite</button>
                    <button onClick={() => RefuseGame()}>Refuse Invite</button>
                    </>
                )}
                {accept && PageGame()
                }
              </Modal>
            <DropdownMenu status_user={status}/>
            <SearchFriends users={getAll} show={isModalOpen} onClose={() => setIsModalOpen(false)}/>
            
        </header>
    )
}

export default Header;