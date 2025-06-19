import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useWebSocket } from '../hooks/useWebSocket';
import { usePlayers } from '../hooks/usePlayers';
import { songSubmission, startGameGuessing } from '../api';
import { useUser } from '../context/UserContext';
import { PlayersList } from '../components/PlayersList/PlayersList';

export const SongSubmission = () => {
  const { sessionId } = useParams();
  const { lastMessage } = useWebSocket();
  const { players, dispatch } = usePlayers();
  const { currentUser } = useUser()

  // quick state
  const [ songOne, setSongOne ] = useState('');
  const [ songTwo, setSongTwo ] = useState('');
  const [ songThree, setSongThree ] = useState('');
  const [ hasSubmitted, setHasSubmitted ] = useState(false);

  useEffect(() => {
    if (lastMessage && lastMessage.event === 'submission_completed') {
      dispatch({ type: 'UPDATE_PLAYER', payload: {
        user_id: lastMessage.data.user_id,
        data: {
          submitted: true
        }
      } });
    }
  }, [lastMessage, sessionId, dispatch]);

  const handleSongsSubmission = async () => {
    try {
      await songSubmission(currentUser.sessionId, {
        user_id: currentUser.id,
        songs: [
          songOne,
          songTwo,
          songThree
        ]
      })
      setHasSubmitted(true);
    } catch (err) {
      console.error('Error submitting songs:', err);
    }
  }

  const handleGuessingStart = async () => {
    try {
      await startGameGuessing(sessionId, currentUser.id);
    } catch (err) {
      console.error('Error starting guessing: ', err)
    }
  }

  const submittedPlayers = players?.filter(p => p.submitted) || [];
  const totalPlayers = players?.length || 0;
  const allSubmitted = submittedPlayers.length === totalPlayers && totalPlayers > 0;

  return (
    <div className="page-container">
      {/* Background decorations */}
      <div className="bg-decoration">MUSIC</div>
      <div className="bg-decoration">SUBMIT</div>
      <div className="bg-decoration">TRACKS</div>
      
      <div className="content-wrapper">
        <header className="text-center mb-8">
          <h1 className="bounce-in text-4xl md:text-6xl">
            SONG DROP
          </h1>
          <p className="text-xl font-bold mt-4 uppercase tracking-wide">
            🎵 Time to Share Your Bangers! 🎵
          </p>
        </header>

        <div className="split-container">
          {/* Player Status Section */}
          <div className="section-card">
            <h2 className="text-black text-center mb-6">
              🎯 SUBMISSION STATUS
            </h2>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-black mb-2">
                {submittedPlayers.length} / {totalPlayers}
              </div>
              <p className="font-bold text-lg">
                PLAYERS READY
              </p>
            </div>

            <div className="players-list mb-6">
              {players?.map((player, index) => (
                <div 
                  key={player.user_id}
                  className="bounce-in"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <PlayersList 
                    players={[player]} 
                    showSubmissionStatus={true}
                  />
                </div>
              ))}
            </div>

            {allSubmitted ? (
              <div className="status-message success">
                <div className="text-2xl mb-2">🎉</div>
                <p>Everyone's locked and loaded!</p>
                {currentUser.isHost && (
                  <button 
                    onClick={handleGuessingStart}
                    className="btn-primary text-xl mt-4 pulse-glow"
                  >
                    🚀 LET THE GUESSING BEGIN!
                  </button>
                )}
              </div>
            ) : (
              <div className="status-message">
                <div className="text-2xl mb-2">⏳</div>
                <p>Waiting for all submissions...</p>
              </div>
            )}
          </div>

          {/* Song Submission Section */}
          {hasSubmitted ? (
            <div className="section-card">
              <div className="text-center">
                <h2 className="text-black mb-6">
                  ✅ SONGS LOCKED IN!
                </h2>
                
                <div className="status-message success mb-6">
                  <div className="text-4xl mb-4">🎵</div>
                  <p className="text-xl font-bold">Your tracks are in the mix!</p>
                  <p className="mt-2">Now we wait for the others...</p>
                </div>
                
                <div className="p-6 bg-black text-white border-4 border-white">
                  <p className="font-bold text-lg uppercase mb-2">
                    🎭 Your Secret Weapons:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>🎶 Track 1: *** CLASSIFIED ***</div>
                    <div>🎶 Track 2: *** CLASSIFIED ***</div>
                    <div>🎶 Track 3: *** CLASSIFIED ***</div>
                  </div>
                  <p className="text-xs mt-4 opacity-75">
                    Songs are now anonymous - let the guessing games begin!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="section-card">
              <h2 className="text-black text-center mb-6">
                🎵 SUBMIT YOUR TRACKS
              </h2>
              
              <div className="space-y-6">
                <div className="input-group">
                  <label className="input-label flex items-center gap-2">
                    <span className="text-2xl">🥇</span>
                    Track #1 (Spotify URL):
                  </label>
                  <input 
                    type="text" 
                    placeholder="https://open.spotify.com/track/..."
                    value={songOne}
                    onChange={(e) => setSongOne(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="input-group">
                  <label className="input-label flex items-center gap-2">
                    <span className="text-2xl">🥈</span>
                    Track #2 (Spotify URL):
                  </label>
                  <input 
                    type="text" 
                    placeholder="https://open.spotify.com/track/..."
                    value={songTwo}
                    onChange={(e) => setSongTwo(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="input-group">
                  <label className="input-label flex items-center gap-2">
                    <span className="text-2xl">🥉</span>
                    Track #3 (Spotify URL):
                  </label>
                  <input 
                    type="text" 
                    placeholder="https://open.spotify.com/track/..."
                    value={songThree}
                    onChange={(e) => setSongThree(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <button 
                  onClick={handleSongsSubmission}
                  className="btn-primary w-full text-xl py-4"
                  disabled={!songOne.trim() || !songTwo.trim() || !songThree.trim()}
                >
                  🔒 LOCK IN TRACKS
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-black text-white border-4 border-white">
                <h4 className="font-bold text-sm uppercase mb-2">💡 Pro Tips:</h4>
                <ul className="text-xs space-y-1">
                  <li>• Copy full Spotify URLs from the app or web</li>
                  <li>• Choose tracks that represent YOU</li>
                  <li>• Mix genres to keep others guessing</li>
                  <li>• No duplicates allowed!</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}