import { useState, useEffect } from 'react'
import { useImageCache } from '@/store/imageCache'

/**
 * Custom hook to handle avatar loading with caching
 * @param avatarUrl - The server avatar URL to download
 * @param fallbackSeed - Seed for generating fallback avatar (typically openid or username)
 * @returns The local blob URL or fallback avatar URL
 */
export function useAvatar(avatarUrl?: string, fallbackSeed: string = 'default') {
  const fallbackUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackSeed}`
  const [displayUrl, setDisplayUrl] = useState<string>(fallbackUrl)
  const { fetchAvatar, getAvatar } = useImageCache()

  useEffect(() => {
    // If no avatar URL provided, use fallback
    if (!avatarUrl) {
      setDisplayUrl(fallbackUrl)
      return
    }

    // Check cache first
    const cached = getAvatar(avatarUrl)
    if (cached) {
      setDisplayUrl(cached)
      return
    }

    // Fetch avatar with caching
    fetchAvatar(avatarUrl).then((blobUrl) => {
      if (blobUrl) {
        setDisplayUrl(blobUrl)
      } else {
        setDisplayUrl(fallbackUrl)
      }
    })
  }, [avatarUrl, fallbackSeed, fetchAvatar, getAvatar, fallbackUrl])

  return displayUrl
}
