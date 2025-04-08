import React, { useEffect, useState } from 'react';
import WebSocketContext from './WebSocketContextInstance';
import { useParams } from 'react-router';
import { WS_BASE_URL } from '../api';

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const { sessionId } = useParams()

  useEffect(() => {
    const socketURL = `${WS_BASE_URL}?sessionID=${sessionId}`
    const socket = new WebSocket(socketURL);
    setWs(socket);

    // set up event listeners for debugging.
    socket.onopen = () => console.log('WebSocket connected');
    socket.onclose = () => console.log('WebSocket disconnected');
    socket.onerror = (error) => console.error('WebSocket error:', error);

    return () => {
      socket.close();
    };
  }, [sessionId]);

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};
