import { useEffect, useState} from "react";
// import io from "socket.io-client";
// import './all.css'
// import './test.css'
import './w3school.css'
import Header from '../../Header';
import CreateConv from "./CreateConv";



const BeginChat = ({socket}) => {
    const [list_msg, setContent] = useState([]);
    // const [isOnline, setIsOnline] = useState(false);
    // const [conv, setConversation] = useState({});
    // const [chat, SetChat] = useState
    // const [username, setUsername] = useState('');
    const [me, setUser] = useState('');
    const [list, setList] = useState([]);
    const [room, SetNewRoom] = useState('');
    const [activeTab, setActiveTab] = useState('');
    const [selectedChannel, SelectChannel] = useState(null);
    const [msg, setMsg] = useState('');
    const [conversations, setConversations] = useState([{}]);
    const [exit_gate, setGate] = useState(false);
    const [filteredItems, setFilteredItems] = useState([]);
    const [showModal, setshowModal] = useState(false);
    const [creatChatModal, setShowModalCreateChat] = useState(false);
    const [rooms_list, SetRoomList] = useState([]);
    const [channelsList, setChannelsList] = useState([]);
    const [profile, setProfileSelected] = useState('');
    const [douille, setDouille] = useState('');
    const [password, SetPwd] = useState('');
    const [verif, SetVerif] = useState('');
    const [checked_pwd, SetChecked] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [displayChannel, SetDisplay] = useState(null);

    const StockMessages = (type, message, receiver, mdp) => {
        console.log('on est dans StockMessage')
        console.log(activeTab)
        console.log("message a stocker = "+ message);
        console.log(exit_gate);

        setConversations((prevConversations) => {
            // Check if the conversation already exists
            const existingConversation = prevConversations[receiver];
    
            if (!existingConversation) {
                // If it doesn't exist, create a new conversation object
                return {
                    ...prevConversations,
                    [receiver]: {
                        type: type,
                        password: mdp,
                        messages: [message], // Initialize messages with the new message
                    },
                };
            } else {
                // If it exists, update the messages for the receiver
                return {
                    ...prevConversations,
                    [receiver]: {
                        ...existingConversation,
                        messages: [...existingConversation.messages, message],
                    },
                };
            }
        });

    };

    const handleSendMessage = (type, message, to, to_username) => {
      if(to === to_username)
        type = "channel";
      if (type === 'pv') {
        console.log("on envoie un msg la")
        console.log(activeTab)
        socket.emit('private message', {
          content: message,
          to: to,
          to_username: to_username,
        });
        StockMessages(type, {who: username, content:message}, to_username, "");
      } else {
        socket.emit('group_chat', {
          rooms_name: to,
          content: message,
        });
        // UpdateSelectedChannel(channelsList);
      }
      console.log("(SelectedChannel pb) Ton channel est = " + selectedChannel.chat_name);
      setMsg('');
    };
        const username  = localStorage.getItem('userName');
        const avatar = localStorage.getItem('avatar');
    useEffect(() => {
      socket.auth = { username };
      socket.connect();

      socket.on('session', ({user_info}) => {
        console.log("user =" + user_info);
        console.log("blacklist " + user_info.user.blacklist);
        console.log("Userid = " + user_info.userId);
        console.log("username " + user_info.username);
        setUser(user_info);
        // console.log('sessionId = ' + socket.username);
      });
      socket.on('users', (users) => {
        // for (let i = 0; i < users.length; i++) {
        //   list.push(users[i]);
        //   console.log(list[i].connected);
        // }
        setList(users);
      });

      // socket.on("rooms_list", (channels_list) => {
      //   console.log(channels_list);
      //   SetRoomList(channels_list);
      // })

      socket.on('rooms_list', (channelsList) => {
        
        console.log("channel_list"  + channelsList);
        UpdateSelectedChannel(channelsList);
        setChannelsList(channelsList);
      });

      socket.on('private message', (message) =>
      {
        console.log("On est dans pv le ssang")
        StockMessages("pv", {who: message.from, content:message.content}, 
        message.from, "" );
        console.log("message de pv = " + message.content);
      })


      socket.on('messageFromRoom', (message) => {
        console.log("Dans la room on recoit :" + message.content + "de " + message.from);
        StockMessages("room", {who: message.from, content: message.content}, message.to, "");
        // setContent(prevState => [...prevState, message])
      });
      socket.on('group_chat_rep', (rep) => {
        console.log(rep);
      });
      socket.on('user disconnected', (userId) => {
        console.log(`${userId} is disconnected`);
        // socket.disconnect();
      });
      return () => {
        socket.off('user disconnected');
        socket.off('session');
        socket.off('private message');
        socket.off('users');
        socket.off('rooms_list');
        socket.off('messageFromRoom');
      };
    }, [socket, list, username, channelsList, displayChannel]);

    const Join_rooms = () => {
      setShowModalCreateChat(false);
      console.log('Lets create a group');
      console.log("room = "+room);
      // socket.emit('group_chat', { rooms_name: room, content: 'Welcome le Sang' });
      if(room)
      {
        console.log("EHHHHH on envoie")
        socket.emit('create_channel', { chat_name: room, password: password});
      }

      SetNewRoom('');
      SetPwd('');
      SetChecked(false);
      setShowPassword(false);
    };
    
    const LeaveChat = (channel) => {
      socket.emit("LeaveChat", channel);
    }

    const Onsearch = (searchString) => {
      const filter = searchString.toUpperCase();
      const filteredList = list.filter((item) =>
      {
          item.username.toUpperCase().includes(filter)
      }
      );
      setFilteredItems(filteredList);
    };

  const CanWeTalk = (username) => {
    if(!StalkerUser(username) && !BlockedUser(username))
    {
      return true;
    }
    else if (StalkerUser(username))
    {
      return (
        <p>You are a stalker, move out</p>
      )
    }
    else if (BlockedUser(username))
    {
      return(
        <p>You have blocked {username} </p>
      )
    }
  }



  const handleSearchChange = (event) => {
    const searchString = event.target.value;
    Onsearch(searchString);
  };

  const onSubmit = () => {
    setMsg("");
  };

  const NewConv = (user_name) => {
    if(user_name)
    {
      setshowModal(true);
      setProfileSelected(user_name);
    }
    else
    {
      setShowModalCreateChat(true);
    }
  }

  const BeAdmin = (username, channel) => {
    // if(getAdminStatus(me.username, channel) === " (Admin) " || channel.owner_group_chat === me.username)
    // {
      socket.emit("Admin", {new_admin: username, chat: channel});
    // }
  }

  const BlockedUser = (username) => {

    // if(me.user.blacklist.some((admin) => admin.blockerId === me.username) && 
    //       me.user.blocklist.some((admin) => admin.blockerId === username))
    //       return true;
    return me.user.blacklist.some((admin) => admin.blockerId === username) ? true : false;
  }

  const StalkerUser = (username) => {
    console.log("StalkerUser " + username);
    return me.user.blocklist.some((admin) => admin.userId === username)  ? true : false;
  }


  const AdminRights = (username, channel, action) => {
    if(getAdminStatus(me.username, channel) === " (Admin) ")
    {
      console.log("AdminRights: " + username);
      if(action === "MuteUser")
        socket.emit("Mute", {user_muted: username, chat: channel});
      else if (action === "BanUser")
        socket.emit("Ban", {user_banned: username, chat: channel});
      else if (action === "KickUser")
        socket.emit("Kick", {user_kicked: username, chat: channel});
      else if (action === "UnbanUser")
        socket.emit("Unban", {user_banned: username, chat: channel});

    }
  }

  const EnterPassword = (pwd) => {
    console.log("EnterPassword: begin")
    console.log("EnterPassword: " + selectedChannel.protected)
    if(selectedChannel.protected === pwd)
    {
      SetVerif('');
      // SetDisplay(true);
      selectedChannel.display = true;
      console.log("EnterPassword 1: " + displayChannel);
      return true;
    }
    SetVerif('');
    // SetDisplay(false);
    selectedChannel.display = false;
    console.log("EnterPassword 2: " + displayChannel);
    return false;
  }

  const UpdateSelectedChannel = (channelsList) => {
    if(selectedChannel)
    {
      console.log("UpdateSelectedChannel: begin")
      const update = channelsList.find((admin) => admin.chat_name === selectedChannel.chat_name);
      if(update)
      {
        console.log("UpdateSelectedChannel: update existe  = " + update);
        // SelectChannel(update);
        SetDisplay(update);
        selectedChannel.display = true;
        if(update.protected)
        {
          selectedChannel.display = false;
        }
        
      }
    }
  }

  const getBannedStatus = (username, channel) => {
    return channel.banned.some((admin) => admin.username === username) ? true : false;
  }


  const getAdminStatus = (username, channel) => {
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
        // SetDisplay(false);
      }
      else
      {
        channel.display = true;
        // SetDisplay('');
      }
    }
    else if(dm)
    {
      SelectChannel(null);
      SetDisplay(null);
      setActiveTab({ id: dm.userId, username: dm.username, status: dm.connected, avatar:"https://picsum.photos/id/200/300"});
    
    }
    else
    {
      setActiveTab('');
      SelectChannel(null);
      SetDisplay(null);
      // SetDisplay(true);
    }
  }

  const handleCheckboxChange = () => {
    // SetPwd(!password);
    SetChecked(!checked_pwd)// Toggle the value of password
  };

  const handlePasswordChange = (event) => {
    SetPwd(event.target.value);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
{/* <button className="big-button" onClick={findRoom}>PLAY</button> */}
  // <Modal onClose={() =>setshowModal(false)} show={showModal}><p>Waiting for another player</p></Modal>

    return (
      <div className="bodo">
          <Header/>
              
            <div className="containo">
              <div className="small-div">
                  Left Small Div
                  <div className="newconv">
                    <button className="custom_btn" onClick={() => NewConv('')}> +</button>
                    <CreateConv onClose={() => Join_rooms()} show={creatChatModal} title="New Chat">
                      <div className="create_chat">

                      <input 
                      type="text" 
                      placeholder="Name of the group" 
                      value={room} 
                      onChange={e => SetNewRoom(e.target.value)}
                      /> 
                    
                      </div>
                      <div className="create_chat">
                         <h5 style={{backgroundColor: "inherit", margin:"10px"}}> Protected Chat : </h5>
                      <label class="toggle-button">
                        
                        <input type="checkbox"
                        checked={checked_pwd} 
                        onChange={e => handleCheckboxChange(e.target.value)}
                        />
                        <span class="slider"></span>
                        </label>
                        {checked_pwd && (
                          <div className="create_chat">                            
                          <input className="input_chat"
                          type={showPassword ? 'text' : 'password'}
                          id="passwordInput"
                          placeholder="Enter your password"
                          value={password}
                          onChange={e => handlePasswordChange(e.target.value)}
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
              <div className="small-div-r">Right Small Div
              {activeTab && (

                <div className="new_who">
                  <div className="avatar-container">
                     <span className={`dot ${ activeTab.status === true ? 'online' : 'offline'}`}></span>
                   <img src={activeTab.avatar} alt="Avatar" />
                    </div>
                      
                        {activeTab.username}
                      
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
                      
                        <h2>
                        DM
                        </h2>
                          
                        <div className="tab">
                        <ul>
             {list.map((user) => (
              // Skip rendering the button for the current user
              user.username !== username && (
                <li key={user.userId}>
                <button
                  className={activeTab.username === user.username ? 'tablinks active' : 'tablinks'}
                  onClick={() => ConvSelected(false, user)}
                  // onClick={() => setActiveTab({ id: user.userId, username: user.username, status: user.connected, avatar:"https://picsum.photos/id/200/300"})}
               >
                   <div className="avatar-container">
                   <img src="https://picsum.photos/id/200/300" alt="Avatar" />
                     <span className={`dot ${ user.connected === true ? 'online' : 'offline'}`}></span>
                    </div>
                      <div className="username">{user.username}</div>
                </button>
              </li>
            )))}
          </ul>
                </div>
                <h3>Channels</h3>
                <div className="tab">
                <ul>
                  {channelsList.map((channel, index) => (
                      <li key={index}>
                  <button
                    className={selectedChannel === channel ? 'tablinks active' : 'tablinks'}
                    // onClick={() => SelectChannel(channel)}
                  onClick={() => ConvSelected(channel, false)}

                    > 
                    {channel.chat_name} 
                   </button>
                      </li>
                  ))}
                </ul>

           
                </div>


                      Last Div 1
                  </div>
                  <div className="last-div-r">
                  {/* {activeTab && ConvSelected(false, activeTab)}
                  {douille && BlockedUser(douille.username) && (
                    <p>You're Blocked by {douille.username}</p>
                  ) } */}

                  {activeTab && CanWeTalk(activeTab.username) &&(
                    <div className="div-r-sup">
                       
                        <div className="div-r-sup">
                          {conversations[activeTab.username]?.messages.map((message, index) => (

                            <div key={index} className="div-r-sup">
                            {message.who === username ? (
                              <>
                                <p className="sender__name">You</p>
                                <div className="message__sender">
                                  {message.content}
                                </div>
                              </>
                            ) : ( 
                              <>
                                <p className="receiver__name">{message.who}</p>
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

                        { activeTab && !StalkerUser(activeTab.username) && !BlockedUser(activeTab.username) && (<div className="chat_bar" style={{overflow: "auto", display: "flex", flexWrap: "nowrap"}}>
                     
                      <input className="foot" 
                      // style={{width : "80%"}}
                        type="text"
                        placeholder="Type msg"
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                        // onKeyDown={handleTyping}
                        />
                      <button onClick={() => handleSendMessage("pv", msg, activeTab.id, activeTab.username) }>
                        Send
                      </button>
                     
                      </div>)}

                      {selectedChannel && getBannedStatus(me.username, selectedChannel) && (
                        <p>You are banned from {selectedChannel.chat_name}</p>
                      )}

                      { selectedChannel  && !getBannedStatus(me.username, selectedChannel) && selectedChannel.protected &&
                      !selectedChannel.display && (
                       
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
                      
                      {selectedChannel && !getBannedStatus(me.username, selectedChannel) && selectedChannel.display &&
                         (
                    <div className="div-r-sup">
                        <div className="div-r-sup">
                          {conversations[selectedChannel.chat_name]?.messages.map((message, index) => (
                              
                                    <div key={index} className="div-r-sup">
                                    {  message.who === username ? (
                                      <>
                                      {getMutedStatus(message.who, selectedChannel) === "Non muted" &&  (
                                          <>
                                        <p className="sender__name">You</p>
                                        <div className="message__sender">
                                        {message.content}

                                        </div>
                                        </>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        {getMutedStatus(message.who, selectedChannel) === "Non muted" 
                                              && !StalkerUser(message.who) && !BlockedUser(message.who) && (
                                          <>
                                        <p className="receiver__name">{message.who}</p>
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
                          </div>
                          )}
                              
                        { selectedChannel &&  selectedChannel.display &&  (<div className="chat_bar" style={{overflow: "auto", display: "flex", flexWrap: "nowrap"}}>
                     
                      <input className="foot" style={{width : "80%"}}
                        type="text"
                        placeholder="Type msg"
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                        // onKeyDown={handleTyping}
                        />
                      <button className="custom_btn" onClick={() => handleSendMessage("channel", msg, selectedChannel.chat_name, selectedChannel.chat_name) }>
                        Send
                      </button>
                     
                      </div>)}
                  </div>

                  <div className="last-divi">
                            <div className="msg_pv">
                              Members
                              </div>  
                    <div className="tab">
                      
                    { selectedChannel && displayChannel &&  displayChannel.chat_name === selectedChannel.chat_name  && selectedChannel.display && (
                      <div className="selected-channel-users">
                        {/* <ul> */}
                          {displayChannel.users.map((user, index) => (
                              <li key={index}>
                            <button onClick={() => NewConv(user.username)}>
                                {user.username}
                                <span>
                                  {getAdminStatus(user.username, displayChannel)}
                                </span>  
                                <span>
                                  {getMutedStatus(user.username, displayChannel)}
                                </span>  
                            </button>
                                </li>
                          ))}
                          <div className="msg_pv">
                              Banned
                           {displayChannel.banned.map((user, index) => (
                             <div key={index}>
                            <button onClick={() => NewConv(user.username)}>
                                {user.username}
                            </button>
                                </div>
                          ))}
                          </div>
                            <CreateConv onClose={() =>setshowModal(false)} show={showModal} title={profile}>
                            <button onClick={() => BeAdmin(me.username, displayChannel)}>Watch game</button>
                            <button>Invite Friend</button>
                            <button>Invite Pong</button>
                            <button>Profile</button>
                            {getAdminStatus(me.username, displayChannel) === " (Admin) " && (
                              <div>
                                <button onClick={() => AdminRights(profile, displayChannel, "KickUser")}>Kick</button>
                                {(getMutedStatus(profile, displayChannel) === "Non muted") && (
                                  <>
                                    <button onClick={() => AdminRights(profile, displayChannel, "MuteUser")}>Mute</button>                            
                                  </>
                                )}
                                {!getBannedStatus(profile, displayChannel) ? (
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
                        {/* </ul> */}
                      </div>
                    )}
                </div>
                    
                    {selectedChannel && displayChannel &&  displayChannel.chat_name === selectedChannel.chat_name && selectedChannel.display && (

                      <div className="chat_bari">
                      <button className="conv_btn" onClick={() => LeaveChat(displayChannel)}>Leave</button>
                    </div>
                    )}
                    {/* {getAdminStatus(user.username, selectedChannel.admins)} */}


                    {activeTab && (
                      <div>
                        <div> 
                        <div className="avatar-container">
                            <span className={`dot ${ activeTab.status === true ? 'online' : 'offline'}`}></span>
                              <img src={activeTab.avatar} alt="Avatar" />
                            </div>
                            {activeTab.username}
                        </div>
                              <button>Show Profile</button>
                              <button>Invite Friend</button>
                              <br/>
                              <div >Watch game</div>
                              <br/>
                              <button className="conv_btn">Block User</button>
                      </div>  
                    )}
                   </div>
                  
          </div>
      </div>



    );
    }
    
export default BeginChat;