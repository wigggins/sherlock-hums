import HeadphonesAvatar from '../../assets/avatars/headphones.svg?react'

export const UserAvatar = ({user}) => {
  return (
    <div>
      <HeadphonesAvatar color="#F95408" height={40} width={40} />
      <div>{user.username}</div>
    </div>
  )
}