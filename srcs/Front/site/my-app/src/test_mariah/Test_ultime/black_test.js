import { useEffect, useState} from "react";
// import io from "socket.io-client";
// import './all.css'
// import './test.css'
import './w3school.css'
import Header from '../../Header';
import CreateConv from "./CreateConv";
import { useSocket } from '../../SocketContext'; 
import {useNavigate} from 'react-router-dom';



const BeginChat = () => {
  const socket = useSocket();
    const [list_msg, setContent] = useState([]);
    // const [isOnline, setIsOnline] = useState(false);
    // const [conv, setConversation] = useState({});
    // const [chat, SetChat] = useState
    // const [username, setUsername] = useState('');
    const [me, setUser] = useState('');
    const [list, setList] = useState([]);
    const [room, SetNewRoom] = useState('');
    const [type_chan, SetTypeChan] = useState('');
    const [activeTab, setActiveTab] = useState('');
    const [dm, setActualDm] = useState('');
    const [selectedChannel, SelectChannel] = useState(null);
    const [msg, setMsg] = useState('');
    const [conversations, setConversations] = useState([{}]);
    const [exit_gate, setGate] = useState(false);
    const [filteredItems, setFilteredItems] = useState([]);
    const [showModal, setshowModal] = useState(false);
    const [creatChatModal, setShowModalCreateChat] = useState(false);
    const [rooms_list, SetRoomList] = useState([]);
    const [channelsList, setChannelsList] = useState([]);
    const [profile, setProfileSelected] = useState({});
    const [douille, setDouille] = useState(true);
    const [password, SetPwd] = useState('');
    const [verif, SetVerif] = useState('');
    const [checked_pwd, SetChecked] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [displayChannel, SetDisplay] = useState(null);
    const [list_act, setListActual] = useState([]);
    const [montre, SetMontre] = useState([]);
    const [block, setBlock] = useState([]);
    const [stalk, setStalk] = useState([]);

    const navigate = useNavigate();

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
                StockMessages(type, {who: username, content:message}, to_username, "");
              } else {
                socket.emit('group_chat', {
                  rooms_name: to,
                  content: message,
                });
                console.log("handleMessage: display =" + selectedChannel.display);
                // UpdateSelectedChannel(channelsList);
              }
              //   console.log("(SelectedChannel pb) Ton channel est = " + selectedChannel.chat_name);
              setMsg('');
            };
            // const username  = localStorage.getItem('userName');
            // const avatar = localStorage.getItem('avatar');
            const Connection = () =>
            {
              // setDouille(false);
            }
            
            
            // console.log("Ton username = " + username);
            // socket.auth = { username };
            // if(username)
            //   socket.connect();
            const username = localStorage.getItem('userName');
            if(username)
            {
              console.log("CHAT: c'est moi qui decide");
              socket.auth = {username};
              // socket.disconnect();
              socket.connect();
              if(!me){
                console.log("je dois passer une fois")
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
        // for (let i = 0; i < users.length; i++) {
        //   list.push(users[i]);
        //   // console.log(list[i].connected);
        // }
        console.log("Users = " + users)
        setList(users);
        if(activeTab)
        {
          console.log("activeTAb username = " + activeTab.username);
          const active = users.find((element) => element.userId === activeTab.id)
          if(active)
          {
            console.log("On est active")
            setActiveTab({id: active.userId, username: active.username, status: active.connected, avatar: active.user.avatar})
          }
        }
        // users.find("") Je cherche ActiveTab;
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
        console.log("actual dm")
        // if(activeTab)
        // {
          // console.log("T'as bien recu ton chat :" + chat.message);
          setActualDm(chat);
        // }
      })


      //SelectedChannel se mets pas a jour instantanement
      socket.on("IsProtected", (test) => {
        console.log("on est dans isprotected");
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
        StockMessages("room", {who: message.from, content: message.content}, message.to, "");
        // setContent(prevState => [...prevState, message])
      });

      socket.on('group_chat_rep', (rep) => {
        console.log(rep);
      });
      socket.on('user disconnected', (userId) => {
        list.find((user) => user.userId === userId).connected = false;
        console.log(`${userId} is disconnected`);
        // socket.disconnect();
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
    }, [socket, list, username, channelsList, displayChannel, dm, list_act]);

    
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
            console.log("no ennemies")
            
            // setRes(data)
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



  // const handleSearchChange = (event) => {
  //   const searchString = event.target.value;
  //   Onsearch(searchString);
  // };

  const onSubmit = () => {
    setMsg("");
  };

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
    // if(opponent.connected === "online")
    // {
      setshowModal(false);
      console.log("opponent = " + opponent);
      socket.emit("InviteToGame", {opponent: opponent});
      // socket.on("GameAccepted", () => {
      //   console.log("Game accepté pureeeee");
      //   navigate('/game');
      //   // setTimer(0);
      //   // setDisplay(true);
      //   // setInvitor('');
      //   // setAccepted(true);
      // })
    // }
  }


  const BeAdmin = (username, channel) => {
    // if(getAdminStatus(me.username, channel) === " (Admin) " || channel.owner_group_chat === me.username)
    // {
      socket.emit("Admin", {new_admin: username, chat: channel});
    // }
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
      // setRes(data)
    })
  }


  const BlockedUser = (username) => {

    // if(me.user.blacklist.some((admin) => admin.blockerId === me.username) && 
    //       me.user.blocklist.some((admin) => admin.blockerId === username))
    //       return true;
    
    // if(me.user.blacklist)
    // {
    //   console.log("je check si tu es bloqy1")
    console.log("me = " + me);
      return block.some((admin) => admin.blockerId === username) ? true : false;
  }

  const StalkerUser = (username) => {
    // console.log("StalkerUser " + username);
    
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
    console.log("EnterPassword: begin")
    console.log("EnterPassword: " + selectedChannel.protected)
    socket.emit("protected_channel", {
      mdp: pwd,
      channel: selectedChannel,
    });
    SetVerif('');
    // if(selectedChannel.protected === pwd)
    // {
    //   // SetDisplay(true);
    //   selectedChannel.display = true;
    // //   console.log("EnterPassword 1: " + displayChannel);
    //   return true;
    // }
    // SetVerif('');
    // // SetDisplay(false);
    // selectedChannel.display = false;
    // // console.log("EnterPassword 2: " + displayChannel);
    // return false;
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
        if(!update.protected)
        {
          SetMontre(true);
        }
        else
        {
          SetMontre(false);

        }
        // selectedChannel.display = true;
        // if(update.protected)
        // {
        //     console.log("UpdateSelectedChannel: protected true");
        //   selectedChannel.display = false;
        // }
        
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
      // console.log("Message = "+ channel.message)
      setActiveTab('');
      SelectChannel(channel);
      SetDisplay(channel);
      if(channel.protected)
      {
        channel.display = false;
        SetMontre(false);
        // SetDisplay(false);
      }
      else
      {
        channel.display = true;
        SetMontre(true);
        // SetDisplay('');
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
      // SetDisplay(true);
    }
  }

 const AreYouUpdated = () => {
  if(selectedChannel === displayChannel)
  {
    console.log("Selected === display");
    return selectedChannel;
  }  
  else
  {
    const found = displayChannel.find((channel) => channel.chat_name === selectedChannel.chat_name);
    console.log(found);
    return found;
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
      // <div>
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
                                {/* <span className={`dot ${ activeTab.status === "offline" ? 'offline' : (activeTab.status === 'online' ? "online" : "ingame")}`}></span> */}
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
                    // onClick={() => SelectChannel(channel)}
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
                          {/* {conversations[activeTab.username]?.messages.map((message, index) => (
                            

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
                          ))} */}
                          </div>
                    </div>
                  )}

               {activeTab && CanWeTalk(activeTab.username)}

        { activeTab && !StalkerUser(activeTab.username) && !BlockedUser(activeTab.username) && (
                <div>
                  <div className="chat_bar" style={{position: "fixed",  flexWrap: "nowrap"}}>
                      <input className="foot" 
                      // style={{width : "80%",}}
                        type="text"
                        placeholder="Type msg"
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                        // onKeyDown={handleTyping}
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
                      // <div className="tabi">
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
                          {/* {conversations[selectedChannel.chat_name]?.messages.map((message, index) => (
                              
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

                          ))} */}
                          </div>
                          // </div>
                          )}
                              
                        { selectedChannel &&  selectedChannel.display && displayChannel &&  displayChannel.chat_name === selectedChannel.chat_name 
                         && getMutedStatus(me.username, displayChannel) === "Non muted"  &&!getBannedStatus(me.username, displayChannel) && (
                         <div className="chat_bar" style={{position: "fixed",  flexWrap: "nowrap"}}>
                         {/* style={{display: "flex", flexWrap: "nowrap"}} */}
                     
                      <input className="foot" 
                      // style={{width : "80%"}}
                        type="text"
                        placeholder="Type msg"
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                        // onKeyDown={handleTyping}
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
                    {/* {getAdminStatus(user.username, selectedChannel.admins)} */}


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
                              {/* <br/> */}
                              {
                                activeTab.status === 'ingame' ? 
                                <div >Watch game</div>  : (activeTab.status === 'online' ? <button onClick={() => InviteGame(activeTab.username)}>Invite Game</button> : <></>) 
                              }
                              {/* Watch game ou invite game */}
                              {/* <br/> */}
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
      // </div>


    );
    }
    
export default BeginChat;