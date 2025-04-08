import React, { createContext, useContext, useReducer } from 'react';

const LobbyContext = createContext();

export const lobbyReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PLAYERS':
      return action.payload;
    case 'ADD_PLAYER':
      if (state.some((player) => player.user_id === action.payload.user_id)) {
        return state;
      }
      return [...state, action.payload];
    default:
      return state;
  }
};

export const LobbyProvider = ({ children, initialPlayers = [] }) => {
  const [players, dispatch] = useReducer(lobbyReducer, initialPlayers);

  return (
    <LobbyContext.Provider value={{ players, dispatch }}>
      {children}
    </LobbyContext.Provider>
  );
};

export const useLobby = () => useContext(LobbyContext);
