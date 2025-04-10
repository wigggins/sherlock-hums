import HeadphonesAvatar from '../../assets/avatars/headphones.svg?react'
import { avatarColors } from '../../utils/constants'

export const UserAvatar = ({user}) => {
  return (
    <div>
      <HeadphonesAvatar color={avatarColors[user.avatar_color]} height={40} width={40} />
      <div>{user.username}</div>
    </div>
  )
}