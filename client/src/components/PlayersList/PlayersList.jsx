import { UserAvatar } from "../UserAvatar/UserAvatar"

export const PlayersList = ({ players }) => {
  return (
    <div className="players-list">
      {players.map(player => (
        <UserAvatar key={player.user_id} user={player} />
      ))}
    </div>
  )
}