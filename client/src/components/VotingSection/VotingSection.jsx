import { useState } from 'react';
import { submitGuess } from "../../api"
import { usePlayers } from "../../hooks/usePlayers";
import { UserAvatar } from "../UserAvatar/UserAvatar";
import { useParams } from 'react-router';
import { useUser } from '../../context/UserContext';

export const VotingSection = () => {
  const { sessionId, roundId } = useParams();
  const { currentUser } = useUser()
  const { players } = usePlayers();
  const [userVote, setUserVote] = useState(false);

  const handleVote = async (guessedUserId) => {
    console.log('handleVote clicked')
    try {
      await submitGuess(sessionId, roundId, currentUser.id, guessedUserId);
      setUserVote(true);
      // update state to show we've selected this player as our vote
    } catch(err) {
      console.log('Error submitting guess: ', err);
    }
  }

  return (
    <div>
      {userVote ? 
        'Vote Submitted!' :
        players.map(player => (
          <div className="vote-card" onClick={() => handleVote(player.user_id)}>
            <UserAvatar user={player} />
          </div>
        ))
      }
    </div>
  )
}