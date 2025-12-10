import { useUserInfo } from '@/hooks'
import { Avatar } from '@/components'

interface UserAvatarProps {
  openid: string | undefined
  className?: string
  size?: number
}

/**
 * 用户头像组件 - 自动获取用户信息并显示真实头像
 */
export const UserAvatar = ({ openid, className, size }: UserAvatarProps) => {
  const { userInfo } = useUserInfo(openid)

  return (
    <Avatar
      src={userInfo?.avatar}
      fallbackSeed={openid || 'user'}
      alt={userInfo?.nickname || '用户'}
      className={className}
    />
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
