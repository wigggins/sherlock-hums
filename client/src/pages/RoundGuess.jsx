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
      <div>
        Waiting on round data...
      </div>
    )
  }

  return (
    <div>
      <SpotifyPlayer trackId={getSpotifyTrackId(roundData.song_url)} />
      { !votingClosed && <CountdownProgressBar duration={60} /> }
      <VotingSection userVote={userVote} setUserVote={setUserVote} />
      { 
        results && 
        <RoundResults 
          results={results} 
          handleNextRound={handleNextRound}
          isHost={currentUser.isHost} 
          isGameComplete={results.game_complete} 
        />
      }
      {currentUser.isHost && results.game_complete && <button onClick={handleCompleteGame}>Complete Game</button>}
    </div>
  )
}