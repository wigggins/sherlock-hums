import HeadphonesAvatar from '../../assets/avatars/headphones.svg?react'
import { avatarColors } from '../../utils/constants'

export const UserAvatar = ({user}) => {
  return (
    <div className="player-card">
      <HeadphonesAvatar color={avatarColors[user.avatar_color]} height={40} width={40} />
      <div>{user.username}</div>
      <div>{user.submitted ? 'submitted' : ''}</div>
    </div>
  )
}