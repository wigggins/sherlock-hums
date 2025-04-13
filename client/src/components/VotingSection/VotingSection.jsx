import { submitGuess } from "../../api"
import { usePlayers } from "../../hooks/usePlayers";
import { UserAvatar } from "../UserAvatar/UserAvatar";
import { useParams } from 'react-router';
import { useUser } from '../../context/UserContext';

export const VotingSection = () => {
  const { sessionId, roundId } = useParams();
  const { currentUser } = useUser()
  const { players } = usePlayers();
  const handleVote = async (guessedUserId) => {
    try {
      await submitGuess(sessionId, roundId, currentUser.id, guessedUserId);
      // update state to show we've selected this player as our vote
    } catch(err) {
      console.log('Error submitting guess: ', err);
    }
  }

  return (
    <div>
      {players.map(player => (
        <div onClick={() => handleVote(player.user_id)}>
          <UserAvatar user={player} />
        </div>
      ))}
    </div>
  )
}