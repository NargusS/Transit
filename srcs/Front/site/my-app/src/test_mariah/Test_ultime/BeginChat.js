import { useEffect, useState} from "react";
// import io from "socket.io-client";
// import './all.css'
// import './test.css'
import './w3school.css'


const BeginChatO = ({socket}) => {
    
   
  const [list_msg, setContent] = useState([]);
  // const [isOnline, setIsOnline] = useState(false);
  // const [conv, setConversation] = useState({});
  // const [chat, SetChat] = useState

        const [me, setUser] = useState('');
        const [list, setList] = useState([]);
        const [room, SetNewRoom] = useState(''); 
        const [activeTab, setActiveTab] = useState({});

        const [msg, setMsg] = useState('');
        const [conversations, setConversations] = useState([{}]);


       function stockMessages(type, message, receiver, mdp)
        {
          if (!conversations[receiver]) {
            // If it doesn't exist, create a new conversation object
            setConversations((prevConversations) => ({
              ...prevConversations,
              [receiver]: { // Name of the conversation (here, it's the same as the receiver's username)
                type: type, // Type of conversation (e.g., 'group' or 'private')
                password: mdp, // Password for the conversation (you can set it as needed)
                messages: [], // Array to store messages for this conversation
              },
            }));
          }
      
          // Update the messages for the receiver in the conversations map
          setConversations((prevConversations) => ({
            ...prevConversations,
            [receiver]: {
              ...prevConversations[receiver],
              messages: [...prevConversations[receiver].messages, message],
            },
          }));
      
          // Clear the input field after sending the message
          setMsg('');
        };
  
        function handleSendMessage (type, message, to, to_username,)
        {

          if(type === 'pv')
          {
            socket.emit('private message', {
              to: to,
              to_username: to_username,
            });
          }
          else
          {
            socket.emit('group_chat', 
            {
              room_name: to,
              content: message,
            })
          }
          stockMessages(type, message, to, to_username);
        };
       
        
        // useEffect(() => {
            const username = localStorage.getItem('userName');
            const avatar = localStorage.getItem('avatar');
            socket.auth = {username};
            socket.connect();

            socket.on("private message", (message) => {
            console.log("On est dans private la")
                // list_msg.push(message);
                console.log(message.content);
                stockMessages("pv", message.content, message.to_username, '');
                // setContent(prevState => [...prevState, message])
                // console.log(list_msg);
            })
            
        useEffect(() => {
            socket.on('session', ({userId, sessionId}) => {
                setUser(userId);
                console.log("sessionId = " + sessionId);
            });

            socket.on('users', (users) => {
                for (let i = 0; i < users.length; i++) {
                    list.push(users[i]);
                    console.log(list[i].connected)
                }
                setList(users);
            })
            
            socket.on("group_chat_rep", (rep) =>{
                console.log(rep);
            })

            socket.on("messageFromRoom", (message) => {
                console.log(message.content);
                // setContent(prevState => [...prevState, message])
                
            })
            
            socket.on("user disconnected", (userId) =>
            {
                console.log(`${userId} is disconnected`)
                // socket.disconnect()
            })

            // return () => {
                //     socket.off('session');
                //     socket.off('private message');
                //     socket.off('users');
                // };
            }, [socket, list]);
            // }, [socket] ); 
            
            // for (let i = 0; i < list.length; i++) {
                //     if(list[i].userId !== me)
                //     {
                    //         socket.emit("private message", {
                        //             content: `Call from ${username}`,
                        //             to: list[i].userId,
                        //         });
                        //     }
                        // }
        const Join_rooms = () =>{
            console.log('Lets create a group')
            console.log(room)
            if(room ===  "play")
            socket.emit("waiting_player");
            else
            socket.emit("group_chat", {rooms_name: room, content:"Welcome le Sang"});
            
            // SetNewRoom('');
        }
        
        // socket.on("Opponent_found", (message) => {
        //     console.log(message);
        //     if(message.player1 === username)
        //         console.log('Je suis le player 1')
        //     else
        //         console.log("Je suis le player2")
        //     console.log(`La room est ${message.room_name}`);
        // });
                        
        return(
          <div>
            <div className="header_chatbar">Chat List
               <button className="newconv">New conv</button>
            </div>
            <div className="header_content">Chat Conversation</div>
            <div className="tab">
              <h2>Users List</h2>
               <ul>
                {list.map((user) => (
                  // Skip rendering the button for the current user
                  user.username !== username && (
                    <li key={user.id}>
                      <button
                        className={activeTab.username === user.username ? 'tablinks active' : 'tablinks'}
                        onClick={() => setActiveTab({id: user.id, username: user.username})}
                      >
                        {user.username}
                      </button>
                    </li>
                  )
                ))}
              </ul>
            </div>
            {activeTab && activeTab.username !== username && (
            <div className="tabcontent">
              <h3>{activeTab.username}</h3>
          <ul>
            {conversations[activeTab.username]?.messages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
              <input 
                type="text" 
                placeholder="Type msg" 
                value={msg} 
                onChange={e => setMsg(e.target.value)}
                // onKeyDown={handleTyping}
                />  
                <button onClick={handleSendMessage("pv", msg, activeTab.userId, activeTab.username)}>Join the Party </button>
              {/* <h3>London</h3>
              <p>London is the capital city of England.</p> */}
            </div>
          )}
        </div>
        );              
                        
                        
    // return(
    //     // list.map(list),
    //     <div>

    //         <div className="header_chatbar">Chat List
    //         <button className="newconv">New conv</button>
    //         </div>
    //         <div className="header_content">Chat Conversation</div>
    //     <div className="tab">
    //     <button{
    //       className={activeTab === 'London' ? 'tablinks active' : 'tablinks'}
    //       onClick={() => setActiveTab('London')}
    //     >
    //         <div className="avatar-container">
    //         <img src="https://picsum.photos/id/200/300" alt="Avatar" />
    //         <span className={`dot ${isOnline ? 'online' : 'offline'}`}></span>
    //         <span class="username">London</span>
    //         </div>
    //     </button>
    //     <button
    //       className={activeTab === 'Paris' ? 'tablinks active' : 'tablinks'}
    //       onClick={() => setActiveTab('Paris')}
    //     >
    //       Paris
    //     </button>
    //     <button
    //       className={activeTab === 'Tokyo' ? 'tablinks active' : 'tablinks'}
    //       onClick={() => setActiveTab('Tokyo')}
    //     >
    //       Tokyo
    //     </button>
    //   </div>

    //   {activeTab === 'London' && (
    //     <div id="London" className="tabcontent">
    //       <h3>London</h3>
    //       <p>London is the capital city of England.</p>
    //     </div>
    //   )}

    //   {activeTab === 'Paris' && (
    //     <div id="Paris" className="tabcontent">
    //       <h3>Paris</h3>
    //       <p>Paris is the capital of France.</p>
    //     </div>
    //   )}

    //   {activeTab === 'Tokyo' && (
    //     <div id="Tokyo" className="tabcontent">
    //       <h3>Tokyo</h3>
    //       <p>Tokyo is the capital of Japan.</p>
    //     </div>
    //   )}

    //     {(!activeTab || activeTab === '') && (
    //       <div className="notselected">
    //         <p>Please select a chat conversation.</p>
    //       </div>
    //     )}
    //              {/* <div className="left"> 
    //         <div className="nav"> 
    //         Left le Sang
    //         </div>
    //         <div className="chat_container">
    //             <div className="user_avatar">Renji</div>
    //             <div className="chat_list">BONJOUR</div>
    //         </div>
    //         </div>
    //         <div className="center"> Center le Sang</div> */}
    //         {/* BONJOUR
    //         <h1>I am {me}</h1>
    //         {list.map((user) => (
    //             <h1 key={user.userId}>{user.username}  {user.connected ? "online" : "offline"}</h1>
    //             ))}
        
    //     {list_msg.map((user) => (
    //         <h1 >{user.from} = {user.content} </h1>
    //       ))}     
        
    //     <div>
    //         <label>
    //             Create Room
    //         <input 
    //         type="text" 
    //         placeholder="Name of the group" 
    //         value={room} 
    //         onChange={e => SetNewRoom(e.target.value)}
    //         // onKeyDown={handleTyping}
    //         />  
    //         <button onClick={Join_rooms}>Join the Party </button>
    //         </label>
            
           
    //     </div> */}

    //     </div>
            
    // )


    
}

export default BeginChatO;