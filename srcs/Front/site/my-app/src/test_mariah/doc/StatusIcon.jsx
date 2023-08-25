import React from "react";
import './doc.css'

const StatusIcon = ({ connected }) => {
  return (
    <i
      className={`icon ${connected ? "connected" : ""}`}
      style={{ backgroundColor: connected ? "#86bb71" : "#e38968" }}
    ></i>
  );
};

export default StatusIcon;
