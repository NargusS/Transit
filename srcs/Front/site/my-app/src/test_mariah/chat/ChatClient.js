import React, { useState } from "react";
import io from "socket.io-client";

// function ChatClient() {
//     const socket = io("http://localhost:4000");

//       const [message, setMessage] = useState("");
    
//       const handleSendMessage = () => {
//         socket.emit("message", message);
//         setMessage("");
//       };
    
//       return (
//         <div>
//           <input
//             type="text"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//           />
//           <button onClick={handleSendMessage}>Send</button>
//         </div>
//       );
// }    
// export default ChatClient;