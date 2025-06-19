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
      updateUser({id: data.user_id, sessionId: data.session_id, isHost: true})
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleJoinSession = async () => {
    try {
      const data = await joinSession(joinSessionId, joinUsername);
      navigate(`/session/${joinSessionId}/lobby`);
      updateUser({id: data.user_id, sessionId: data.session_id, isHost: false})
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  return (
    <div className="page-container">
      {/* Background decoration */}
      <div className="bg-decoration">MUSIC</div>
      <div className="bg-decoration">GUESS</div>
      <div className="bg-decoration">VIBES</div>
      
      <div className="content-wrapper">
        <header className="text-center mb-8">
          <h1 className="bounce-in">
            SHERLOCK
            <br />
            HUMS
          </h1>
          <p className="text-2xl font-bold mt-4 uppercase tracking-wide">
            🎵 Guess Who Dropped That Beat! 🎵
          </p>
        </header>

        <div className="split-container">
          {/* Create Game Section */}
          <div className="section-card bounce-in" style={{animationDelay: '0.2s'}}>
            <div className="text-center">
              <h2 className="text-black mb-6">
                🚀 HOST GAME
              </h2>
              
              <div className="space-y-6">
                <div className="input-group">
                  <label className="input-label">Your DJ Name:</label>
                  <input
                    type="text"
                    placeholder="ENTER USERNAME"
                    value={hostUsername}
                    onChange={(e) => setHostUsername(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <button 
                  onClick={handleCreateSession}
                  className="btn-primary w-full text-xl py-4"
                  disabled={!hostUsername.trim()}
                >
                  🎪 CREATE GAME
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-black text-white border-4 border-white">
                <p className="font-bold text-sm uppercase">
                  Start a new session and become the DJ master!
                </p>
              </div>
            </div>
          </div>

          {/* Join Game Section */}
          <div className="section-card bounce-in" style={{animationDelay: '0.4s'}}>
            <div className="text-center">
              <h2 className="text-black mb-6">
                🎯 JOIN GAME
              </h2>
              
              <div className="space-y-6">
                <div className="input-group">
                  <label className="input-label">Session Code:</label>
                  <input
                    type="text"
                    placeholder="ENTER SESSION ID"
                    value={joinSessionId}
                    onChange={(e) => setJoinSessionId(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Your Player Name:</label>
                  <input
                    type="text"
                    placeholder="ENTER USERNAME"
                    value={joinUsername}
                    onChange={(e) => setJoinUsername(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <button 
                  onClick={handleJoinSession}
                  className="btn-secondary w-full text-xl py-4"
                  disabled={!joinUsername.trim() || !joinSessionId.trim()}
                >
                  🎵 JOIN THE PARTY
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-black text-white border-4 border-white">
                <p className="font-bold text-sm uppercase">
                  Get the session code from your host!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How to Play Section */}
        <div className="section-card mt-8 bounce-in" style={{animationDelay: '0.6s'}}>
          <h3 className="text-center text-black mb-6">🎮 How to Play</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">📝</div>
              <h4 className="font-bold text-lg uppercase mb-2">Submit Songs</h4>
              <p className="font-semibold">Each player submits 3 Spotify song URLs anonymously</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">🎧</div>
              <h4 className="font-bold text-lg uppercase mb-2">Listen & Guess</h4>
              <p className="font-semibold">Songs play for 1 minute - guess who submitted each track!</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h4 className="font-bold text-lg uppercase mb-2">Score Points</h4>
              <p className="font-semibold">Earn points for correct guesses and see who wins!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
