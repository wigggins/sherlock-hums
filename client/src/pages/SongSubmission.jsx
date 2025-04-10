import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useWebSocket } from '../hooks/useWebSocket';
import { usePlayers } from '../hooks/usePlayers';
import { songSubmission } from '../api';
import { useUser } from '../context/UserContext';

export const SongSubmission = () => {
  const { sessionId } = useParams();
  const { lastMessage } = useWebSocket();
  const { players, dispatch } = usePlayers();
  const { currentUser } = useUser()

  // quick state
  const [ songOne, setSongOne ] = useState('');
  const [ songTwo, setSongTwo ] = useState('');
  const [ songThree, setSongThree ] = useState('');

  useEffect(() => {
    if (lastMessage && lastMessage.event === 'submission_completed') {
      dispatch({ type: 'UPDATE_PLAYER', payload: {
        user_id: lastMessage.data.user_id,
        data: {
          submitted: true
        }
      } });
    }
  }, [lastMessage, sessionId, dispatch]);

  // very gross, will refactor
  const handleSongsSubmission = async () => {
    try {
      await songSubmission(currentUser.sessionId, {
        user_id: currentUser.id,
        songs: [
          songOne,
          songTwo,
          songThree
        ]
      })
    } catch (err) {
      console.error('Error submitting songs:', err);
    }
  }

  return (
    <>
      <h2>Song Submission Page</h2>
      <div>

      </div>
      <div>
        <div className="input-group">
          <input 
            type="text" 
            className="text-input" 
            value={songOne}
            onChange={(e) => setSongOne(e.target.value)} />
        </div>
        <div className="input-group">
          <input 
            type="text" 
            className="text-input" 
            value={songTwo}
            onChange={(e) => setSongTwo(e.target.value)}  />
        </div>
        <div className="input-group">
          <input 
            type="text" 
            className="text-input" 
            value={songThree}
            onChange={(e) => setSongThree(e.target.value)}  />
        </div>
        <button onClick={handleSongsSubmission} />
      </div>
    </>
  )
}