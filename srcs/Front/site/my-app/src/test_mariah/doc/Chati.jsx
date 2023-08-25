import React, { useState, useEffect } from "react";
import socket from "./socket";
import User from "./User";
import MessagePanel from "./MessagePanel";
import './doc.css'

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  const onMessage = (content) => {
    if (selectedUser) {
      socket.emit("private message", {
        content,
        to: selectedUser.userID,
      });
      setSelectedUser((prevSelectedUser) => ({
        ...prevSelectedUser,
        messages: [
          ...prevSelectedUser.messages,
          { content, fromSelf: true },
        ],
      }));
    }
  };

  const onSelectUser = (user) => {
    setSelectedUser(user);
    user.hasNewMessages = false;
  };

  useEffect(() => {
    socket.on("connect", () => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.self ? { ...user, connected: true } : user
        )
      );
    });

    socket.on("disconnect", () => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.self ? { ...user, connected: false } : user
        )
      );
    });

    const initReactiveProperties = (user) => {
      user.hasNewMessages = false;
    };

    socket.on("users", (fetchedUsers) => {
      fetchedUsers.forEach((user) => {
        user.messages.forEach((message) => {
          message.fromSelf = message.from === socket.userID;
        });

        const existingUserIndex = users.findIndex(
          (existingUser) => existingUser.userID === user.userID
        );
        if (existingUserIndex !== -1) {
          setUsers((prevUsers) => {
            const updatedUsers = [...prevUsers];
            updatedUsers[existingUserIndex] = {
              ...updatedUsers[existingUserIndex],
              connected: user.connected,
              messages: user.messages,
            };
            return updatedUsers;
          });
        } else {
          user.self = user.userID === socket.userID;
          initReactiveProperties(user);
          setUsers((prevUsers) => [...prevUsers, user]);
        }
      });

      setUsers((prevUsers) =>
        prevUsers.sort((a, b) => {
          if (a.self) return -1;
          if (b.self) return 1;
          if (a.username < b.username) return -1;
          return a.username > b.username ? 1 : 0;
        })
      );
    });

    socket.on("user connected", (connectedUser) => {
      const existingUserIndex = users.findIndex(
        (existingUser) => existingUser.userID === connectedUser.userID
      );
      if (existingUserIndex !== -1) {
        setUsers((prevUsers) => {
          const updatedUsers = [...prevUsers];
          updatedUsers[existingUserIndex] = {
            ...updatedUsers[existingUserIndex],
            connected: true,
          };
          return updatedUsers;
        });
      } else {
        initReactiveProperties(connectedUser);
        setUsers((prevUsers) => [...prevUsers, connectedUser]);
      }
    });

    socket.on("user disconnected", (disconnectedUserID) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.userID === disconnectedUserID
            ? { ...user, connected: false }
            : user
        )
      );
    });

    socket.on("private message", ({ content, from, to }) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          const fromSelf = socket.userID === from;
          if (user.userID === (fromSelf ? to : from)) {
            const updatedUser = {
              ...user,
              messages: [
                ...user.messages,
                { content, fromSelf },
              ],
            };
            if (user !== selectedUser) {
              updatedUser.hasNewMessages = true;
            }
            return updatedUser;
          }
          return user;
        })
      );
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("users");
      socket.off("user connected");
      socket.off("user disconnected");
      socket.off("private message");
    };
  }, [selectedUser, users]);

  return (
    <div>
      <div className="left-panel">
        {users.map((user) => (
          <User
            key={user.userID}
            user={user}
            selected={selectedUser === user}
            onSelect={() => onSelectUser(user)}
          />
        ))}
      </div>
      <div className="right-panel">
      {selectedUser && (
          
        <MessagePanel
          user={selectedUser}
          onInput={onMessage}
          
          />
          )}
        </div>
    </div>
  );
};

export default Chat;
