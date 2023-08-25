import './Friends.css'
import React, { useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import { useNavigate } from 'react-router-dom';
import '../test_mariah/Test_ultime/w3school.css';


const Friends = props => {
  const navigate = useNavigate();
      const closeOnEscapeKeyDown = e => {
      if ((e.charCode || e.keyCode) === 27) {
        props.onClose();
      }
    };

    const handleProfileClick = (friend) => {
      navigate('/profile/' + friend.user);
    };
    
    const handleInviteClick = (friend) => {
      console.log(`Inviting ${friend.user} to play a game`);
    };
    
    const handleBlockClick = (friend) => {
      // console.log(`Blocking ${friend.user}`);
      const URL = "http://" + window.location.hostname + ":4000";
      const final = URL + "/users/block";
        fetch(final, {
              credentials: 'include', 
              method: 'POST', 
              headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },  
              body: JSON.stringify({blockedUser: friend.user }),
            })
          .then((response) => {
              console.log("GETALL: reponse bonne")
                console.log(response);
              return response.json();
          })
          .then((data) => {
            console.log(data);
            if(data.data === null)
              console.log("no ennemies")
          })
      }
      const AddFriend = (name) => {
        const URL = "http://" + window.location.hostname + ":4000";
        const final = URL + "/users/friends";
        fetch(final, {
            credentials: 'include', 
            method: 'POST', 
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },  
            body: JSON.stringify({ friendName: name}),
          })
        .then((response) => {
              console.log(response);
            return response.json();
        })
        .then((data) => {
          console.log(data);
          if(data.data === null)
            console.log("no friends")
          // setRes(data)
        })
  }

  const InviteFriend = (name) => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/users/invitefriend";
      fetch(final, {
        credentials: 'include', 
        method: 'POST', 
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ nickname: name,}),   
      }) //Si tu veux changer que le nickname il te suffit d'enlever l'avatar de l'objet
      .then((response) => {
        if (response.ok) {
        console.log(response.ok);
      return response.json(); 
        } else {
        console.log('Network response was not ok');
      }
      })
      .then((data) => {
        console.log('Response:', data); 
      })
    }

  const DeleteFriend = (name) => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/users/deletefriend";
    fetch(final, {
      credentials: 'include', 
      method: 'DELETE', 
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },  
      body: JSON.stringify({byefriend: name }),
    })
    .then((response) => {
        console.log("GETALL: reponse bonne")
          console.log(response);
        return response.json();
    })
    .then((data) => {
      console.log(data);
      if(data.data === null)
        console.log("no ennemies")
      // setRes(data)
    })
  }

    // useEffect(() => {
    //   document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    //   return function cleanup() {
    //     document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    //   };
    // });
  
    return (
      <div>
      <CSSTransition
        in={props.show}
        unmountOnExit
        timeout={{ enter: 0, exit: 300 }}
      >
        <div className="friends" onClick={props.onClose}>
          <div className="friends-content">
            <div className='friends-title'>{props.title}</div>
            <ul className="friend-list">
              {props.friends.map((friend) => (
                <li key={friend.user} className="friend-item">
                  <div className="friend-content">
                    <div className="avatar-container">
                    <img src={friend.avatar} alt={`Avatar of ${friend.user}`} className="avatar" />
                    <span className={`dot ${ friend.status === "offline" ? 'offline' : (friend.status === 'online' ? "online" : "ingame")}`}></span>
                    </div>

                    <div className="nickname" >
                      <p onClick={() => handleProfileClick(friend)}>{friend.user}</p>
                    </div>
                  </div>
                  <div className="button-group" style={{float:"right"}}>
                  {friend.isFriend === true ? (
                      <button className='buttonA' onClick={() => DeleteFriend(friend.user)}>Remove Friend</button>
                      ) : friend.Already_invite ? (
                          <button className='buttonA' onClick={() =>AddFriend(friend.user)}>Accept Invitation</button>
                      ) : friend.Already_send ? (
                        <p style={{backgroundColor:"wheat", color:"black"}}>Waiting</p>
                      ) : (
                      <button className="buttonA" onClick={() =>InviteFriend(friend.user)}>Invite friend</button>
                  )}
                    {/* {friend.isFriend === true ? <div>Remove Friend</div> : <div>Accept Invitation</div>}
                    <div className="buttonA" onClick={() => handleInviteClick(friend)}>Invite</div> */}
                    {/* <div className="buttonA" onClick={() => handleBlockClick(friend)}>Block</div> */}
                  </div>
                </li>
              ))}
            </ul>
            </div>
          </div>
      </CSSTransition>
      </div>
    );
  };
  
  export default Friends;