import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  Image as ImageIcon,
  X,
  Upload,
  MapPin,
  Search,
  Tag as TagIcon,
  Send,
} from 'lucide-react'
import { listPostCategories, addPost, uploadPostPicture } from '@/services'
import { useAuthStore } from '@/store/auth'
import type { PostCategoryDTO } from '@/types'
import { Loading } from '@/components'
import styles from './ReviewCreate.module.css'

const COMMON_TAGS = [
  '环境优美', '服务周到', '价格实惠', '味道不错',
  '安静舒适', '设施齐全', '交通便利', '推荐',
  '人气爆棚', '性价比高', '值得再来', '适合学习',
]

export default function ReviewCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  // Category selection
  const [categories, setCategories] = useState<PostCategoryDTO[]>([])
  const [selectedCategory, setSelectedCategory] = useState<PostCategoryDTO | null>(null)

  // Review form data
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string>('') // 用于显示的图片（本地 blob URL）
  const [serverImage, setServerImage] = useState<string>('') // 服务器返回的 URL（用于提交）
  const [uploadingImage, setUploadingImage] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true)
      try {
        const data = await listPostCategories()
        setCategories(data)
        // Auto-select first category if available
        if (data.length > 0) {
          setSelectedCategory(data[0])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleCategorySelect = (category: PostCategoryDTO) => {
    setSelectedCategory(category)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 立即显示本地预览
    const localUrl = URL.createObjectURL(file)
    setImage(localUrl)

    setUploadingImage(true)
    try {
      // 上传图片到服务器
      const imageUrl = await uploadPostPicture(file)
      setServerImage(imageUrl)
      alert('图片上传成功！')
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('图片上传失败，请重试')
      // 上传失败则清除本地预览
      if (localUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localUrl)
      }
      setImage('')
    } finally {
      setUploadingImage(false)
      // 重置 input value，允许重复选择同一文件
      e.target.value = ''
    }
  }

  const handleRemoveImage = () => {
    // 如果是 blob URL，需要释放
    if (image.startsWith('blob:')) {
      URL.revokeObjectURL(image)
    }
    setImage('')
    setServerImage('')
  }

  const handleToggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleAddCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags((prev) => [...prev, customTag.trim()])
      setCustomTag('')
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!selectedCategory) {
      alert('请选择一个分区')
      return
    }

    if (!user?.openid) {
      alert('请先登录')
      return
    }

    if (content.trim().length < 10) {
      alert('点评内容至少需要10个字')
      return
    }

    setLoading(true)
    try {
      const postData = {
        categoryId: selectedCategory.id,
        context: content.trim(),
        image: serverImage || '', // 使用服务器 URL
        ownerOpenid: user.openid,
      }

      const createdPost = await addPost(
        user.openid,
        selectedCategory.id || 0,
        content.trim(),
        postData as any
      )

      console.log('创建的帖子返回:', createdPost)

      // 清理 blob URL
      if (image.startsWith('blob:')) {
        URL.revokeObjectURL(image)
      }

      alert('点评发布成功！')

      // 跳转到新帖子详情页
      // 检查不同的ID字段
      const postId = createdPost?.id || createdPost?.postId || (createdPost as any)?.data?.id
      console.log('提取的帖子ID:', postId)

      if (postId) {
        console.log('跳转到详情页:', `/review/${postId}`)
        navigate(`/review/${postId}`)
      } else {
        console.log('没有找到帖子ID，跳转到首页')
        navigate('/')
      }
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.headerTitle}>发布点评</h1>
        <div style={{ width: 40 }} />
      </div>

      <div className={styles.content}>
        {/* Category Selection */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>选择分区</h2>
          {categoriesLoading ? (
            <div className={styles.searchLoading}>
              <Loading size="sm" />
              <span>加载中...</span>
            </div>
          ) : (
            <div className={styles.categoryGrid}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`${styles.categoryButton} ${selectedCategory?.id === category.id ? styles.categoryActive : ''}`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <MapPin size={18} />
                  <span>{category.categoryName}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Content */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>点评内容</h2>
          <textarea
            className={styles.contentTextarea}
            placeholder="分享你的体验吧... (至少10个字)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
          />
          <div className={styles.charCount}>
            {content.length} / 1000 字
          </div>
        </section>

        {/* Images */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>上传图片</h2>
          <div className={styles.imageUpload}>
            {image && (
              <div className={styles.imagePreview}>
                <img src={image} alt="Upload" />
                <button
                  className={styles.removeImageButton}
                  onClick={handleRemoveImage}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {!image && (
              <label className={`${styles.uploadButton} ${uploadingImage ? styles.uploading : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  style={{ display: 'none' }}
                />
                {uploadingImage ? (
                  <>
                    <Loading size="sm" />
                    <span>上传中...</span>
                  </>
                ) : (
                  <>
                    <Upload size={32} />
                    <span>上传图片</span>
                  </>
                )}
              </label>
            )}
          </div>
          <p className={styles.uploadHint}>只能上传一张图片</p>
        </section>

        {/* Tags */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>添加标签</h2>
          <div className={styles.tagsContainer}>
            {COMMON_TAGS.map((tag) => (
              <button
                key={tag}
                className={`${styles.tagButton} ${tags.includes(tag) ? styles.tagActive : ''}`}
                onClick={() => handleToggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className={styles.customTagInput}>
            <TagIcon size={18} className={styles.tagIcon} />
            <input
              type="text"
              placeholder="自定义标签"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddCustomTag()
                }
              }}
              className={styles.tagInput}
            />
            <button className={styles.addTagButton} onClick={handleAddCustomTag}>
              添加
            </button>
          </div>
          {tags.length > 0 && (
            <div className={styles.selectedTags}>
              <span className={styles.selectedTagsLabel}>已选标签：</span>
              {tags.map((tag) => (
                <span key={tag} className={styles.selectedTag}>
                  {tag}
                  <X size={14} onClick={() => handleToggleTag(tag)} />
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Submit Button */}
        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={loading || !selectedCategory || content.trim().length < 10}
        >
          {loading ? (
            <>
              <Loading size="sm" />
              <span>发布中...</span>
            </>
          ) : (
            <>
              <Send size={20} />
              <span>发布点评</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
