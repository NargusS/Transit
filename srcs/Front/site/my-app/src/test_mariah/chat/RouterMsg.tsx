// import React, { useEffect, useState } from "react";

// // import Messages from "./Messages";
// // import MessageInput from "./MessageInput";
// import { Socket, io } from "socket.io-client";
// import Cookies from 'js-cookie'
// // import axios from 'axios'
// // import ChatBoxReceiver, { ChatBoxSender } from "./ChatBox";
// // import ChatContainer from "./ChatContainer";

// function RouterMsg() {
//   //   const[ socket, setSocket] = useState<Socket>()

//   //   const[messages, setMessages] = useState<string[]>([])
//   //   // const [messages, setMessages] = useState<{ nickname?: string; message: string }[]>([]);


//   //   const [error, setError] = useState<string | null>(null);
//   //   const send = (value: string) =>{
//   //       socket?.emit("message", value)
//   //   }
//   //   // const accessToken = Cookies.get('accessToken');
//   //   // console.log(accessToken); 
    
//   //   // Usage
//   //   //   const accessToken = getCookieValue('accessToken');
//   //   //   console.log(accessToken);

    
//   //   // useEffect(() => {
//   //   //     const GetCookie = Cookies.get("accessToken");
//   //   //     const newSocket = io("http://localhost:4000", {
//   //   //         query: { accessToken: GetCookie },
//   //   //       });
//   //   //     setSocket(newSocket);
//   //   // }, [setSocket])

//   //   // const messageListener = (message : string) => {
//   //   //     setMessages([...messages, message])
//   //   // }

//   //   // useEffect(() => {
//   //   //     socket?.on("message", messageListener)
//   //   //     return() => {
//   //   //         socket?.off("message", messageListener)}
//   //   // }, [messageListener])


//   //   useEffect(() => {
//   //       const getSocket = async () => {
//   //         try {
//   //           const accessToken = Cookies.get("accessToken");
//   //           const newSocket = io("http://localhost:4000", {
//   //             query: { accessToken },
//   //           });
//   //           setSocket(newSocket);
//   //           setError(null);
//   //         } catch (error) {
//   //           setError("Failed to connect to the WebSocket server.");
//   //         }
//   //       };
    
//   //       getSocket();
    
//   //       return () => {
//   //         socket?.disconnect();
//   //       };
//   //     }, []);
    
   
//   // useEffect(() => {
//   //   if (socket) {
//   //       const messageListener = (message: { nickname?: string; message: string }) => {
//   //           const { nickname, message: msg } = message;
//   //           const formattedMessage = {
//   //             nickname: nickname ? nickname : '', // Assign an empty string if nickname is undefined
//   //             message: msg,
//   //           };
//   //           setMessages((prevMessages) => [...prevMessages, formattedMessage]);
//   //         };
//   //     const exceptionListener = (exception: string) => {
//   //         setError(exception);
//   //         socket.disconnect();
//   //       //   const ax = axios.create({
//   //       //       baseURL: 'http://localhost:4000',
//   //       //       withCredentials: true,
//   //       //     });
//   //       //   ax.post('/auth/refresh'


//         // fetch('http://localhost:4000/auth/refresh', {
//         //     method: 'Post',
           
//         //     credentials: 'include', // Include cookies
//         // }) .then(response => {
//   //           if (!response.ok) {
//   //             throw new Error('Network response was not OK');
//   //           }
//   //           console.log(response)
//   //           // Access the cookie from the response headers
//   //           const cookies = response.headers.get('Set-Cookie');
//   //           // Parse the JSON response body
//   //           return response.json().then(data => ({ cookies, data }));
//   //         })
//   //         .then(({ cookies, data }) => {
//   //           // Do something with the cookies and data
//   //           console.log('Cookies:', cookies);
//   //           console.log('Response data:', data);
//   //         })
//   //         .catch(error => {
//   //           // Handle any errors
//   //           console.error('Error:', error);
//   //         });
//   //   };
    
//   //   socket.on("message", messageListener);
//   //   socket.on("exception", exceptionListener);
    
//   //   return () => {
//   //       socket.off("message", messageListener);
//   //       socket.off("exception", exceptionListener);
//   //     };
//   //   }

    
//   // }, [socket]);


//   //   return (
//   //       <>
//   //          {error && <p>Error: {error}</p>}
//   //           <MessageInput send={send}/>
//   //           <Messages messages={messages} />
//   //       </>
//   //   )

//     // function RouterMsg() {
//       const[ socket, setSocket] = useState<Socket>()
  
//       const[messages, setMessages] = useState<string[]>([])
  
//       const send = (value: string) =>{
//           socket?.emit("message", value)
//       }
  
//       useEffect(() => {
//         const GetCookie = Cookies.get("accessToken");
//         const newSocket = io("http://localhost:4000", {
//             query: { accessToken: GetCookie },
//           });
//         setSocket(newSocket);
//       }, [setSocket])
  
//       const messageListener = (message : string) => {
//           setMessages([...messages, message])
//       }
  
//       useEffect(() => {
//           socket?.on("message", messageListener)
//           return() => {
//               socket?.off("message", messageListener)}
//       }, [messageListener])
  
//       return (
//           <>
//               {" "}
//               {/* <Messages messages={messages} /> */}
//               {/* <ChatBoxReceiver  user='test1' avatar="https://picsum.photos/200/300" message={messages}/>
//               <ChatBoxSender user='lesang' avatar="https://picsum.photos/200/300" message={messages} />
//               <MessageInput send={send}/> */}
//           </>
//       )

// }
// export default RouterMsg;