import './SearchFriends.css'
import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';

function SearchFriends({ users, show, onClose }) {
    const closeOnEscapeKeyDown = e => {
        if ((e.charCode || e.keyCode) === 27) {
          onClose();
        }
      };
    
      useEffect(() => {
        document.body.addEventListener("keydown", closeOnEscapeKeyDown);
        return function cleanup() {
          document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
        };
      }, );
    
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(users);
    const navigate = useNavigate();
    // const goHome= () => {navigate('/home');};

    const handleSearch = (query) => {
    const normalizedQuery = query.toLowerCase();
    const filteredList = users.filter((user) => user.user.toLowerCase().includes(normalizedQuery));
    setFilteredUsers(filteredList);
    setSearchQuery(query);
    };

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
    const goProfile = (event, name) => {event.stopPropagation();
      navigate('/profile/' + name)}

    return (
        <div> {show && (
            <div>
                <div className="overlay" onClick={(e) => { e.stopPropagation(); onClose(); }} />
                    <div className="user-search-container" onClick={onClose}>
                        <div className="search-container" onClick={e => e.stopPropagation()}>
                            <input
                                className="search-input"
                                type="text"
                                placeholder="Search users"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <div className="user-list-container" onClick={e => e.stopPropagation()}>
                            <div className="user-list">
                                {filteredUsers.map((user) => (
                                    <div className="item" key={user.user}>
                                        <img onClick={() => goProfile(user.user)} src={user.avatar} alt="Item"/>
                                        <div className="text"><p onClick={(event) => goProfile(event, user.user)}>{user.user}</p></div>
                                        <div>
                                        {user.isFriend ? (
                                            <button className='button' onClick={() => DeleteFriend(user.user)}>Remove Friend</button>
                                            ) : user.Already_invite ? ( //isInvited n'existe pas, mais devrait
                                                <button className='button' onClick={() => AddFriend(user.user)}>Accept Invitation</button>
                                            ) : user.Already_send ? (
                                              <p style={{backgroundColor:"wheat", color:"black"}}>Waiting</p>
                                            ) : (
                                            <button className="button" onClick={() => InviteFriend(user.user)}>Invite friend</button>
                                        )}                                                                            
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
            </div>
        )}
        </div>
    );
};

export default SearchFriends;
