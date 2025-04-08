import { useContext, useEffect, useState } from 'react';
import WebSocketContext from '../context/WebSocketContextInstance';

export const useWebSocket = () => {
  const ws = useContext(WebSocketContext);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    if (!ws) return;
    
    ws.onopen = () => console.log("WebSocket connection established on the client.");
    ws.onclose = () => console.log("WebSocket connection closed on the client.");
    ws.onerror = (error) => console.error("WebSocket error on the client:", error);
    
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received on the client:", data);
        setLastMessage(data);
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };
  
    ws.addEventListener('message', handleMessage);
  
    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [ws]);
  

  const sendMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  return { ws, lastMessage, sendMessage };
};
