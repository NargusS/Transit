// import { useState, useEffect} from "react";
// import { SocketProvider, useSocket } from '../../SocketContext';
// import { Socket } from "socket.io-client";

// const Test_http = () => {
//      const [name, SetName] = useState('')
//      const [resi, setRes] = useState([]);
//      const [qrCodeImageUrl, setQrCodeImageUrl] = useState('');


//     const avatar = localStorage.getItem("avatar");
    
    
//     const handleFetchQrCode = () => {
//       fetch('http://localhost:4000/auth/ga2f', {
//         credentials: 'include', 
//         method: 'POST', 
//         headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },    
//       }) //Si tu veux changer que le nickname il te suffit d'enlever l'avatar de l'objet
//       .then((response) => {
//         if (response.ok) {
//           // console.log(response.ok);
//           return response.json(); 
//         } else {
//           console.log('Network response was not ok');
//         }
//       })
//       .then((data) => {
//         setQrCodeImageUrl(data.data);
//         console.log('Response:', data); 
//       })
//     };
//     // const qrCodeData = await response.text();

//     const socket = useSocket();

//     const SetNickname = () => {
//         console.log("on est dans set-nickname le sang")
//         fetch('http://localhost:4000/auth/set-nickname', {
//           credentials: 'include', 
//           method: 'POST', 
//           headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, 
//           body: JSON.stringify({ nickname: name, avatar: avatar}),   
//         }) //Si tu veux changer que le nickname il te suffit d'enlever l'avatar de l'objet
//         .then((response) => {
//           if (response.ok) {
//             console.log(response.ok);
//             return response.json(); 
//           } else {
//             console.log('Network response was not ok');
//           }
//         })
//         .then((data) => {
//           console.log('Response:', data.data.nickname); 
//           localStorage.setItem("userName", data.data.nickname);
//           let username = data.data.nickname;
//           if(username)
//           {
//             socket.disconnect();
//             console.log('ON se connecte avec le socket');
//             socket.auth = {username};
//             socket.connect();
//           }
//         })
//         // const username = localStorage.getItem("userName");
//     } 

//     const InviteFriends = () => {

//       console.log("on est dans set-nickname le sang")
//       const URL = "http://" + window.location.hostname + ":4000";
//       const final = URL + "/users/invitefriend";
//       fetch(final, {
//           credentials: 'include', 
//           method: 'POST', 
//           headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, 
//           body: JSON.stringify({ nickname: name,}),   
//   }) //Si tu veux changer que le nickname il te suffit d'enlever l'avatar de l'objet
//   .then((response) => {
//       if (response.ok) {
//           console.log(response.ok);
//         return response.json(); 
//       } else {
//           console.log('Network response was not ok');
//       }
//     })
//     .then((data) => {
//       console.log('Response:', data); 
//     })
//   } 
    
//     const GetAll = async () =>{
//       const URL = "http://" + window.location.hostname + ":4000";
//       const final = URL + "/users/all";
//         console.log("GETALL: sans request")
//         fetch(final, {
//             credentials: 'include', 
//             method: 'GET', 
//             headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },  
//         })
//         .then((response) => {
//             console.log("GETALL: reponse bonne")
//               console.log(response.ok);
//             return response.json();
//         })
//         .then((data) => {
//           console.log(data.data);
//           console.log(data);
//           setRes(data.data)
//         })
//     }


//     const AddFriend = () => {
//       fetch('http://localhost:4000/users/friends', {
//             credentials: 'include', 
//             method: 'POST', 
//             headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },  
//             body: JSON.stringify({ friendName: name}),
//           })
//         .then((response) => {
//             console.log("GETALL: reponse bonne")
//               console.log(response);
//             return response.json();
//         })
//         .then((data) => {
//           console.log(data);
//           if(data.data === null)
//             console.log("no friends")
//           // setRes(data)
//         })
//     }

//     const BlockedUser = () => {
//       fetch('http://localhost:4000/users/block', {
//             credentials: 'include', 
//             method: 'POST', 
//             headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },  
//             body: JSON.stringify({blockedUser: name }),
//           })
//         .then((response) => {
//             console.log("GETALL: reponse bonne")
//               console.log(response);
//             return response.json();
//         })
//         .then((data) => {
//           console.log(data);
//           if(data.data === null)
//             console.log("no ennemies")
//           // setRes(data)
//         })
//     }

