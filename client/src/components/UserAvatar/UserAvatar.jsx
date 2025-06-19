import HeadphonesAvatar from '../../assets/avatars/headphones.svg?react'
import { avatarColors } from '../../utils/constants'

export const UserAvatar = ({ user, isSubmitted = false, isVoted = false }) => {
  const cardClasses = [
    'player-card',
    isSubmitted ? 'submitted' : '',
    isVoted ? 'voted' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      <HeadphonesAvatar 
        color={avatarColors[user.avatar_color]} 
        height={50} 
        width={50} 
        className="mb-2"
      />
      <div className="text-center font-bold text-sm uppercase tracking-wide">
        {user.username}
      </div>
      {isSubmitted && (
        <div className="text-xs mt-1 font-bold">
          ✅ READY
        </div>
      )}
    </div>
  )
}