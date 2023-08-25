import { useEffect, useState} from "react";

const BeginChat = ({socket, username}) => {
    const [me, setUser] = useState('')
    const [channelsList, setChannelsList] = useState([]);
    const [list_users, setUserList] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.on('session', ({user_info}) => {
            setUser(user_info);
        })

        socket.on("rooms_list", (channels_list) => {
            setChatRooms(channels_list);
        })

        socket.on("user", (sessions) => {
            setUserList(sessions);
        })

        socket.on('private message', (message) => {
            // Only update messages if the message is for the selected room
            if (selectedRoom && selectedRoom === message.name_chat) {
              setMessages((prevMessages) => [...prevMessages, message]);
            }
          });

        socket.on('messageFromRoom', (message) => {
          if (selectedRoom && selectedRoom === message.name_chat) {
              setMessages((prevMessages) => [...prevMessages, message]);
            }
        });



        return () => {
            socket.off('user disconnected');
            socket.off('session');
            socket.off('private message');
            socket.off('users');
            socket.off('rooms_list');
            socket.off('messageFromRoom');
          };
        }, [selectedRoom, chatRooms, socket]);


        const handleRoomSelection = (roomName) => {
            setSelectedRoom(roomName);
            setMessages([]); // Clear existing messages when changing rooms
          };

          return (
            <div>
              <h1>Chat Rooms</h1>
              <ul>
                {chatRooms.map((room) => (
                  <li key={room.chat_name}>
                    <button onClick={() => handleRoomSelection(room.chat_name)}>
                      {room.chat_name}
                    </button>
                  </li>
                ))}
              </ul>
        
              {selectedRoom && (
                <div>
                  <h2>Selected Room: {selectedRoom}</h2>
                  <div className="messages">
                    {messages.map((message, index) => (
                      <div key={index} className="message">
                        <p>{message.content}</p>
                        <span>{message.from}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );

}

export default BeginChat;