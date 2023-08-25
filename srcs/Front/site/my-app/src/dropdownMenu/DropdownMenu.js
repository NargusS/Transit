import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import Avatar from '../avatar_default.png';
import './DropdownMenu.css';

const DropdownMenu = ({status_user}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  const avatar = localStorage.getItem('avatar');

  console.log("Status " + status_user)
  const logOut = () => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/auth/logout";
    fetch(final, {
            method: 'GET',
            credentials: 'include', 
            headers: {'Content-Type': 'application/json'}})
        .then((response) => response.json())
        .then((data) => {
          if (data)
          {
            localStorage.removeItem("userName");
            localStorage.removeItem("avatar");
            localStorage.removeItem("2AF");
            localStorage.removeItem("connected");
            console.log("ciao");
          }
        });
  }
  const [status, setStatus] = useState([]);
  const nickname = localStorage.getItem("userName");

  const GetMe = (name) => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/users";
    fetch(final, {
      credentials: 'include', 
      method: 'POST', 
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ nickname: name,}), 
    })
    .then((response) => {
        console.log("GETALL: reponse bonne")
          console.log(response);
        return response.json();
    })
    .then((data) => {
      if(data.data){
          setStatus(data.data.status);
      }
    })
  }
    useEffect(() => {
        GetMe(nickname);
        console.log(status);
      }, []);

  return (
    <div className="dropdown">
      <button className="dropdown-toggle" onClick={handleToggle}>
        <img src={avatar} alt="avatar"/>
        <span className={`dot ${ status_user === 'ingame' ? "ingame" : "online"}`}></span>
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/game">Game</Link></li>
          <li><Link to="/chat">Chat</Link></li>
          <li><Link to="/options">Options</Link></li>
          <li><Link to="/" className='red' onClick={logOut}>Logout</Link></li> 
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;