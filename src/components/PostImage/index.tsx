import { usePostImage } from '@/hooks'

interface PostImageProps {
  src?: string
  alt?: string
  className?: string
  onError?: () => void
}

export default function PostImage({
  src,
  alt = 'Post image',
  className = '',
  onError,
}: PostImageProps) {
  const imageUrl = usePostImage(src)

  // 如果图片加载失败或没有图片，不显示
  if (!imageUrl) {
    return null
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={onError}
    />
  )
}
