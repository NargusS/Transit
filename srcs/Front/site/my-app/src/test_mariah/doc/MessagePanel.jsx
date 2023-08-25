import React, { useState } from "react";
import StatusIcon from "./StatusIcon";
import './doc.css'

const MessagePanel = ({ user, onInput }) => {
  const [input, setInput] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (input.length > 0) {
      onInput(input);
      setInput("");
    }
  };

  const displaySender = (message, index) => {
    return (
      index === 0 ||
      user.messages[index - 1].fromSelf !== message.fromSelf
    );
  };

  const isValid = input.length > 0;

  return (
    <div>
      <div className="header">
        <StatusIcon connected={user.connected} />
        {user.username}
      </div>

      <ul className="messages">
        {user.messages.map((message, index) => (
          <li key={index} className="message">
            {displaySender(message, index) && (
              <div className="sender">
                {message.fromSelf ? "(yourself)" : user.username}
              </div>
            )}
            {message.content}
          </li>
        ))}
      </ul>

      <form onSubmit={onSubmit} className="form">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your message..."
          className="input"
        />
        <button disabled={!isValid} className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default MessagePanel;
