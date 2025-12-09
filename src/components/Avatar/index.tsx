import { useAvatar } from '@/hooks'
import styles from './Avatar.module.css'

interface AvatarProps {
  src?: string
  alt?: string
  fallbackSeed?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Avatar({
  src,
  alt = 'Avatar',
  fallbackSeed = 'default',
  className = '',
  size = 'md'
}: AvatarProps) {
  const avatarUrl = useAvatar(src, fallbackSeed)

  return (
    <img
      src={avatarUrl}
      alt={alt}
      className={`${styles.avatar} ${styles[size]} ${className}`}
    />
  )
}
