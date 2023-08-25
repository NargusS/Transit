import React, { Component } from "react";
import "./chatons.css";
import ChatList from "./ChatList";
import ChatContent from "./ChatContent";
import UserProfile from "./UserProfile";

export default class ChatBody extends Component {
  render() {
    return (
      <div className="main__chatbody">
        <ChatList />
        <ChatContent />
        <UserProfile />
      </div>
    );
  }
}