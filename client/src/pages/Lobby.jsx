import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { getPlayersBySession} from '../api'
import { useLobby } from '../context/LobbyContext';
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

  return (
    <>
      <div>Players:</div>
        {players?.map((player) => (
          <div key={player.user_id}>{player.username}</div>
        ))}
    </>
  )
}