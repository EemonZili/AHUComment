import { useState, useEffect } from 'react'
import { downloadPostPicture } from '@/services/post'
import { imageCacheManager } from '@/utils/imageCache'

interface PostImageProps {
  src: string | undefined
  alt: string
  className?: string
}

/**
 * 帖子图片组件 - 通过API下载图片，支持本地缓存
 */
export const PostImage = ({ src, alt, className }: PostImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!src) {
      setLoading(false)
      setError(true)
      return
    }

    let objectUrl: string | null = null

    const loadImage = async () => {
      try {
        setLoading(true)
        setError(false)

        // 1. 先尝试从缓存中获取
        const cachedBlob = await imageCacheManager.getImage(src)

        if (cachedBlob) {
          // 缓存命中
          console.log('Image loaded from cache:', src)
          objectUrl = URL.createObjectURL(cachedBlob)
          setImageUrl(objectUrl)
          setLoading(false)
          return
        }

        // 2. 缓存未命中，从服务器下载
        console.log('Image not in cache, downloading:', src)
        const blob = await downloadPostPicture(src)

        // 3. 保存到缓存
        await imageCacheManager.saveImage(src, blob)
        console.log('Image saved to cache:', src)

        // 4. 显示图片
        objectUrl = URL.createObjectURL(blob)
        setImageUrl(objectUrl)
      } catch (err) {
        console.error('Failed to load image:', err)
        // 如果下载失败，尝试直接使用URL
        setImageUrl(src)
      } finally {
        setLoading(false)
      }
    }

    loadImage()

    // 清理函数
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [src])

  if (!src || error) {
    return (
      <div className={className} style={{
        background: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontSize: '0.9rem'
      }}>
        暂无图片
      </div>
    )
  }

  if (loading) {
    return (
      <div className={className} style={{
        background: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontSize: '0.9rem'
      }}>
        加载中...
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  )
}
