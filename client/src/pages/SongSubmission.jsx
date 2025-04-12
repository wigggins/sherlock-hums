import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useWebSocket } from '../hooks/useWebSocket';
import { usePlayers } from '../hooks/usePlayers';
import { songSubmission, startGameGuessing } from '../api';
import { useUser } from '../context/UserContext';
import { PlayersList } from '../components/PlayersList/PlayersList';

export const SongSubmission = () => {
  const { sessionId } = useParams();
  const { lastMessage } = useWebSocket();
  const { players, dispatch } = usePlayers();
  const { currentUser } = useUser()

  // quick state
  const [ songOne, setSongOne ] = useState('');
  const [ songTwo, setSongTwo ] = useState('');
  const [ songThree, setSongThree ] = useState('');
  const [ hasSubmitted, setHasSubmitted ] = useState(false);

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
      setHasSubmitted(true);
    } catch (err) {
      console.error('Error submitting songs:', err);
    }
  }

  const handleGuessingStart = async () => {
    try {
      await startGameGuessing(sessionId, currentUser.id);
    } catch (err) {
      console.error('Error starting guessing: ', err)
    }
  }

  return (
    <>
      <h2>Song Submission Page</h2>
      <div className="container-split">
        <div className="half">
          <PlayersList players={players} />
        </div>
        { hasSubmitted ? (
          <div className="half">
            <div>
              Songs have been submitted!
            </div>
            { currentUser.isHost && <button onClick={handleGuessingStart}>Begin Game</button>}
          </div>
        ) : (
          <div className="half">
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
            <button onClick={handleSongsSubmission}>Submit</button>
          </div>
        )}
      </div>
    </>
  )
}