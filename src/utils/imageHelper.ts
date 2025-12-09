import { downLoadAvatar } from '@/services/user'
import { downloadPostPicture } from '@/services'

// 图片URL缓存
const imageCache = new Map<string, string>()

/**
 * 获取用户头像的完整URL
 * @param avatarUrl 头像URL或openid
 * @returns 完整的图片URL或fallback URL
 */
export const getAvatarUrl = async (avatarUrl?: string): Promise<string> => {
  if (!avatarUrl) {
    return generateDicebearAvatar('default')
  }

  // 如果已经是完整URL，直接返回
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl
  }

  // 检查缓存
  if (imageCache.has(avatarUrl)) {
    return imageCache.get(avatarUrl)!
  }

  try {
    // 使用下载头像接口
    const blob = await downLoadAvatar(avatarUrl)
    const url = URL.createObjectURL(blob)
    imageCache.set(avatarUrl, url)
    return url
  } catch (error) {
    console.error('Failed to load avatar:', error)
    // 失败时使用 dicebear 生成头像
    return generateDicebearAvatar(avatarUrl)
  }
}

/**
 * 获取帖子图片的完整URL
 * @param imageUrl 图片URL
 * @returns 完整的图片URL或空字符串
 */
export const getPostImageUrl = async (imageUrl?: string): Promise<string> => {
  if (!imageUrl) {
    return ''
  }

  // 如果已经是完整URL，直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // 检查缓存
  if (imageCache.has(imageUrl)) {
    return imageCache.get(imageUrl)!
  }

  try {
    // 使用下载图片接口
    const blob = await downloadPostPicture(imageUrl)
    const url = URL.createObjectURL(blob)
    imageCache.set(imageUrl, url)
    return url
  } catch (error) {
    console.error('Failed to load image:', error)
    // 失败时返回空字符串，不显示图片
    return ''
  }
}

/**
 * 使用 DiceBear API 生成头像
 * @param seed 用于生成头像的种子（通常是 openid 或用户名）
 * @returns DiceBear 头像URL
 */
export const generateDicebearAvatar = (seed: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
}

/**
 * 清理图片缓存
 */
export const clearImageCache = () => {
  imageCache.forEach((url) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
  imageCache.clear()
}
