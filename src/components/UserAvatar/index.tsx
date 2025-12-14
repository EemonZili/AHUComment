import { useNavigate } from 'react-router-dom'
import { useUserInfo } from '@/hooks'
import { Avatar } from '@/components'

interface UserAvatarProps {
  openid: string | undefined
  className?: string
  size?: number
}

/**
 * 用户头像组件 - 自动获取用户信息并显示真实头像，点击可跳转到用户主页
 */
export const UserAvatar = ({ openid, className, size }: UserAvatarProps) => {
  const { userInfo } = useUserInfo(openid)
  const navigate = useNavigate()

  const handleClick = () => {
    if (openid) {
      navigate(`/user/${openid}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      style={{ cursor: 'pointer', display: 'inline-block' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <Avatar
        src={userInfo?.avatar}
        fallbackSeed={openid || 'user'}
        alt={userInfo?.nickname || '用户'}
        className={className}
        size={size}
      />
    </div>
  )
}

interface UserNameProps {
  openid: string | undefined
  fallback?: string
}

/**
 * 用户名组件 - 自动获取用户信息并显示真实昵称
 */
export const UserName = ({ openid, fallback = '匿名用户' }: UserNameProps) => {
  const { userInfo } = useUserInfo(openid)

  return <>{userInfo?.nickname || fallback}</>
}

