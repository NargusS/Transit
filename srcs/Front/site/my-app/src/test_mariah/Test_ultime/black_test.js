import { useEffect, useState} from "react";
import './w3school.css'
import Header from '../../Header';
import CreateConv from "./CreateConv";
import { useSocket } from '../../SocketContext'; 
import {useNavigate} from 'react-router-dom';

const BeginChat = () => {
  const socket = useSocket();
    const [me, setUser] = useState('');
    const [list, setList] = useState([]);
    const [room, SetNewRoom] = useState('');
    const [type_chan, SetTypeChan] = useState('');
    const [activeTab, setActiveTab] = useState('');
    const [dm, setActualDm] = useState('');
    const [selectedChannel, SelectChannel] = useState(null);
    const [msg, setMsg] = useState('');
    const [showModal, setshowModal] = useState(false);
    const [creatChatModal, setShowModalCreateChat] = useState(false);
    const [channelsList, setChannelsList] = useState([]);
    const [profile, setProfileSelected] = useState({});
    const [password, SetPwd] = useState('');
    const [verif, SetVerif] = useState('');
    const [checked_pwd, SetChecked] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [displayChannel, SetDisplay] = useState(null);
    const [montre, SetMontre] = useState([]);
    const [block, setBlock] = useState([]);
    const [stalk, setStalk] = useState([]);
    const navigate = useNavigate();

            const handleSendMessage = (type, message, to, to_username) => {
              if(to === to_username)
              type = "channel";
              if (type === 'pv') {
                socket.emit('private message', {
                  content: message,
                  to: to,
                  to_username: to_username,
                });
                const updatedMsg = {
                  name_chat: "",
                  from     : username,
                  from_id  : me.userId,
                  to_id    : to,
                  to       : to_username,
                  content  : message,
                }
                if(dm)
                {
                  const updatedChat = {
                    ...dm,
                    message: [...dm.message, updatedMsg],
                  };
                  setActualDm(updatedChat);
                }
                else  
                  setActualDm(updatedMsg);
              } else {
                socket.emit('group_chat', {
                  rooms_name: to,
                  content: message,
                });
              }
              setMsg('');
            };

            const username = localStorage.getItem('userName');
            if(username)
            {
              console.log("CHAT: c'est moi qui decide");
              socket.auth = {username};
              // socket.disconnect();
              socket.connect();
              if(!me){
                socket.emit('my-info');
                socket.emit("update-sessions");
                socket.emit("channels")
              }
            }

      useEffect(() => {   
      socket.on('session', (item) => {
        setUser(item.user_info);
        setBlock(item.block);
        setStalk(item.stalk);
      });

      socket.on('users', (users) => {
        setList(users);
        if(activeTab)
        {
          const active = users.find((element) => element.userId === activeTab.id)
          if(active)
          {
            setActiveTab({id: active.userId, username: active.username, status: active.connected, avatar: active.user.avatar})
          }
        }
      });

      socket.on('rooms_list', (channelsList) => {
        UpdateSelectedChannel(channelsList);
        setChannelsList(channelsList);
      });

      socket.on('private message', (message) =>
      {
        if(dm)
        {

          const updatedChat = {
            ...dm,
            message: [...dm.message, message],
          };
          setActualDm(updatedChat);
        }
      })

      socket.on("ActualDm", (chat) => { 
          setActualDm(chat);
      })

      socket.on("IsProtected", (test) => {
        if(test)
        {
          SetMontre(true);
          selectedChannel.display = true;
        }
        else
        {
          SetMontre(false);
          selectedChannel.display = false;
        }
      })

      socket.on("blocklist", (item) => {
        setBlock(item.block);
        setStalk(item.stalk);
      });

      socket.on('messageFromRoom', (message) => {
        console.log("Dans la room on recoit :" + message.content + "de " + message.from);
      });

      socket.on('group_chat_rep', (rep) => {
        console.log(rep);
      });

      socket.on('user disconnected', (userId) => {
        list.find((user) => user.userId === userId).connected = false;
      });
      
      return () => {
        socket.off("block");
        socket.off('user disconnected');
        socket.off('ActualDm')
        socket.off('session');
        socket.off('private message');
        socket.off('users');
        socket.off('rooms_list');
        socket.off('messageFromRoom');
        socket.off('IsProtected');
      };
    });

    const Join_rooms = () => {
      setShowModalCreateChat(false);
      console.log('Lets create a group');
      console.log("room = "+room);
      // socket.emit('group_chat', { rooms_name: room, content: 'Welcome le Sang' });
      if(room)
      {
        console.log("EHHHHH on envoie")
        let typi = "public";
        console.log("Type_chan =" + type_chan);
        if(type_chan)
        {
          typi = "private";
        }
        socket.emit('create_channel', { chat_name: room, password: password, type: typi});
      }
      SetTypeChan('');
      SetNewRoom('');
      SetPwd('');
      SetChecked(false);
      setShowPassword(false);
    };
    
    const LeaveChat = (channel) => {
      socket.emit("LeaveChat", channel);
    }

    const BlockUser = (to_block) => {
      const URL = "http://" + window.location.hostname + ":4000";
      const final = URL + "/users/block";
          fetch(final, {
            credentials: 'include', 
            method: 'POST', 
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },  
            body: JSON.stringify({blockedUser: to_block }),
          })
        .then((response) => {
            console.log("GETALL: reponse bonne")
              console.log(response);
            return response.json();
        })
        .then((data) => {
          console.log(data);
          if(data.data === null)
            socket.emit('my-info');
            socket.emit("update-sessions");
            socket.emit("block", to_block);
        })
    }  

    const ShowProfile = (see_user) => 
    {
      const url = "/profile/" + see_user;
      navigate(url);
    }

    const InviteFriend = (name) => {
      const URL = "http://" + window.location.hostname + ":4000";
      const final = URL + "/users/invitefriend";
        fetch(final, {
          credentials: 'include', 
          method: 'POST', 
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ nickname: name,}),   
        })
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

    const ModifyPassword = (pwd, action, chan) => 
    {
      socket.emit("change-password", {
        chan,
        pwd, 
        action,
      })
      SetVerif('');
    } 

  const CanWeTalk = (username) => {
    if(!StalkerUser(username) && !BlockedUser(username))
    {
      console.log("Bon terme")
      return true;
    }
    else if (StalkerUser(username))
    {
      console.log("tu es bloque")
      return (
        <p>You are a stalker, move out</p>
      )
    }
    else if (BlockedUser(username))
    {
      console.log("tu as bloque")
      return(
        <p>You have blocked {username} </p>
      )
    }
  }

  const NewConv = (user_name) => {
    if(user_name)
    {
      console.log('Newconv: Profile');
      setshowModal(true);
      setProfileSelected(user_name);
    }
    else
    {
      setShowModalCreateChat(true);
    }
  }

  const InviteGame = (opponent) => {
      setshowModal(false);
      console.log("opponent = " + opponent);
      socket.emit("InviteToGame", {opponent: opponent});
  }


  const BeAdmin = (username, channel) => {
      socket.emit("Admin", {new_admin: username, chat: channel});
  }

  const DeblockUser = (name) => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/users/deblock";
    fetch(final, {
      credentials: 'include', 
      method: 'DELETE', 
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },  
      body: JSON.stringify({deblockUser: name }),
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
      socket.emit("update-sessions");
      socket.emit("my-info");
      socket.emit("block", name);
    })
  }

  const BlockedUser = (username) => {
    return block.some((admin) => admin.blockerId === username) ? true : false;
  }

  const StalkerUser = (username) => {
    return stalk.some((admin) => admin.userId === username)  ? true : false;
  }

  const AdminRights = (username, channel, action) => {
    if(getAdminStatus(me.username, channel) !== "Non admin ")
    {
      if(username.username === channel.owner_group_chat)
      {
        console.log("Can't Punish the owner");
        return;
      }
      console.log("AdminRights: " + username);
      if(action === "MuteUser")
        socket.emit("Mute", {user_muted: username.username, chat: channel});
      else if (action === "BanUser")
        socket.emit("Ban", {user_banned: username.username, chat: channel});
      else if (action === "KickUser")
        socket.emit("Kick", {user_kicked: username.username, chat: channel});
      else if (action === "UnbanUser")
        socket.emit("Unban", {user_banned: username.username, chat: channel});
      else if (action === "UnMuteUser")
        socket.emit("UnMute", {user_muted: username.username, chat: channel});

    }
  }

  const EnterPassword = (pwd) => {
    socket.emit("protected_channel", {
      mdp: pwd,
      channel: selectedChannel,
    });
    SetVerif('');
  }

  const UpdateSelectedChannel = (channelsList) => {
    if(selectedChannel)
    {
      const update = channelsList.find((admin) => admin.chat_name === selectedChannel.chat_name);
      if(update)
      {
        SetDisplay(update);
        if(!update.protected)
        {
          SetMontre(true);
        }
        else
        {
          SetMontre(false);
        }
      }
    }
  }

  const PrivateChannel = (channel) => {
    console.log("Le channel est " + channel.type)
    if(displayChannel && channel !== displayChannel)
      channel = displayChannel;
    if(channel.type === "channel_private")
    {
      console.log("On est un channnel privée ici")
      const find_me = channel.users.some((user) => user.username === me.username) ? true : false;
      if(find_me)
      {
        return true;
      }
      else
        return false
    }
    return true;
  }

  const getBannedStatus = (username, channel) => {
    return channel.banned.some((admin) => admin.username === username) ? true : false;
  }

  const getAdminStatus = (username, channel) => {
    if(username === channel.owner_group_chat)
    {
      console.log("tu es owner");
      return " (Owner) ";
    }
    return channel.admins.some((admin) => admin.username === username) ? " (Admin) " : "Non admin ";
  };

  const getMutedStatus = (username, channel) => {
    return channel.muted.some((admin) => admin.username === username) ? " (Muted) " : "Non muted";
  };

  const ConvSelected = (channel, dm) =>{
    if(channel)
    {
      setActiveTab('');
      SelectChannel(channel);
      SetDisplay(channel);
      if(channel.protected)
      {
        channel.display = false;
        SetMontre(false);
      }
      else
      {
        channel.display = true;
        SetMontre(true);
      }
    }
    else if(dm)
    {
      SelectChannel(null);
      SetDisplay(null);
      socket.emit("findDm", dm.username);
      setActiveTab({ id: dm.userId, username: dm.username, status: dm.connected, avatar: dm.user.avatar});
    
    }
    else
    {
      setActiveTab('');
      SelectChannel(null);
      SetDisplay(null);
    }
  }

  const handleCheckboxChange = () => {
    SetChecked(!checked_pwd)
  };

  const handlePasswordChange = (event) => {
    SetPwd(event.target.value);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

    return (
      <div className="bodo">
        <Header/>    
            <div className="containo">
              <div className="small-div">
                  <div className="newconv">
                    <div className="custom_btn" onClick={() => NewConv('')}>+</div>
                    <CreateConv onClose={() => Join_rooms()} show={creatChatModal} title="New Chat">
                      <div className="create_chat">
                        <input 
                          type="text" 
                          placeholder="Name of the group" 
                          value={room} 
                          onChange={e => SetNewRoom(e.target.value)}
                        />
                      </div>
                      <br/>
                      <h3 style={{backgroundColor:"inherit", margin: "10px"}}>Private</h3>
                      <input
                        type="checkbox"
                        placeholder="private"
                        value="true"
                        onChange={e => SetTypeChan(e.target.value)}
                      />
                      <br/>
                      <div className="create_chat">
                        <h5 style={{backgroundColor: "inherit", margin:"10px"}}> Protected Chat : </h5>
                        <label className="toggle-button">
                        <input type="checkbox"
                          checked={checked_pwd} 
                          onChange={e => handleCheckboxChange(e.target.value)}
                        />
                        <span className="slider"></span>
                        </label>
                        {checked_pwd && (
                          <div className="create_chat">                            
                          <input className="input_chat"
                          type={showPassword ? 'text' : 'password'}
                          id="passwordInput"
                          placeholder="Enter your password"
                          value={password}
                          onChange={e => handlePasswordChange(e)}
                          />
                          <span>
                        <button className="create_button" onClick={() => handleTogglePassword()} >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                          </span>
                          </div>
                        )}
                        </div>
                      </CreateConv>
                  </div>
              </div>
            <div className="small-div-r">
              {activeTab && (
                <div className="new_who">
                  <div className="avatar-container">
                    <span className={`dot ${ activeTab.status === "offline" ? 'offline' : (activeTab.status === 'online' ? "online" : "ingame")}`}></span>
                    <img src={activeTab.avatar} alt="Avatar" />
                  </div>
                  <p>{activeTab.username}</p>
                </div>
              )}
              {selectedChannel && (
                <div className="new_who">
                  {selectedChannel.chat_name}
                </div>
              )}
            </div> 
          </div>
          <div className="last-divs-container">
                  <div className="last-div">
                    <h2 style={{color:"wheat"}}>DM</h2>
                    <div className="tab">
                      <ul>
                        {list.map((user) => (
                            user.username !== username && (
                            <li key={user.userId}>
                            <button
                              className={activeTab.username === user.username ? 'tablinks active' : 'tablinks'}
                              onClick={() => ConvSelected(false, user)}
                          >
                              <div className="avatar-container">
                                <img src={user.user.avatar} alt="Avatar" />
                                <span className={`dot ${ user.connected === "offline" ? 'offline' : (user.connected === 'online' ? "online" : "ingame")}`}></span>
                              </div>
                              <div className="username">{user.username}</div>
                            </button>         
                        </li>
                      )))}
                    </ul>
                </div>
                <h2 style={{color:"wheat"}}>CHANNELS</h2>
                <div className="tab">
                <ul>
                  {channelsList.map((channel, index) => (
                      <li key={index}>
                  <button
                    className={selectedChannel === channel ? 'tablinks active' : 'tablinks'}
                    onClick={() => ConvSelected(channel, false)}
                    >
                      <div className="username">#{channel.chat_name} </div>
                   </button>
                      </li>
                  ))}
                </ul>
                </div>
                  </div>
                  <div className="last-div-r">
                  {activeTab && CanWeTalk(activeTab.username) === true &&(
                    <div className="div-r-sup">
                        <div className="div-r-sup">
                        {dm && dm.message.map((message, index) => (
                            <div key={index} className="div-r-sup">
                            {message.from === username ? (
                              <>
                                <p className="sender__name">You</p>
                                <div className="message__sender">
                                  {message.content}
                                </div>
                              </>
                            ) : ( 
                              <>
                                <p className="receiver__name">{message.from}</p>
                                <div className="message__recipient">
                                  {message.content}
                                </div>
                              </>
                            )}
                            </div>
                          ))}
                          </div>
                    </div>
                  )}
               {activeTab && CanWeTalk(activeTab.username)}
        { activeTab && !StalkerUser(activeTab.username) && !BlockedUser(activeTab.username) && (
                <div>
                  <div className="chat_bar" style={{position: "fixed",  flexWrap: "nowrap"}}>
                      <input className="foot"
                        type="text"
                        placeholder="Type msg"
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                        />
                      <button  onClick={() => handleSendMessage("pv", msg, activeTab.id, activeTab.username) }>
                        Send
                      </button>
                      </div>
                    </div>
                    )}
                      {selectedChannel && (getBannedStatus(me.username, selectedChannel) || (displayChannel && getBannedStatus(me.username, displayChannel)) )&& (
                        <p>You are banned from {selectedChannel.chat_name}</p>
                      )}
                      { selectedChannel  && (!getBannedStatus(me.username, selectedChannel)  || (displayChannel && !getBannedStatus(me.username, displayChannel)) ) && selectedChannel.protected &&
                      !selectedChannel.display && !montre && (
                          <div className="create_chat">
                            <label>Please enter the password of this channel
                         <input
                           className="input_chat"
                           type="password"
                           placeholder="Enter the channel password"
                           value={verif}
                           onChange={(e) => SetVerif(e.target.value)}
                           />
                           </label>
                           <button className="create_button" onClick={() => handleTogglePassword()}>
                             {showPassword ? 'Hide' : 'Show'}
                           </button>
                           <button onClick={() => EnterPassword(verif)}>Submit</button>
                           </div>    
                      )}
                      {selectedChannel && !getBannedStatus(me.username, displayChannel) && selectedChannel.display 
                        && PrivateChannel(selectedChannel) &&
                         (
                           <div className="div-r-sup">
                        { displayChannel &&  selectedChannel.chat_name === displayChannel.chat_name && displayChannel.message.map((message, index) => (
                              <div key={index} className="div-r-sup">
                              {  message.from === username ? (
                                <>  
                                  <p className="sender__name">You</p>
                                  <div className="message__sender">
                                      {message.content}
                                  </div>
                                </>
                              ) : (
                                <>
                                  {!StalkerUser(message.from) && !BlockedUser(message.from) && (
                                    <>
                                  <p className="receiver__name">{message.from}</p>
                                  <div className="message__recipient">
                                      {message.content}
                                  </div>
                                  </>
                                  )}
                                </>
                              )}
                              </div>
                    ))}
                          </div>
                          )}
                        { selectedChannel &&  selectedChannel.display && displayChannel &&  displayChannel.chat_name === selectedChannel.chat_name 
                         && getMutedStatus(me.username, displayChannel) === "Non muted"  &&!getBannedStatus(me.username, displayChannel) && (
                         <div className="chat_bar" style={{position: "fixed",  flexWrap: "nowrap"}}>
                      <input className="foot" 
                        type="text"
                        placeholder="Type msg"
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                        />
                      <button  onClick={() => handleSendMessage("channel", msg, selectedChannel.chat_name, selectedChannel.chat_name) }>
                        Send
                      </button>
                      </div>)}
                  </div>
                  <div className="last-divi">
                      <div className="msg_pv" style={{color:"white"}}>Members</div><br/>
                    <div className="tabi">
                    { selectedChannel && displayChannel &&  displayChannel.chat_name === selectedChannel.chat_name  && selectedChannel.display && (
                      <div>
                        <ul>
                          {displayChannel.users.map((user, index) => 
                           user.username !== username && (
                              <div key={index}>
                            <button onClick={() => NewConv(user)}>
                                {user.username}
                                <span>
                                  {getAdminStatus(user.username, displayChannel)}
                                </span>  
                                <span>
                                  {getMutedStatus(user.username, displayChannel)}
                                </span>  
                            </button>
                                </div>
                          ))}
                          <div className="msg_pv">
                              Banned
                           {displayChannel.banned.map((user, index) => 
                            user.username !== username && (
                             <div key={index}>
                            <button onClick={() => NewConv(user)}>
                                {user.username}
                            </button>
                                </div>
                          ))}
                          </div>
                            <CreateConv onClose={() =>setshowModal(false)} show={showModal} title={profile.username}>
                            <button onClick={() => InviteFriend(profile.username)}>Invite Friend</button>
                            {profile && profile.connected === "online" && (
                              <button onClick={() => InviteGame(profile.username)}>Invite Pong</button>
                            )}
                            <button>Profile</button>
                            {getAdminStatus(me.username, displayChannel) !== "Non admin " && (
                              <div>
                              <button onClick={() => BeAdmin(profile.username, displayChannel)}>New Admin</button>
                                <button onClick={() => AdminRights(profile, displayChannel, "KickUser")}>Kick</button>
                                {(getMutedStatus(profile.username, displayChannel) === "Non muted") ? (
                                  <>
                                    <button onClick={() => AdminRights(profile, displayChannel, "MuteUser")}>Mute</button>                            
                                  </>
                                ) :
                                (
                                    <>
                                    <button onClick={() => AdminRights(profile, displayChannel, "UnMuteUser")}>UnMute</button>                            
                                  </>
                                )}
                                {!getBannedStatus(profile.username, displayChannel) ? (
                                  <>
                                    <button onClick={() => AdminRights(profile, displayChannel, "BanUser")}>Ban</button>
                                  </>
                                ) : 
                                (
                                  <>
                                    <button onClick={() => AdminRights(profile, displayChannel, "UnbanUser")}>UnBan</button>
                                  </>
                                )}
                              </div>
                            )}
                            </CreateConv>
                        </ul>
                      </div>
                    )}
                </div>
                {displayChannel && displayChannel.protected && displayChannel.owner_group_chat === username && selectedChannel.display && (
                           <>
                            <input
                             className="input_chat"
                             type="password"
                             placeholder="Modify channel password"
                             value={verif}
                             onChange={(e) => SetVerif(e.target.value)}
                             />
                             <button style={{margin:"5px"}} onClick={() => ModifyPassword(verif, "modify", displayChannel.chat_name)}>Submit</button>
                            <br/>
                             <button style={{margin:"5px"}} onClick={() => ModifyPassword("", "", displayChannel.chat_name)}>No Protected</button>
                             
                           </>
                         )}
                    {selectedChannel && displayChannel &&  displayChannel.chat_name === selectedChannel.chat_name && selectedChannel.display && (

                      <div className="chat_bari">
                      <button className="conv_btn" onClick={() => LeaveChat(displayChannel)}>Leave</button>
                    </div>
                    )}
                    {activeTab && (
                      <div className="mini_profile">
                          <div className="mini"> 
                            <div className="avatar-container">
                              <span className={`dot ${ activeTab.status === "offline" ? 'offline' : (activeTab.status === 'online' ? "online" : "ingame")}`}></span>
                              <img src={activeTab.avatar} alt="Avatar" />
                            </div>
                              <p>{activeTab.username}</p>
                           </div>
                              <button onClick={() => ShowProfile(activeTab.username)}>Show Profile</button>
                              <button onClick={() => InviteFriend(activeTab.username)}>Invite Friend</button>
                              {
                                activeTab.status === 'ingame' ? 
                                <div >Watch game</div>  : (activeTab.status === 'online' ? <button onClick={() => InviteGame(activeTab.username)}>Invite Game</button> : <></>) 
                              }
                              {activeTab && CanWeTalk(activeTab.username) === true? 
                                <button className="conv_btn" onClick={() => BlockUser(activeTab.username)}>Block User</button>
                               : 
                                <button className="conv_btn" onClick={() => DeblockUser(activeTab.username)}>Deblock User</button>
                            }
                        </div>  
                    )}
                   </div>
          </div>
      </div>
    );
}
 
export default BeginChat;