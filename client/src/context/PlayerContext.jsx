import React, { createContext, useReducer } from 'react';

const initialState = [];

/* Player Object
  user_id: 123,
  username: 'Preston',
  avatarType: 'headphones',  
  avatarColor: 'teal',
  submitted: false,
  score: 0 
*/

// action types.
export const ADD_PLAYER = 'ADD_PLAYER';
export const SET_PLAYERS = 'SET_PLAYERS';
export const UPDATE_PLAYER = 'UPDATE_PLAYER';
export const CLEAR_PLAYERS = 'CLEAR_PLAYERS';

const playerReducer = (state, action) => {
  switch (action.type) {
    case SET_PLAYERS:
      // set current players when joining
      return action.payload;
    case ADD_PLAYER:
      // check for dupe
      if (state.find((p) => p.user_id === action.payload.user_id)) {
        return state;
      }
      return [...state, action.payload];
    case UPDATE_PLAYER:
      // update player data (todo: maybe split?), identified by user_id.
      return state.map((player) =>
        player.user_id === action.payload.user_id
          ? { ...player, ...action.payload.data }
          : player
      );
    default:
      return state;
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const PlayerContext = createContext();

export const PlayerProvider = ({ children, initialPlayers = initialState }) => {
  const [players, dispatch] = useReducer(playerReducer, initialPlayers);

  return (
    <PlayerContext.Provider value={{ players, dispatch }}>
      {children}
    </PlayerContext.Provider>
  );
};
