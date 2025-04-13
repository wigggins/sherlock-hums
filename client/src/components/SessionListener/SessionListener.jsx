import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';

export const SessionListener = () => {
  const { sessionId } = useParams();
  const { lastMessage } = useWebSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (lastMessage && lastMessage.event === 'game_started') {
      console.log("Game started event received; navigating to Song Submission page");
      navigate(`/session/${sessionId}/submission`);
    }

    if (lastMessage && lastMessage.event === 'guessing_started') {
      console.log("Guessing started event received; navigating to Guessing Round page");
      navigate(`/session/${sessionId}/round/1`);
    }
  }, [lastMessage, sessionId, navigate]);

  return null;
};
