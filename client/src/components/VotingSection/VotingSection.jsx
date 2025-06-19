import { submitGuess } from "../../api"
import { usePlayers } from "../../hooks/usePlayers";
import { UserAvatar } from "../UserAvatar/UserAvatar";
import { useParams } from 'react-router';
import { useUser } from '../../context/UserContext';

export const VotingSection = ({ userVote, setUserVote }) => {
  const { sessionId, roundId } = useParams();
  const { currentUser } = useUser()
  const { players } = usePlayers();

  const handleVote = async (guessedUserId) => {
    console.log('handleVote clicked')
    try {
      await submitGuess(sessionId, roundId, currentUser.id, guessedUserId);
      setUserVote(guessedUserId);
    } catch(err) {
      console.log('Error submitting guess: ', err);
    }
  }

  return (
    <div className="section-card">
      <h2 className="text-black text-center mb-6">
        🎯 WHO DROPPED THIS BEAT?
      </h2>
      
      {userVote ? (
        <div className="status-message success text-center">
          <div className="text-4xl mb-4">🗳️</div>
          <p className="text-xl font-bold">Vote Locked In!</p>
          <p className="mt-2">Waiting for others to vote...</p>
          
          <div className="mt-6 p-4 bg-black text-white border-4 border-white">
            <p className="font-bold text-sm uppercase">
              Your guess is secure! Results coming soon...
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <p className="text-lg font-bold mb-2">
              Listen carefully and make your guess!
            </p>
            <p className="text-sm uppercase tracking-wide">
              Click on the player you think submitted this track
            </p>
          </div>
          
          <div className="players-list">
            {players.map((player, index) => (
              <div 
                key={player.user_id}
                className="vote-card bounce-in"
                style={{animationDelay: `${index * 0.1}s`}}
                onClick={() => handleVote(player.user_id)}
              >
                <UserAvatar user={player} />
                <div className="text-center mt-2">
                  <div className="text-xs font-bold uppercase tracking-wide">
                    VOTE
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-black text-white border-4 border-white text-center">
            <p className="font-bold text-sm uppercase mb-2">
              🎵 Voting Strategy Tips:
            </p>
            <div className="text-xs space-y-1">
              <p>• Think about each player's music taste</p>
              <p>• Consider the genre and era</p>
              <p>• Trust your instincts!</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}