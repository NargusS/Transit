import React, { createContext, useContext } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children }) {

    // const url = 'http:' + localhost + ':4000';
    console.log('Ton host = ' + window.location.pathname);
    const URL = "http://" + window.location.hostname + ":4000";
    // const URL = "http://localhost:4000";
    const socket = io(URL, { autoConnect: false,});
    const username = localStorage.getItem("userName");
    if(username)
    {
      console.log("SocketProvider: c'est moi qui decide");
      socket.auth = { username };
      socket.connect();
    }
    if(window.location.pathname === "/profile"  || window.location.pathname === "/chat" || window.location.pathname === "/game")
    {
      console.log("ON te disconnect alors");
      socket.disconnect();
      //pour le chat peut etre faire des socket emit separer pour avoir toutes les sessions 
    }


  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
