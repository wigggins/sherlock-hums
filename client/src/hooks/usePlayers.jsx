import { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';

export const usePlayers = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayers must be used within a PlayerProvider');
  }
  return context;
};
