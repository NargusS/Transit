import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import SelectUsername from "./SelectUsername";
import Chat from "./Chati";
import socket from "./socket";
import './doc.css'

const Appi = () => {
  const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(false);

  const onUsernameSelection = (username) => {
    setUsernameAlreadySelected(true);
    // localStorage.setItem('username', username);
    // const usernam = localStorage.getItem("username");
    // console.log(usernam);
    // console.log("on est dans APpi le sang")
    socket.auth = { username };
    socket.connect();
  };

  useEffect(() => {
    const sessionID = localStorage.getItem("sessionID");

    if (sessionID) {
      setUsernameAlreadySelected(true);
      socket.auth = { sessionID };
      socket.connect();
    }

    socket.on("session", ({ sessionID, userID }) => {
      socket.auth = { sessionID };
      localStorage.setItem("sessionID", sessionID);
      socket.userID = userID;
    });

    socket.on("connect_error", (err) => {
      if (err.message === "invalid username") {
        setUsernameAlreadySelected(false);
      }
    });

    return () => {
      socket.off("connect_error");
    };
  }, []);

  return (
    <div id="appi">
      {!usernameAlreadySelected ? (
        <SelectUsername onInput={onUsernameSelection} />
      ) : (
        <Chat socket={socket} />
      )}
    </div>
  );
};

export default Appi;
