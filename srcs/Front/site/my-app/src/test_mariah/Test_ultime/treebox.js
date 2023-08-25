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
    const [activeTab, setActiveTab] = useState({});
    const [msg, setMsg] = useState('');
    const [conversations, setConversations] = useState([{}]);
    const [exit_gate, setGate] = useState(false);
    const [filteredItems, setFilteredItems] = useState([]);
    const [showModal, setshowModal] = useState(false);
    const [rooms_list, SetRoomList] = useState([]);
    

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
        type = "room";
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
      }
    };
        const username  = localStorage.getItem('userName');
        const avatar = localStorage.getItem('avatar');
    useEffect(() => {
      socket.auth = { username };
      socket.connect();

      socket.on('session', ({ userId, sessionId }) => {
        setUser(userId);
        console.log('sessionId = ' + sessionId);
      });
      socket.on('users', (users) => {
        // for (let i = 0; i < users.length; i++) {
        //   list.push(users[i]);
        //   console.log(list[i].connected);
        // }
        setList(users);
      });

      socket.on("rooms_list", (list_room) => {
        SetRoomList(list_room);
      })

      socket.on('private message', (message) =>
      {
        console.log("On est dans pv le ssang")
        StockMessages("pv", {who: message.from_username, content:message.content}, 
        message.from_username, "" );
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
    }, [socket, list, username]);

    const Join_rooms = () => {
      console.log('Lets create a group');
      console.log(room);
      socket.emit('group_chat', { rooms_name: room, content: 'Welcome le Sang' });

      SetNewRoom('');
    };

    // socket.on('Opponent_found', (message) => {
    //   console.log(message);
    //   if (message.player1 === username)
    //     console.log('Je suis le player 1');
    //   else
    //     console.log('Je suis le player2');
    //   console.log(`La room est ${message.room_name}`);
    // });

    const Onsearch = (searchString) => {
      const filter = searchString.toUpperCase();
      const filteredList = list.filter((item) =>
      {
          item.username.toUpperCase().includes(filter)
      }
      );
      setFilteredItems(filteredList);
    };

  const handleSearchChange = (event) => {
    const searchString = event.target.value;
    Onsearch(searchString);
  };

  const onSubmit = () => {
    setMsg("");
  };

  const NewConv = () => {
    setshowModal(true);
  }

{/* <button className="big-button" onClick={findRoom}>PLAY</button> */}
  // <Modal onClose={() =>setshowModal(false)} show={showModal}><p>Waiting for another player</p></Modal>

    return (
      // <div>
      //   <div className="header_chatbar">Chat List
      //     <button className="newconv">New conv</button>
      //   </div>
      //   <div className="header_content">Chat Conversation</div>
      //   <div className="tab">
      //     <h2>Users List</h2>
      //     <ul>
      //       {list.map((user) => (
      //         // Skip rendering the button for the current user
      //         user.username !== username && (
      //           <li key={user.userId}>
      //           <button
      //             className={activeTab.username === user.username ? 'tablinks active' : 'tablinks'}
      //             onClick={() => setActiveTab({ id: user.userId, username: user.username })}
      //           >
      //              {user.username}CreateConv
      //           </button>
      //         </li>
      //       )))}
      //     </ul>
      //   </div>
      //   {activeTab && activeTab.username !== username && (
      //     <div className="tabcontent">
      //       <h3>{activeTab.username}</h3>
      //       <div>
      //         {conversations[activeTab.username]?.messages.map((message, index) => (

      //           <div key={index} className="message__chats">
      //           {message.who === username ? (
      //             <>
      //               <p className="sender__name">You</p>
      //               <div className="message__sender">
      //                 <p>{message.content}</p>
      //               </div>
      //             </>
      //           ) : (
      //             <>
      //               <p>{message.who}</p>
      //               <div className="message__recipient">
      //                 <p>{message.content}</p>
      //               </div>
      //             </>
      //           )}
      //           </div>
      //         ))}
      //       </div>
      //       <footer className="chat__footer">
      //       <input
      //         type="text"
      //         placeholder="Type msg"
      //         value={msg}
      //         onChange={e => setMsg(e.target.value)}
      //         // onKeyDown={handleTyping}
      //         />
      //       <button className="sendBtn"  onClick={() => handleSendMessage("pv", msg, activeTab.id, activeTab.username)}>
      //         Join the Party
      //       </button>
      //         </footer>
      //       {/* <h3>London</h3>
      //       <p>London is the capital city of England.</p> */}
      //     </div>
      //   )}
      // </div>

      <div className="bodo">
          <Header/>

            <div className="containo">
              <div className="small-div">
                  Left Small Div
                  <div className="new_convi">
                    <button className="custom_btn" onClick={NewConv}> +</button>
                    <CreateConv onClose={() =>setshowModal(false)} show={showModal}>
                      <h3>Create new chat</h3>
                      
                      <input 
                      type="text" 
                      placeholder="Name of the group" 
                      value={room} 
                      onChange={e => SetNewRoom(e.target.value)}
                      // onKeyDown={handleTyping}
                      /> 
                      <button className="custom" style={{float: 'right'}} onClick={Join_rooms}>
                        Join the Party
                      </button>



                      {/* <input className="search__bar"
                        type="text"
                        placeholder="Search..."
                        onChange={handleSearchChange}
                      />
                      <div>
                        {filteredItems.map((item, index) => (
                          <ul key={item.userId}>{item.username}</ul>
                        ))}
                      </div> */}
                      </CreateConv>
                      
                  </div>

              </div>
              <div className="small-div-r">Right Small Div

                  <div className="new_who">
                  <div className="avatar-container">
                     <span className={`dot ${ activeTab.status === true ? 'online' : 'offline'}`}></span>
                   <span> <img src={activeTab.avatar} alt="Avatar" /></span>
                    </div>
                      <h4>{activeTab.username}</h4>
                      </div>

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
                  onClick={() => setActiveTab({ id: user.userId, username: user.username, status: user.connected, avatar:"https://picsum.photos/id/200/300"})}
                >
                   <div className="avatar-container">
                   <img src="https://picsum.photos/id/200/300" alt="Avatar" />
                     <span className={`dot ${ user.connected === true ? 'online' : 'offline'}`}></span>
                    </div>
                      <h4>{user.username}</h4>
                </button>
              </li>
            )))}
          </ul>
                </div>
                <h3>Channels</h3>
                <div className="tab">
                <ul>
                {rooms_list.map((name_room) => (
          // Skip rendering the button for the current user
                  (
                  <li key={name_room}>
                    <button
                      className={activeTab === name_room ? 'tablinks active' : 'tablinks'}
                      onClick={() => setActiveTab({id: name_room, username: name_room})}
                    >
                      {name_room}
                    </button>
                  </li>
                  )
                     ))}
           </ul>

                </div>


                      Last Div 1
                  </div>
                  <div className="last-div-r">Last Div 2
                  
                  {activeTab && activeTab.username !== username && (
                    <div>
                       
                        <div>
                          {conversations[activeTab.username]?.messages.map((message, index) => (

                            <div key={index} className="message__chats">
                            {message.who === username ? (
                              <>
                                <p className="sender__name">You</p>
                                <div className="message__sender">
                                  <p>{message.content}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <p>{message.who}</p>
                                <div className="message__recipient">
                                  <p>{message.content}</p>
                                </div>
                              </>
                            )}
                            </div>
                          ))}
                          </div>
                          </div>
                          )}

               

                        { activeTab.username && (<div className="chat_bar" style={{overflow: "auto", display: "flex", flexWrap: "nowrap"}}>
                     
                      <input className="foot" style={{width : "80%"}}
                        type="text"
                        placeholder="Type msg"
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                        // onKeyDown={handleTyping}
                        />
                      <button className="custom_btn" style={{float: 'right'}} onClick={() => handleSendMessage("pv", msg, activeTab.id, activeTab.username) }>
                        Send
                      </button>
                     
                      </div>)}
                  </div>
          </div>
      </div>



    );
    }
    
export default BeginChat;