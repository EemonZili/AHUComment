import { useState, useEffect, useRef } from 'react'
import { downLoadAvatar } from '@/services/user'

/**
 * Custom hook to handle avatar loading with blob URL conversion
 * @param avatarUrl - The server avatar URL to download
 * @param fallbackSeed - Seed for generating fallback avatar (typically openid or username)
 * @returns The local blob URL or fallback avatar URL
 */
export function useAvatar(avatarUrl?: string, fallbackSeed: string = 'default') {
  const [displayUrl, setDisplayUrl] = useState<string>(
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackSeed}`
  )
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    // If no avatar URL provided, use fallback
    if (!avatarUrl) {
      setDisplayUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackSeed}`)
      return
    }

    let isActive = true

    const loadAvatar = async () => {
      try {
        const blob = await downLoadAvatar(avatarUrl)
        if (!isActive) return

        const objUrl = URL.createObjectURL(blob)

        // Clean up previous object URL
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current)
        }

        objectUrlRef.current = objUrl
        setDisplayUrl(objUrl)
      } catch (error) {
        console.error('Failed to load avatar:', error)
        // Keep fallback URL on error
        if (isActive) {
          setDisplayUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackSeed}`)
        }
      }
    }

    loadAvatar()

    return () => {
      isActive = false
      // Clean up object URL when component unmounts or avatar changes
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [avatarUrl, fallbackSeed])

  return displayUrl
}
