import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export const Lobby = () => {
  const { lastMessage } = useWebSocket();
  const [ players, setPlayers ] = useState([])

  useEffect(() => {
    // TODO: fetch initial users with new api endpoint
    if (lastMessage && lastMessage.event === 'player_joined') {
      const newPlayer = lastMessage.data;
      setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
    }
  }, [lastMessage]);

  return (
    <>
      <div>Players:</div>
      {players.map(player => (
        <div>{player.username}</div>
      ))}
    </>
  )
}