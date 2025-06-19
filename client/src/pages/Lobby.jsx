import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { getPlayersBySession, startGameSubmission} from '../api'
import { usePlayers } from '../hooks/usePlayers';
import { UserAvatar } from "../components/UserAvatar/UserAvatar";
import { useWebSocket } from '../hooks/useWebSocket';
import { useUser } from '../context/UserContext';

export const Lobby = () => {
  const { sessionId } = useParams();
  const { lastMessage } = useWebSocket();
  const { players, dispatch } = usePlayers();
  const { currentUser } = useUser();

  useEffect(() => {
    getPlayersBySession(sessionId)
      .then((response) => {
        dispatch({ type: 'SET_PLAYERS', payload: response });
      })
      .catch((error) => {
        console.error('Error fetching players:', error);
      });
  }, [sessionId, dispatch]);

  useEffect(() => {
    if (lastMessage && lastMessage.event === 'player_joined') {
      const newPlayer = lastMessage.data;
      dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
    }
  }, [lastMessage, dispatch]);

  const handleStartGame = async () => {
    try {
      await startGameSubmission(sessionId);
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  return (
    <div className="page-container">
      {/* Background decorations */}
      <div className="bg-decoration">LOBBY</div>
      <div className="bg-decoration">WAIT</div>
      <div className="bg-decoration">READY</div>
      
      <div className="content-wrapper">
        <header className="text-center mb-8">
          <h1 className="bounce-in text-4xl md:text-6xl">
            WAITING ROOM
          </h1>
          <p className="text-xl font-bold mt-4 uppercase tracking-wide">
            🎪 The Band is Assembling! 🎪
          </p>
        </header>

        {/* Session ID Display */}
        <div className="text-center mb-8">
          <div className="session-id pulse-glow">
            SESSION: {sessionId}
          </div>
          <p className="text-lg font-bold mt-4 uppercase">
            Share this code with your friends!
          </p>
        </div>

        {/* Players Section */}
        <div className="section-card mb-8">
          <div className="text-center mb-6">
            <h2 className="text-black">
              🎵 PLAYERS ({players?.length || 0})
            </h2>
            <p className="font-bold text-lg mt-2">
              {players?.length < 2 ? 
                "Need at least 2 players to start!" : 
                "Looking good! Ready to rock?"
              }
            </p>
          </div>
          
          <div className="players-list">
            {players?.map((player, index) => (
              <div 
                key={player.user_id} 
                className="bounce-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <UserAvatar user={player} />
              </div>
            ))}
            
            {/* Empty slots visualization */}
            {players?.length < 6 && [...Array(Math.min(6 - (players?.length || 0), 3))].map((_, index) => (
              <div 
                key={`empty-${index}`}
                className="player-card opacity-30 border-dashed"
                style={{
                  background: 'transparent',
                  color: 'var(--black)',
                  borderStyle: 'dashed'
                }}
              >
                <div className="text-4xl mb-2">👤</div>
                <div className="text-sm">WAITING...</div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Status and Controls */}
        <div className="section-card text-center">
          {players?.length < 2 ? (
            <div className="status-message warning">
              <div className="text-2xl mb-2">⏳</div>
              <p>Waiting for more players to join...</p>
              <p className="text-sm mt-2">Share the session code above!</p>
            </div>
          ) : (
            <div className="status-message success">
              <div className="text-2xl mb-2">✅</div>
              <p>Ready to start the music battle!</p>
              {currentUser.isHost && (
                <p className="text-sm mt-2">You're the host - hit the button when ready!</p>
              )}
            </div>
          )}

          {currentUser.isHost && players?.length >= 2 && (
            <button 
              onClick={handleStartGame}
              className="btn-primary text-2xl py-6 px-8 mt-6 pulse-glow"
            >
              🚀 START THE GAME!
            </button>
          )}

          {!currentUser.isHost && (
            <div className="mt-6 p-4 bg-black text-white border-4 border-white">
              <p className="font-bold uppercase">
                🎯 Waiting for the host to start the game...
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="section-card mt-8">
          <h3 className="text-center text-black mb-4">🎮 Next Up:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl mb-2">1️⃣</div>
              <p className="font-bold">Submit 3 Songs</p>
              <p className="text-sm">Paste Spotify URLs</p>
            </div>
            <div>
              <div className="text-3xl mb-2">2️⃣</div>
              <p className="font-bold">Listen & Guess</p>
              <p className="text-sm">Who chose each track?</p>
            </div>
            <div>
              <div className="text-3xl mb-2">3️⃣</div>
              <p className="font-bold">Score & Win</p>
              <p className="text-sm">Most correct wins!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}