import { useState, useEffect, useRef } from 'react'
import { downloadPostPicture } from '@/services'

/**
 * Custom hook to handle post image loading with blob URL conversion
 * Downloads images via /review/downLoadPicture API
 * @param imageUrl - The server image URL to download (from image field)
 * @returns The local blob URL or empty string if failed
 */
export function usePostImage(imageUrl?: string) {
  const [displayUrl, setDisplayUrl] = useState<string>('')
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    // If no image URL provided, return empty
    if (!imageUrl) {
      setDisplayUrl('')
      return
    }

    let isActive = true

    const loadImage = async () => {
      try {
        // Download image using the /review/downLoadPicture API
        // Pass the full URL (from image field) as the url parameter
        const blob = await downloadPostPicture(imageUrl)
        if (!isActive) return

        const objUrl = URL.createObjectURL(blob)

        // Clean up previous object URL
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current)
        }

        objectUrlRef.current = objUrl
        setDisplayUrl(objUrl)
      } catch (error) {
        console.error('Failed to load post image:', error)
        // Return empty string on error - don't display image
        if (isActive) {
          setDisplayUrl('')
        }
      }
    }

    loadImage()

    return () => {
      isActive = false
      // Clean up object URL when component unmounts or image changes
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [imageUrl])

  return displayUrl
}
