import './Register.css'
import React, {useState, useEffect} from 'react';
import avatarimg from '../avatar_default.png';
import {useNavigate} from 'react-router-dom';

function Register () {
  if (!localStorage.getItem("userName")){
    localStorage.setItem("connected", "no");
  }
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar"));
  if (!avatar) {
    setAvatar(avatarimg);
  }
  const [nicknameError, setNicknameError] = useState('');
  const [avatarError, setAvatarError] = useState('');

  const [qrCodeImageUrl, setQrCodeImageUrl] = useState('');
  const navigate = useNavigate();
  const alphanumericPattern = /^[a-zA-Z0-9]+$/;
  const isValidNickname = alphanumericPattern.test(nickname);
  const handleDone = () => {
    if (!nickname) {
      setNicknameError('Nickname cannot be empty.');
      return;
    }
    if (!isValidNickname){
      setNicknameError("Nickname contains invalid characters");
      return ;
    }
    if (!avatar) {
      setAvatarError("Missing avatar");
      return ;
    }
    const maxFileSize = 100 * 1024; // 100 KB in bytes

  // Convert the base64 string to a Blob
  const blob = fetch(avatar).then(response => response.blob());

  blob.then((imageBlob) => {
    if (imageBlob.size > maxFileSize) {
      setAvatar(avatarimg)
      setAvatarError('Image too heavy');
      return ;
    }})
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/auth/set-nickname";
    fetch(final, {
      credentials: 'include', 
      method: 'POST', 
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ nickname: nickname, avatar: avatar}),
    })
       .then((response) => {
        if (response.ok) {
          return response.json(); 
        } else {
          setNicknameError("Nickname is already in use");
        }
      })
      .then((data) => {
        if(data.data)
        {
          localStorage.setItem("connected", "yes");
          localStorage.setItem("userName", nickname);
          localStorage.setItem("avatar", avatar);
          navigate('/home');
        }
      })
  }
  const [isChecked, setIsChecked] = useState(localStorage.getItem("2AF") !== null);

  useEffect(() => {
    const handleLocalStorageChange = (e) => {
      if (e.key === "2AF") {
        setIsChecked(e.newValue !== null);
      }
    };
    window.addEventListener("storage", handleLocalStorageChange);
    return () => {
      window.removeEventListener("storage", handleLocalStorageChange);
    };
  }, []);

  useEffect(() => {
    const storedNickname = localStorage.getItem('userName');
    if (storedNickname) {
      setNickname(storedNickname);
    }
    const storedAvatar = localStorage.getItem("avatar");
    if (storedAvatar) {
      setAvatar(storedAvatar);
    }
  }, []);


  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
    setNicknameError('');
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        setAvatar(base64data);
      };
      event.target.value = null;
      reader.readAsDataURL(file);
    }
  };

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    if (newValue) {
      localStorage.setItem("2AF", "someValue");
      const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/auth/ga2f";
      fetch(final, {
        credentials: 'include', 
        method: 'POST', 
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },    
        })
        .then((response) => {
          if (response.ok) {
            return response.json(); 
          } else {
              console.log('Network response was not ok');
          }
        })
        .then((data) => {
          setQrCodeImageUrl(data.data);
        })
    } else {
      localStorage.removeItem("2AF");
      setQrCodeImageUrl(false);
      const URL = "http://" + window.location.hostname + ":4000";
      const final = URL + "/auth/no-a2f";
      fetch(final, {
        credentials: 'include', 
        method: 'DELETE', 
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },  
      })
      .then((response) => {
        if (response.ok) {
            console.log(response.ok);
          return response.json(); 
        } else {
            console.log('Network response was not ok');
        }
      })
      .then((data) => {
        console.log('Response:', data); 
      })
    }
  };

  return (
        <div className='user-form-container'>
            <div className="form" style={{backgroundColor:"aliceblue"}}>
              <label>Nickname:</label>
                <input type="text" value={nickname} onChange={handleNicknameChange} />
                {nicknameError && <div className="error-message">{nicknameError}</div>}
              <label>Avatar:</label>
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
                <img src={avatar} alt="Avatar" className="avatar-preview" />
                {avatarError && <div className='error-message'>{avatarError}</div>}
                <div style={{backgroundColor:"aliceblue"}}>
                  <label>2AF?</label>
                  <br/>
                  <label className="sliding-button">
                    <input type="checkbox" checked={isChecked} onChange={handleToggle} />
                    <span className="slider round"></span>
                  </label>
              </div>
              <button onClick={handleDone}>Done</button>
              <br/>
            </div>
            {qrCodeImageUrl && (   
              <div className="qrcode" style={{ backgroundImage: `url(${qrCodeImageUrl})` }} />
            )}
        </div>
    ); 
};

export default Register;
