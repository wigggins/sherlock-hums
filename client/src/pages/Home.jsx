import React, { useState } from "react"
import { useNavigate } from 'react-router-dom';
import { createSession, joinSession } from '../api';
import { useUser } from "../context/UserContext";

export const Home = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();

  // quick state
  const [hostUsername, setHostUsername] = useState('');
  const [joinUsername, setJoinUsername] = useState('');
  const [joinSessionId, setJoinSessionId] = useState('');

  // handlers
  const handleCreateSession = async () => {
    try {
      const data = await createSession(hostUsername);
      navigate(`/session/${data.session_id}/lobby`);
      updateUser({id: data.user_id, sessionId: data.session_id})
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleJoinSession = async () => {
    try {
      const data = await joinSession(joinSessionId, joinUsername);
      navigate(`/session/${joinSessionId}/lobby`);
      updateUser({id: data.user_id, sessionId: data.session_id})
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
            className="text-input"
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
            className="text-input"
            placeholder="Enter session ID"
            value={joinSessionId}
            onChange={(e) => setJoinSessionId(e.target.value)}
          />
          <input
            type="text"
            className="text-input"
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
