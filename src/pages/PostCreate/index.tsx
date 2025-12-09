import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react'
import {
  listPostCategories,
  addPost,
  uploadPostPicture,
} from '@/services'
import { useAuthStore } from '@/store/auth'
import type { PostCategoryDTO } from '@/types'
import { Button, Loading } from '@/components'
import styles from './PostCreate.module.css'

export default function PostCreate() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<PostCategoryDTO[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number>(0)
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await listPostCategories()
        setCategories(data)
        if (data.length > 0) {
          setSelectedCategory(data[0].id || 0)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Handle image selection
  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // Create local preview
    const localUrl = URL.createObjectURL(file)
    setImageUrl(localUrl)
    setImageFile(file)
  }

  // Remove image
  const handleRemoveImage = () => {
    if (imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl)
    }
    setImageUrl('')
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Submit post
  const handleSubmit = async () => {
    if (!user) {
      alert('请先登录')
      return
    }

    if (!content.trim()) {
      alert('请输入贴文内容')
      return
    }

    if (selectedCategory === 0) {
      alert('请选择贴文分区')
      return
    }

    setSubmitting(true)
    try {
      let uploadedImageUrl = ''

      // Upload image if exists
      if (imageFile) {
        setUploading(true)
        try {
          uploadedImageUrl = await uploadPostPicture(imageFile)
          console.log('Image uploaded:', uploadedImageUrl)
        } catch (error) {
          console.error('Failed to upload image:', error)
          alert('图片上传失败，将继续发布文字内容')
        } finally {
          setUploading(false)
        }
      }

      // Create post
      await addPost(user.openid, selectedCategory, content, {
        ownerOpenid: user.openid,
        categoryId: selectedCategory,
        context: content,
        image: uploadedImageUrl,
      })

      alert('发布成功！')
      navigate('/posts')
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('发布失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className={styles.error}>
        <p>请先登录</p>
        <Button onClick={() => navigate('/login')}>去登录</Button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h1>发布贴文</h1>
        <Button onClick={handleSubmit} disabled={submitting || uploading}>
          {submitting ? '发布中...' : '发布'}
        </Button>
      </div>

      <div className={styles.content}>
        {/* Category Selection */}
        <div className={styles.section}>
          <h3>选择分区</h3>
          <div className={styles.categories}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryBtn} ${
                  selectedCategory === category.id ? styles.active : ''
                }`}
                onClick={() => setSelectedCategory(category.id || 0)}
                style={{
                  borderColor:
                    selectedCategory === category.id ? category.color : '#e0e0e0',
                  color:
                    selectedCategory === category.id ? category.color : '#666',
                }}
              >
                {category.categoryName}
              </button>
            ))}
          </div>
        </div>

        {/* Content Input */}
        <div className={styles.section}>
          <h3>贴文内容</h3>
          <textarea
            placeholder="分享你的想法..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.textarea}
            maxLength={500}
          />
          <div className={styles.charCount}>
            {content.length} / 500
          </div>
        </div>

        {/* Image Upload */}
        <div className={styles.section}>
          <h3>添加图片（可选）</h3>

          {imageUrl ? (
            <div className={styles.imagePreview}>
              <img src={imageUrl} alt="预览" />
              <button className={styles.removeBtn} onClick={handleRemoveImage}>
                <X size={20} />
              </button>
              {uploading && (
                <div className={styles.uploadingOverlay}>
                  <Loading />
                  <p>上传中...</p>
                </div>
              )}
            </div>
          ) : (
            <button className={styles.uploadBtn} onClick={handleImageClick}>
              <ImageIcon size={32} />
              <span>点击上传图片</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Tips */}
        <div className={styles.tips}>
          <h4>发布提示</h4>
          <ul>
            <li>请选择合适的分区</li>
            <li>内容应真实、客观</li>
            <li>图片大小不超过 5MB</li>
            <li>禁止发布违规内容</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
