import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { usePlayers } from '../hooks/usePlayers';
import { useUser } from '../context/UserContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { CountdownProgressBar } from '../components/CountdownProgressBar/CountdownProgressBar';
import { VotingSection } from '../components/VotingSection/VotingSection';

export const RoundGuess = () => {
  const { sessionID, roundID } = useParams();
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

  if(!roundData) {
    return (
      <div>
        Waiting on round data...
      </div>
    )
  }

  return (
    <div>
      <iframe 
        style={{borderRadius: '12px'}} 
        // TODO make dynamic, but lots of work tbd for that
        src="https://open.spotify.com/embed/track/2TjngvHoJQIkI7BGoK04D2?theme=0" 
        width="100%" height="352" 
        frameBorder="0" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"></iframe>

      <CountdownProgressBar duration={60} />
      <VotingSection />
    </div>
  )
}