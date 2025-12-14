import { useAvatar } from '@/hooks'
import styles from './Avatar.module.css'

interface AvatarProps {
  src?: string
  alt?: string
  fallbackSeed?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | number
  onClick?: (e: React.MouseEvent) => void
  style?: React.CSSProperties
}

export default function Avatar({
  src,
  alt = 'Avatar',
  fallbackSeed = 'default',
  className = '',
  size = 'md',
  onClick,
  style
}: AvatarProps) {
  const avatarUrl = useAvatar(src, fallbackSeed)

  // 如果size是数字，使用inline style
  const sizeStyle = typeof size === 'number'
    ? { width: `${size}px`, height: `${size}px`, ...style }
    : style

  const sizeClass = typeof size === 'string' ? styles[size] : ''

  return (
    <img
      src={avatarUrl}
      alt={alt}
      className={`${styles.avatar} ${sizeClass} ${className}`}
      onClick={onClick}
      style={{
        ...sizeStyle,
        cursor: onClick ? 'pointer' : undefined,
        userSelect: 'none',
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(e as any)
        }
      } : undefined}
    />
  )
}
