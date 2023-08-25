import './Profil.css'
// import Avatar from '../avatar_default.png';
import {useState, useEffect} from 'react';
import Friends from '../friends/Friends';
import Header from '../Header';
import GotBeatenUp from './GotBeatenUp.png';
import PongLooser from './PongLooser.png';
import MyFirstWin from './MyFirstWin.png';
import PongLover from './PongLover.png';
import PongMaster from './PongMaster.png';
import { useParams } from 'react-router-dom';
import NoPage from '../NoPage/NoPage';

import '../test_mariah/Test_ultime/w3school.css';


function Profil () {
    const nickname = localStorage.getItem("userName");
    const [avatar, setAvatar] = useState("");
    const { whichProfile } = useParams();
    const decodedProfile = decodeURIComponent(whichProfile);
    const [visitor, setVisitor] = useState([]);
    let profileToUse = decodedProfile;
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
            setVisitor(data.data.find((item) => item.user === profileToUse));
          })
      }
    console.log(profileToUse);
    // if (!profileToUse) {
    //   profileToUse = nickname;
    // }
    // const nickname = profileToUse;
    const initialAchievements = [
        {id : 1, imgUrl: GotBeatenUp, unlocked : false, text : "Got Beaten Up"},
        {id : 2, imgUrl: PongLooser, unlocked : false, text : "Pong Looser"},
        {id : 3, imgUrl: MyFirstWin, unlocked: false, text : "My First Win"},
        {id : 4, imgUrl: PongLover, unlocked : false, text : "Pong Lover"}, 
        {id : 5, imgUrl: PongMaster, unlocked : false, text : "Pong Master"},
    ];
    const [achievements, setAchievements] = useState(initialAchievements);

    const updateAchievementUnlockStatus = (achievementIds) => {
        const idsArray = achievementIds.split("");
        const updatedAchievements = achievements.map((achievement) =>
        idsArray.includes(String(achievement.id)) // Check if the achievement's ID is in the array
            ? { ...achievement, unlocked: true } // Update the 'unlocked' status
            : achievement
        );
        setAchievements(updatedAchievements);
      };
    
    // const GetAll = async () =>{
    //     fetch('http://localhost:4000/users/all', {
    //         credentials: 'include', 
    //         method: 'GET', 
    //         headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },  
    //     })
    //     .then((response) => {
    //         return response.json();
    //     })
    //     .then((data) => {

    //     })
    // }

    const [matchHistory, setMatchHistory] = useState([]);
    const [achivementString, setAchievementString] = useState("");
    const [rank, setRank] = useState(0);
    const [friends, setFriends] = useState(false);


    const GetMe = (name ) => {
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
            if(data.data.statistic)
            {
                setMatchHistory(data.data.statistic.player_history);
                setAchievementString(data.data.statistic.achievement);
                setRank(data.data.statistic.rank);
                // setFriends(data.data.friends.filter((user) => user.friendId === localStorage.getItem("userName")));
            }
            // console.log("je ne connais pas la rep");
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

    useEffect(() => {
        GetAll();
        if (visitor){
            GetMe(visitor.user);
        }
        updateAchievementUnlockStatus(achivementString);
      }, [visitor, achivementString]);

    //   useEffect(() => {
    //   }, [achivementString])

    return (
        <div>
        {visitor &&  (
            <div>
                <Header/>
                <div className='box'>
                    <div className='first-box'>
                        <div className="info">
                        <div className="avatar-container">

                            <img src={visitor.avatar} alt="avatar" style={{float : 'left'}}/>
                            <span className={`dot ${ visitor.status === "offline" ? 'offline' : (visitor.status === 'online' ? "online" : "ingame")}`}></span>
                            </div>
                            <div className='name' style={{float:'left'}}>{visitor.user}</div>
                            <div className='name' style={{float:'right'}}>Points: {rank}</div>
                        </div>
                        <div >
                            {visitor.isFriend === true? (
                                <button onClick={() => DeleteFriend(visitor.user)}>Remove Friend</button> 
                            ): visitor.Already_invite ? (<button onClick={() => AddFriend(visitor.user)}>Add Friend</button>
                            ) : visitor.Already_send ? (<div className='name' style={{float:'right'}}>Waiting</div>): (<button onClick={() => InviteFriend(visitor.user)}>Invite Friend</button>)}
                        </div>
                    </div>
                    <div className="first-box">
                        <div className="image-container">
                            {achievements.map((achievement) => (
                                <img
                                    key={achievement.id}
                                    src={achievement.imgUrl}
                                    alt={`Achievement ${achievement.id}`}
                                    className={achievement.unlocked ? 'unlocked' : 'locked'}
                                    title={achievement.text}
                                />
                            ))}
                        </div>
                    </div>
                    <div className='first-box' style={{maxHeight:"400px", overflow:"auto"}}>
                        <p>match history</p>
                        <ul>
                            {matchHistory.map((history) => (
                                <li key={history.id}>
                                    {history.win === true ? (
                                        <p style={{color:"green"}}>Won against {history.opponent_nickname} : {history.my_score} - {history.opponent_score}</p>
                                        ) : (
                                        <p style={{color:"red"}}>Lost against {history.opponent_nickname} : {history.my_score} - {history.opponent_score}</p>)}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>)
        }
        {!visitor && (<NoPage />)}
        </div>
    );
}

export default Profil;