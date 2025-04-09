import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { getPlayersBySession, startGameSubmission} from '../api'
import { useLobby } from '../context/LobbyContext';
import { UserAvatar } from "../components/UserAvatar/UserAvatar";
import { useWebSocket } from '../hooks/useWebSocket';

export const Lobby = () => {
  const { sessionId } = useParams();
  const { lastMessage } = useWebSocket();
  const { players, dispatch } = useLobby();

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
      <div>Players:</div>
        {players?.map((player) => (
          <UserAvatar key={player.user_id} user={player}>{player.username}</UserAvatar>
        ))}
      {/* TODO: validate button only shows for host */}
      <button onClick={handleStartGame}>Start Game</button>
    </>
  )
}