// import io from "socket.io-client";
// import BeginChat from "./black_test"
import BeginChat from "./black_test";
import { useState } from "react";
import Pong from "../../game/Pong";
import Live from "../../live/Live";

const Call = () =>
{
    // const URL = "http://localhost:4000";
    // const socket = io(URL, { autoConnect: false });
    const [username, setUsername] = useState('');
    const [send, SetSend] = useState(false);
    const [game, setGame] = useState(false);
    const [live, setLive] = useState(false);
    
    return (
        <>
            <input 
            type="text" 
            placeholder="Tape username" 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            /> 
            <button onClick={() => SetSend(true)}>Submit</button>
            <button onClick={() => setGame(true)}>play</button>
            <button onClick={() => setLive(true)}>live</button>
            {/* {send && (
                 <BeginChat socket={socket} username={username} />
            )}
            {live && (
                <Live socket={socket} username={username}/>
                )}
            {game && (
                <Pong socket={socket} username={username} />
                
            )} */}
        
        </>
    )
}

export default Call;