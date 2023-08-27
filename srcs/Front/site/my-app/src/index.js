import './index.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './home/Home';
import Profil from './profil/Profil';
import MyProfil from './profil/MyProfil';
import Pong from './game/Pong';
import Register from './register/Register';
import NoPage from './NoPage/NoPage';
import { createRoot } from 'react-dom/client';
import Live from './live/Live';
import BeginChat from './test_mariah/Test_ultime/black_test';
import { SocketProvider } from './SocketContext';
import Login from './Login';
import LoginA2F from './LoginA2F';

function AppWrapper() {
  const isConnected = localStorage.getItem("connected") === "yes";

  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/a2f" element={<LoginA2F />} />
          <Route path="/register" element={<Register />} />
          {isConnected ? (
            <>
              <Route path="/options" element={<Register />} />
              <Route path="/home" element={<Home />} />
              <Route path="/profile" exact element={<MyProfil />} />
              <Route path="/profile/:whichProfile" exact element={<Profil />} />
              <Route path="/game" element={<Pong />} />
              <Route path="/live/:selectedGame" element={<Live />} />
              <Route path="/chat" element={<BeginChat />} />
            </>
          ) : null}
          <Route path="*" element={<NoPage />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

createRoot(document.getElementById('root')).render(<AppWrapper />);
