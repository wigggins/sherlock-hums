import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';
import { startRound } from '../../api';
import { useUser } from '../../context/UserContext';

export const SessionListener = () => {
  const { sessionId } = useParams();
  const { lastMessage } = useWebSocket();
  const navigate = useNavigate();
  const { currentUser } = useUser();

  useEffect(() => {
    if (lastMessage && lastMessage.event === 'game_started') {
      console.log("Game started event received; navigating to Song Submission page");
      navigate(`/session/${sessionId}/submission`);
    }

    if (lastMessage && lastMessage.event === 'guessing_started') {
      console.log("Guessing started event received; navigating to Guessing Round page");
      // not a great spot for this, but thisll do for now
      // if user is host, make api call to manually start first round
      navigate(`/session/${sessionId}/round/1`);
      if(currentUser.isHost) {
        startRound(sessionId, currentUser.id, 1);
      }
    }

    if (lastMessage && lastMessage.event === 'round_started') {
      console.log('round_started')
      navigate(`/session/${sessionId}/round/${lastMessage.data.round_number}`);
    }

    if (lastMessage && lastMessage.event === 'final_results') {
      console.log('"final_results"')
      // todo: update state from here for final scores?
      navigate(`/session/${sessionId}/results`);
    }
  }, [lastMessage, sessionId]);

  return null;
};
