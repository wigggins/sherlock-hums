import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { usePlayers } from '../hooks/usePlayers';
import { useUser } from '../context/UserContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { CountdownProgressBar } from '../components/CountdownProgressBar/CountdownProgressBar';
import { VotingSection } from '../components/VotingSection/VotingSection';
import { SpotifyPlayer } from '../components/SpotifyPlayer/SpotifyPlayer';
import { getSpotifyTrackId } from '../utils/getSpotifyTrackId';
import { RoundResults } from '../components/RoundResults/RoundResults';
import { startRound, completeSession } from '../api';

export const RoundGuess = () => {
  const { sessionId, roundId } = useParams();
  const { ws, lastMessage } = useWebSocket();
  const { players } = usePlayers();
  const { currentUser } = useUser();

  // local state driven by websocket events:
  const [roundData, setRoundData] = useState(null);
  const [votingClosed, setVotingClosed] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [results, setResults] = useState(null);

  // subscribe to websocket messages:
  useEffect(() => {
    if (!ws) return;
    const handleMessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        console.log("failed to parse message json: " + event.data);
        return;
      }

      switch (msg.event) {
        case 'round_started':
          // initialize voting ui
          setRoundData(msg.data);
          setVotingClosed(false);
          setUserVote(null);
          setResults(null);
          break;

        case 'round_completed':
          // show results ui
          setResults(msg.data);
          setVotingClosed(true);
          break;

        // handle errors if they get broadcasted
        case 'round_complete_error':
          console.error('Round completion error:', msg.data);
          break;
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws]);

  const handleNextRound = () => {
    console.log(sessionId, currentUser.id, Number(roundId) + 1)
    startRound(sessionId, currentUser.id, Number(roundId) + 1);
  }

  const handleCompleteGame = () => {
    completeSession(sessionId, currentUser.id);
  }

  if(!roundData) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="section-card text-center">
            <div className="status-message">
              <div className="text-4xl mb-4">🎵</div>
              <p className="text-xl font-bold">Loading Next Round...</p>
              <p className="mt-2">Getting the next track ready!</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Background decorations */}
      <div className="bg-decoration">ROUND</div>
      <div className="bg-decoration">GUESS</div>
      <div className="bg-decoration">VOTE</div>
      
      <div className="content-wrapper">
        <header className="text-center mb-8">
          <h1 className="bounce-in text-4xl md:text-6xl">
            ROUND #{roundId}
          </h1>
          <p className="text-xl font-bold mt-4 uppercase tracking-wide">
            🎧 Who Chose This Track? 🎧
          </p>
        </header>

        {/* Spotify Player Section */}
        <div className="section-card mb-8">
          <h3 className="text-black text-center mb-6">
            🎵 NOW PLAYING
          </h3>
          <SpotifyPlayer trackId={getSpotifyTrackId(roundData.song_url)} />
        </div>

        {/* Timer Section */}
        {!votingClosed && (
          <CountdownProgressBar duration={60} />
        )}

        {/* Voting or Results Section */}
        {results ? (
          <>
            <RoundResults 
              results={results} 
              handleNextRound={handleNextRound}
              isHost={currentUser.isHost} 
              isGameComplete={results.game_complete} 
            />
            
            {/* Final Game Complete Button for Host */}
            {currentUser.isHost && results.game_complete && (
              <div className="text-center mt-8">
                <button 
                  onClick={handleCompleteGame}
                  className="btn-secondary text-xl py-4 px-8"
                >
                  🏁 FINISH GAME
                </button>
              </div>
            )}
          </>
        ) : (
          <VotingSection userVote={userVote} setUserVote={setUserVote} />
        )}

        {/* Round Info */}
        <div className="section-card mt-8">
          <div className="text-center">
            <h3 className="text-black mb-4">📊 Round Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-black">#{roundId}</div>
                <div className="text-sm uppercase font-bold">Round</div>
              </div>
              <div>
                <div className="text-2xl font-black">{players?.length || 0}</div>
                <div className="text-sm uppercase font-bold">Players</div>
              </div>
              <div>
                <div className="text-2xl font-black">{userVote ? '✅' : '❓'}</div>
                <div className="text-sm uppercase font-bold">Your Vote</div>
              </div>
              <div>
                <div className="text-2xl font-black">{votingClosed ? '🔒' : '🔓'}</div>
                <div className="text-sm uppercase font-bold">Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}