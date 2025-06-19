import { UserAvatar } from "../UserAvatar/UserAvatar"

export const PlayersList = ({ players, showSubmissionStatus = false }) => {
  return (
    <div className="players-list">
      {players.map(player => (
        <UserAvatar 
          key={player.user_id} 
          user={player} 
          isSubmitted={showSubmissionStatus ? player.submitted : false}
        />
      ))}
    </div>
  )
}