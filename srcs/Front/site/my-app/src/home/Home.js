import './Home.css';
import { useNavigate} from 'react-router-dom';
import React, { useState } from 'react';
import Header from '../Header';
import LiveModal from '../live/LiveModal';
import { useSocket } from '../SocketContext';

const styles = {
    playButtonColor: "#1e9bff",
    chatButtonColor: "#ff6b6b",
    profileButtonColor: "#5eead4",
    liveButtonColor: "#ffff00",
  };

function Home() {
    const socket = useSocket();
    // const [list, setList] = useState([]);
    const [security, setSecurity] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    if (!security && !localStorage.getItem("userName")) {
      const URL = "http://" + window.location.hostname + ":4000";
      const final = URL + "/auth/security";
      fetch(final, {
          method: 'GET',
          credentials: 'include', 
          headers: {'Content-Type': 'application/json'}})
      .then((response) => response.json())
      .then((data) => {
        if (data.data)
        {
          localStorage.setItem("userName", data.data.nickname);
          localStorage.setItem("avatar", data.data.avatar);
          if(data.data.password_A2f){
              localStorage.setItem("2AF", "not empty")
          }
          setSecurity(true);
        }
      });
    }

    const navigate = useNavigate();
    const handlePlayButton = () => {navigate('/game');};
    const handleChatButton = () => {navigate('/chat');};
    const handleProfileButton = () => {navigate('/profile');};
    const handleLiveButton = () => {
      
      socket.emit("room_list");
      //pas plutôt un on ? avec un emit quand la roomname est créée
      setIsModalOpen(true);
    };

    return (
      <div>
          <Header  />
          <div className="container">
              <button className="playbutton" style={{ "--clr": styles.playButtonColor }} onClick={handlePlayButton}><span>play</span></button>
              <button className="playbutton" style={{ "--clr": styles.liveButtonColor }} onClick={handleLiveButton}><span>live</span></button>
              <LiveModal onClose={() =>setIsModalOpen(false)} show={isModalOpen}></LiveModal>
              <button className="playbutton" style={{ "--clr": styles.chatButtonColor }} onClick={handleChatButton}><span>chat</span></button>
              <button className="playbutton" style={{ "--clr": styles.profileButtonColor }} onClick={handleProfileButton}><span>profile</span></button>
          </div>
      </div>
    );
};

export default Home;