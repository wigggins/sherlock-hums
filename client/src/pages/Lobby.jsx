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
    <>
      <div>Session ID: {sessionId}</div>
      <div>Players:</div>
        {players?.map((player) => (
          <UserAvatar key={player.user_id} user={player}>{player.username}</UserAvatar>
        ))}
      { currentUser.isHost && <button onClick={handleStartGame}>Start Game</button> }
    </>
  )
}