//     const DeblockUser = () => {
//       fetch('http://localhost:4000/users/deblock', {
//         credentials: 'include', 
//         method: 'DELETE', 
//         headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },  
//         body: JSON.stringify({deblockUser: name }),
//       })
//       .then((response) => {
//           console.log("GETALL: reponse bonne")
//             console.log(response);
//           return response.json();
//       })
//       .then((data) => {
//         console.log(data);
//         if(data.data === null)
//           console.log("no ennemies")
//         // setRes(data)
//       })
//     }

//     const DeleteFriend = () => {
//       fetch('http://localhost:4000/users/deletefriend', {
//         credentials: 'include', 
//         method: 'DELETE', 
//         headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },  
//         body: JSON.stringify({byefriend: name }),
//       })
//       .then((response) => {
//           console.log("GETALL: reponse bonne")
//             console.log(response);
//           return response.json();
//       })
//       .then((data) => {
//         console.log(data);
//         if(data.data === null)
//           console.log("no ennemies")
//         // setRes(data)
//       })
//     }

//     const GetA2F = () => {
//       fetch('http://localhost:4000/auth/ga2f', {
//         credentials: 'include', 
//         method: 'POST', 
//         headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, 
//       })
//       .then((response) => {
//           console.log("GETALL: reponse bonne")
//             console.log(response);
//           return response.json();
//       })
//       .then((data) => {
//         console.log(data);
//         if(data.data === null)
//           console.log("no ennemies")
//         // setRes(data)
//       })
//     }

//     const DeleteA2F = () => {
//       fetch('http://localhost:4000/auth/no-a2f', {
//         credentials: 'include', 
//         method: 'DELETE', 
//         headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },  
// }) //Si tu veux changer que le nickname il te suffit d'enlever l'avatar de l'objet
// .then((response) => {
//     if (response.ok) {
//         console.log(response.ok);
//       return response.json(); 
//     } else {
//         console.log('Network response was not ok');
//     }
//   })
//   .then((data) => {
//     console.log('Response:', data); 
//   })
//     }

//     const GetMe = () => {
//       fetch('http://localhost:4000/users', {
//         credentials: 'include', 
//         method: 'POST', 
//         headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, 
//         body: JSON.stringify({ nickname: name,}), 
//       })
//       .then((response) => {
//           console.log("GETALL: reponse bonne")
//             console.log(response);
//           return response.json();
//       })
//       .then((data) => {
//         console.log(data);
//         if(data.data === null)
//           console.log("no ennemies")
//         // setRes(data)
//       })
//     }


//     return(

//         <div>
//             <input
//             type="text"
//             placeholder="Set- deblockUSer"
//             value={name}
//             onChange={e => SetName(e.target.value)}
//             />
//             <button onClick={() => SetNickname()}>Set-avatar</button>
//             <button onClick={() => GetMe()}>GET ME</button>
//             <button onClick={() => DeleteFriend()}>Send nickname</button>
//             <button onClick={() => AddFriend()}>Send NewFriend</button>
//             <button onClick={() => BlockedUser()}>BlockedUser</button>
//             <button onClick={() => DeblockUser()}>DEBLOCK</button>
//             <button onClick={() => GetAll()}>GETALL</button>
//             <button onClick={() => InviteFriends()}>InviteFriend</button>
//             <button onClick={() => DeleteA2F()}>DeleteA2F</button>
//             {/* <button onClick={() => GetA2F()}>A2F</button> */}
//             <button onClick={() => handleFetchQrCode()}>A2F</button>
//             {/* //pour le getAll */}
//             {qrCodeImageUrl && (
              
//               <div >
//               <img src={qrCodeImageUrl} alt="QR Code" />
//               </div>
              
//             )}
//             {resi.map((data, index) => (
//             <div key={index}>
//             <p>User: {data.user}</p>
//             <p>User_Status: {data.status}</p>
//             <p>User_Avatar: 
//             <img src={data.avatar} alt="Avatar" />
//               </p>
//             <p>Is Friend: {data.isFriend.toString()}</p>
//             <p>Is Blocked: {data.isBlocked.toString()}</p>
//             <p>I'm bloqued by this user : {data.ImBloqued.toString()}</p>
//             <p>I receive invite : {data. Already_invite.toString()}</p>

//         </div>
//       ))}
//           {/* {resi.map((item) => (
//             <div key={item}> 
//               {item}
//               </div>
//           ))} */}
//         </div>
//     )
// }

// export default Test_http;