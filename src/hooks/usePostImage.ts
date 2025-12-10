import { useState, useEffect } from 'react'
import { useImageCache } from '@/store/imageCache'

/**
 * Custom hook to handle post image loading with caching
 * Downloads images via /review/downLoadPicture API
 * @param imageUrl - The server image URL to download (from image field)
 * @returns The local blob URL or empty string if failed
 */
export function usePostImage(imageUrl?: string) {
  const [displayUrl, setDisplayUrl] = useState<string>('')
  const { fetchImage, getImage } = useImageCache()

  useEffect(() => {
    // If no image URL provided, return empty
    if (!imageUrl) {
      setDisplayUrl('')
      return
    }

    // Check cache first
    const cached = getImage(imageUrl)
    if (cached) {
      setDisplayUrl(cached)
      return
    }

    // Fetch image with caching
    fetchImage(imageUrl).then((blobUrl) => {
      if (blobUrl) {
        setDisplayUrl(blobUrl)
      } else {
        setDisplayUrl('')
      }
    })
  }, [imageUrl, fetchImage, getImage])

  return displayUrl
}
