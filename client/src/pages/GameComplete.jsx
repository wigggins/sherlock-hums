import React from 'react';
import { usePlayers } from '../hooks/usePlayers';
import { UserAvatar } from "../components/UserAvatar/UserAvatar";


export const GameComplete = () => {
  const { players } = usePlayers();

  return (
    <>
      <div>Game Results</div>
      <div>Players:</div>
        {players?.map((player) => (
          <UserAvatar key={player.user_id} user={player}>{player.username}</UserAvatar>
        ))}
    </>
  )
}