import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import ChatBoxReceiver, { ChatBoxSender } from "./ChatBox";
// import jwt from 'jsonwebtoken'
// import Cookies from 'js-cookie'
import MessageInput from "./MessageInput";
import styled from "styled-components"


export default function ChatContainer(){
    const [chats, setChats] = useState([]) //stock all messages
    const [user, setUser] = useState(localStorage.getItem("user")) //get user login
    // const [avatar, setAvatar] = useState("") //get avatar
    const avatar = localStorage.getItem('avatar')

    // const GetCookie = Cookies.get("accessToken");
    const socketio = io("http://localhost:4000")
    // , {
    //   query: { accessToken: GetCookie },
    // });


    function handleSetUser(user){
        if(!user) return
        localStorage.setItem("user" , user)
        setUser(user)
        localStorage.setItem("avatar" ,`https://picsum.photos/id/200/300`)
    
    }

    //connect to socket
    // useEffect(()=> {
    //     socketio.on('setup', ({nickname, avati}) => {
    //         console.log('Received setup event:', { nickname, avati });
    //         setUser(nickname);
    //         setAvatar(avati);
    //     })
    //   });
    //receive an event known as Chat, this one will give us a Senderchats that contains all the messages inside a socket and this method is continually running

    useEffect(()=> {
        socketio.on('chat', senderChats => {
            setChats(senderChats)
        })
    })

    function sendChatToSocket(chat){
        socketio.emit('chat', chat);
    }
    //Sendung content of a conversation to who is connecting on this chat event

    
    function addMessage(chat)
    {
        const newChat = {...chat, user, avatar} //a chat consist to all msg, user and avatar
        setChats([...chats, newChat]) //everything inside of chats converted to the newChat so a newchat updated
        sendChatToSocket([...chats, newChat]) //send the new chat to the socket 
    }
    //Take a msg and add it to our chat 

    function ChatList(){
        return( <div style={{ height:'75vh' , overflow:'scroll' , overflowX:'hidden' }}>
              {
                 chats.map((chat, index) => {
                  if(chat.user === user) return <ChatBoxSender  key={index} message={chat.message} avatar={chat.avatar} user={chat.user} />
                  return <ChatBoxReceiver key={index} message={chat.message} avatar={chat.avatar} user={chat.user} />
              })
              }
        </div>)
    }


    const[value, setValue] = useState("")

    const Container = styled.div`
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background-color: #131324;
        .container{
            height: 85vh;
            width: 85vw;
            background-color: #00000076;
            display: grid;
            grid-template-columns: 25% 75%;
            @media screen and (min-width: 720px) and (max-width: 1080px) {
               grid-template-columns: 35% 65%;
            }
        }
    
    `




    return(
            <Container>

        <div>

             <input   onChange={(e) => setValue(e.target.value)} placeholder="Type your nickname..." value={value} />
             <button onClick={()=> handleSetUser(value)}>Send</button>
            <ChatList/>
                <MessageInput addMessage={addMessage} />
        </div>
            </Container>
           
    )
}