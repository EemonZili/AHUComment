/**
 * 图片缓存管理工具 - 使用 IndexedDB 缓存图片数据
 */

const DB_NAME = 'ImageCacheDB'
const STORE_NAME = 'images'
const DB_VERSION = 1
const CACHE_EXPIRY_DAYS = 7 // 缓存过期时间（天）

interface CachedImage {
  url: string
  blob: Blob
  timestamp: number
}

class ImageCacheManager {
  private db: IDBDatabase | null = null

  /**
   * 初始化数据库
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建对象存储（如果不存在）
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'url' })
          objectStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  /**
   * 检查缓存是否过期
   */
  private isExpired(timestamp: number): boolean {
    const now = Date.now()
    const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    return now - timestamp > expiryTime
  }

  /**
   * 从缓存中获取图片
   */
  async getImage(url: string): Promise<Blob | null> {
    try {
      const db = await this.initDB()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly')
        const objectStore = transaction.objectStore(STORE_NAME)
        const request = objectStore.get(url)

        request.onsuccess = () => {
          const result = request.result as CachedImage | undefined

          if (!result) {
            resolve(null)
            return
          }

          // 检查是否过期
          if (this.isExpired(result.timestamp)) {
            // 过期了，删除缓存
            this.deleteImage(url)
            resolve(null)
            return
          }

          resolve(result.blob)
        }

        request.onerror = () => {
          reject(new Error('Failed to get image from cache'))
        }
      })
    } catch (error) {
      console.error('Error getting image from cache:', error)
      return null
    }
  }

  /**
   * 将图片保存到缓存
   */
  async saveImage(url: string, blob: Blob): Promise<void> {
    try {
      const db = await this.initDB()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const objectStore = transaction.objectStore(STORE_NAME)

        const cachedImage: CachedImage = {
          url,
          blob,
          timestamp: Date.now(),
        }

        const request = objectStore.put(cachedImage)

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = () => {
          reject(new Error('Failed to save image to cache'))
        }
      })
    } catch (error) {
      console.error('Error saving image to cache:', error)
    }
  }

  /**
   * 删除指定图片缓存
   */
  async deleteImage(url: string): Promise<void> {
    try {
      const db = await this.initDB()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const objectStore = transaction.objectStore(STORE_NAME)
        const request = objectStore.delete(url)

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = () => {
          reject(new Error('Failed to delete image from cache'))
        }
      })
    } catch (error) {
      console.error('Error deleting image from cache:', error)
    }
  }

  /**
   * 清空所有缓存
   */
  async clearAll(): Promise<void> {
    try {
      const db = await this.initDB()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const objectStore = transaction.objectStore(STORE_NAME)
        const request = objectStore.clear()

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = () => {
          reject(new Error('Failed to clear cache'))
        }
      })
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  /**
   * 清理过期的缓存
   */
  async cleanExpired(): Promise<void> {
    try {
      const db = await this.initDB()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const objectStore = transaction.objectStore(STORE_NAME)
        const request = objectStore.openCursor()

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null

          if (cursor) {
            const cachedImage = cursor.value as CachedImage

            if (this.isExpired(cachedImage.timestamp)) {
              cursor.delete()
            }

            cursor.continue()
          } else {
            resolve()
          }
        }

        request.onerror = () => {
          reject(new Error('Failed to clean expired cache'))
        }
      })
    } catch (error) {
      console.error('Error cleaning expired cache:', error)
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getCacheStats(): Promise<{ count: number; totalSize: number }> {
    try {
      const db = await this.initDB()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly')
        const objectStore = transaction.objectStore(STORE_NAME)
        const request = objectStore.openCursor()

        let count = 0
        let totalSize = 0

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null

          if (cursor) {
            count++
            const cachedImage = cursor.value as CachedImage
            totalSize += cachedImage.blob.size
            cursor.continue()
          } else {
            resolve({ count, totalSize })
          }
        }

        request.onerror = () => {
          reject(new Error('Failed to get cache stats'))
        }
      })
    } catch (error) {
      console.error('Error getting cache stats:', error)
      return { count: 0, totalSize: 0 }
    }
  }
}

// 创建单例
export const imageCacheManager = new ImageCacheManager()

// 页面加载时清理过期缓存
if (typeof window !== 'undefined') {
  imageCacheManager.cleanExpired().catch(console.error)
}
