import React, { useState } from "react"
import { useNavigate } from 'react-router-dom';
import { createSession, joinSession } from '../api';

export const Home = () => {
  const navigate = useNavigate();

  // quick state
  const [hostUsername, setHostUsername] = useState('');
  const [joinUsername, setJoinUsername] = useState('');
  const [joinSessionId, setJoinSessionId] = useState('');

  // handlers
  const handleCreateSession = async () => {
    try {
      const data = await createSession(hostUsername);
      navigate(`/session/${data.session_id}/lobby`);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleJoinSession = async () => {
    try {
      await joinSession(joinSessionId, joinUsername);
      navigate(`/session/${joinSessionId}/lobby`);
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  return (
    <>
      <h1>Sherlock Hums</h1>
      <div className="container">
        <div className="half">
          <h2>Create Game</h2>
          <input
            type="text"
            placeholder="Enter username"
            value={hostUsername}
            onChange={(e) => setHostUsername(e.target.value)}
          />
          <button onClick={handleCreateSession}>Create Game</button>
        </div>
        <div className="half">
          <h2>Join Game</h2>
          <input
            type="text"
            placeholder="Enter session ID"
            value={joinSessionId}
            onChange={(e) => setJoinSessionId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter your username"
            value={joinUsername}
            onChange={(e) => setJoinUsername(e.target.value)}
          />
          <button onClick={handleJoinSession}>Join Game</button>
        </div>
      </div>
    </>
  )
}
