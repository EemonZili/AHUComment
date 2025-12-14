import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Database, HardDrive } from 'lucide-react'
import { imageCacheManager } from '@/utils/imageCache'
import styles from './CacheManager.module.css'

export default function CacheManager() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ count: 0, totalSize: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const cacheStats = await imageCacheManager.getCacheStats()
    setStats(cacheStats)
  }

  const handleClearAll = async () => {
    if (!confirm('确定要清空所有缓存吗？这将删除所有已缓存的图片。')) {
      return
    }

    setLoading(true)
    try {
      await imageCacheManager.clearAll()
      await loadStats()
      alert('缓存已清空')
    } catch (error) {
      console.error('Failed to clear cache:', error)
      alert('清空缓存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCleanExpired = async () => {
    setLoading(true)
    try {
      await imageCacheManager.cleanExpired()
      await loadStats()
      alert('已清理过期缓存')
    } catch (error) {
      console.error('Failed to clean expired cache:', error)
      alert('清理过期缓存失败')
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.headerTitle}>缓存管理</h1>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <Database className={styles.statIcon} size={32} />
          <div className={styles.statValue}>{stats.count}</div>
          <div className={styles.statLabel}>已缓存图片</div>
        </div>
        <div className={styles.statCard}>
          <HardDrive className={styles.statIcon} size={32} />
          <div className={styles.statValue}>{formatSize(stats.totalSize)}</div>
          <div className={styles.statLabel}>占用空间</div>
        </div>
      </div>

      {/* Info Section */}
      <div className={styles.infoSection}>
        <h3 className={styles.sectionTitle}>缓存说明</h3>
        <ul className={styles.infoList}>
          <li>图片首次加载时会自动缓存到本地浏览器</li>
          <li>缓存的图片在再次访问时会直接从本地加载，节省流量</li>
          <li>缓存有效期为 7 天，过期后会自动清理</li>
          <li>缓存存储在浏览器的 IndexedDB 中，不占用服务器空间</li>
          <li>清空缓存后，图片需要重新从服务器下载</li>
        </ul>
      </div>

      {/* Actions Section */}
      <div className={styles.actionsSection}>
        <h3 className={styles.sectionTitle}>缓存操作</h3>
        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={handleCleanExpired}
            disabled={loading}
          >
            <Trash2 size={20} />
            <span>清理过期缓存</span>
          </button>
          <button
            className={`${styles.actionButton} ${styles.danger}`}
            onClick={handleClearAll}
            disabled={loading}
          >
            <Trash2 size={20} />
            <span>清空所有缓存</span>
          </button>
        </div>
      </div>

      {/* Benefits Section */}
      <div className={styles.benefitsSection}>
        <h3 className={styles.sectionTitle}>缓存优势</h3>
        <div className={styles.benefitsList}>
          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>🚀</div>
            <div className={styles.benefitContent}>
              <div className={styles.benefitTitle}>加载更快</div>
              <div className={styles.benefitDesc}>已缓存的图片瞬间加载</div>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>💰</div>
            <div className={styles.benefitContent}>
              <div className={styles.benefitTitle}>节省流量</div>
              <div className={styles.benefitDesc}>减少重复下载，降低流量消耗</div>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>⚡</div>
            <div className={styles.benefitContent}>
              <div className={styles.benefitTitle}>减轻服务器负担</div>
              <div className={styles.benefitDesc}>减少服务器带宽压力</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
