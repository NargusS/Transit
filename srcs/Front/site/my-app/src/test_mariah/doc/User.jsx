import React from "react";
import './doc.css'

const User = ({ user, selected, onSelect }) => {
  return (
    <div
      className={`user ${selected ? "selected" : ""}`}
      onClick={() => onSelect(user)}
    >
      <div className="description">
        <span>{user.username}</span>
        <span className="status">{user.connected ? "Connected" : "Offline"}</span>
      </div>
      {user.hasNewMessages && <span className="new-messages">!</span>}
    </div>
  );
};

export default User;
