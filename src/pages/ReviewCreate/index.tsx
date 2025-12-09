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
import { searchPlaces } from '@/services/place'
import { createReview } from '@/services/review'
import { useAuthStore } from '@/store/auth'
import type { PlaceDTO, ReviewCreateDTO, DetailedRatings } from '@/types'
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
  const [searchLoading, setSearchLoading] = useState(false)

  // Place selection
  const [selectedPlace, setSelectedPlace] = useState<PlaceDTO | null>(null)
  const [placeSearchKeyword, setPlaceSearchKeyword] = useState('')
  const [placeSearchResults, setPlaceSearchResults] = useState<PlaceDTO[]>([])
  const [showPlaceSearch, setShowPlaceSearch] = useState(false)

  // Review form data
  const [overallRating, setOverallRating] = useState(5)
  const [detailedRatings, setDetailedRatings] = useState<DetailedRatings>({
    environment: 5,
    service: 5,
    price: 5,
    taste: 5,
  })
  const [showDetailedRatings, setShowDetailedRatings] = useState(false)
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')

  // Pre-select place if placeId is in URL
  useEffect(() => {
    const placeId = searchParams.get('placeId')
    if (placeId) {
      // In a real app, you would fetch the place details
      // For now, we'll just store the ID
      console.log('Pre-selected place ID:', placeId)
    }
  }, [searchParams])

  const handlePlaceSearch = async (keyword: string) => {
    setPlaceSearchKeyword(keyword)
    if (keyword.length < 2) {
      setPlaceSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const results = await searchPlaces(keyword)
      setPlaceSearchResults(results)
    } catch (error) {
      console.error('Place search failed:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handlePlaceSelect = (place: PlaceDTO) => {
    setSelectedPlace(place)
    setShowPlaceSearch(false)
    setPlaceSearchKeyword('')
    setPlaceSearchResults([])
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // In a real app, you would upload these to a server
    // For now, we'll create temporary URLs
    const newImages: string[] = []
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string)
          setImages((prev) => [...prev, event.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
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
    if (!selectedPlace) {
      alert('请选择一个地点')
      return
    }

    if (content.trim().length < 10) {
      alert('点评内容至少需要10个字')
      return
    }

    setLoading(true)
    try {
      const reviewData: ReviewCreateDTO = {
        placeId: selectedPlace.id,
        rating: overallRating,
        detailedRatings: showDetailedRatings ? detailedRatings : undefined,
        content: content.trim(),
        images: images.length > 0 ? images : undefined,
        tags: tags.length > 0 ? tags : undefined,
      }

      const createdReview = await createReview(reviewData)
      alert('点评发布成功！')
      navigate(`/review/${createdReview.id}`)
    } catch (error) {
      console.error('Failed to create review:', error)
      alert('发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const renderStarRating = (
    rating: number,
    onChange: (rating: number) => void,
    size: number = 32
  ) => {
    return (
      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= rating ? styles.starFilled : styles.starEmpty}
            fill={star <= rating ? 'currentColor' : 'none'}
            onClick={() => onChange(star)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
    )
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
        {/* Place Selection */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>选择地点</h2>
          {selectedPlace ? (
            <div className={styles.selectedPlace}>
              <img
                src={selectedPlace.images[0]}
                alt={selectedPlace.name}
                className={styles.selectedPlaceImage}
              />
              <div className={styles.selectedPlaceInfo}>
                <h3 className={styles.selectedPlaceName}>{selectedPlace.name}</h3>
                <div className={styles.selectedPlaceCategory}>
                  <MapPin size={14} />
                  <span>{selectedPlace.category}</span>
                </div>
              </div>
              <button
                className={styles.changePlaceButton}
                onClick={() => {
                  setSelectedPlace(null)
                  setShowPlaceSearch(true)
                }}
              >
                更换
              </button>
            </div>
          ) : (
            <div className={styles.placeSearch}>
              <div className={styles.searchBar}>
                <Search className={styles.searchIcon} size={20} />
                <input
                  type="text"
                  placeholder="搜索地点名称..."
                  className={styles.searchInput}
                  value={placeSearchKeyword}
                  onChange={(e) => handlePlaceSearch(e.target.value)}
                  onFocus={() => setShowPlaceSearch(true)}
                />
              </div>
              {showPlaceSearch && placeSearchResults.length > 0 && (
                <div className={styles.searchResults}>
                  {placeSearchResults.map((place) => (
                    <div
                      key={place.id}
                      className={styles.searchResultItem}
                      onClick={() => handlePlaceSelect(place)}
                    >
                      <img src={place.images[0]} alt={place.name} className={styles.resultImage} />
                      <div className={styles.resultInfo}>
                        <div className={styles.resultName}>{place.name}</div>
                        <div className={styles.resultCategory}>{place.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {searchLoading && (
                <div className={styles.searchLoading}>
                  <Loading size="sm" />
                  <span>搜索中...</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Overall Rating */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>综合评分</h2>
          <div className={styles.ratingContainer}>
            {renderStarRating(overallRating, setOverallRating)}
            <span className={styles.ratingText}>{overallRating} 分</span>
          </div>
        </section>

        {/* Detailed Ratings */}
        <section className={styles.section}>
          <div className={styles.detailedRatingsHeader}>
            <h2 className={styles.sectionTitle}>详细评分</h2>
            <button
              className={styles.toggleButton}
              onClick={() => setShowDetailedRatings(!showDetailedRatings)}
            >
              {showDetailedRatings ? '收起' : '展开'}
            </button>
          </div>
          {showDetailedRatings && (
            <div className={styles.detailedRatings}>
              {Object.entries({
                environment: '环境',
                service: '服务',
                price: '价格',
                taste: '味道',
              }).map(([key, label]) => (
                <div key={key} className={styles.detailedRatingItem}>
                  <span className={styles.detailedRatingLabel}>{label}</span>
                  {renderStarRating(
                    detailedRatings[key as keyof DetailedRatings],
                    (rating) =>
                      setDetailedRatings((prev) => ({
                        ...prev,
                        [key]: rating,
                      })),
                    24
                  )}
                </div>
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
            {images.map((image, index) => (
              <div key={index} className={styles.imagePreview}>
                <img src={image} alt={`Upload ${index + 1}`} />
                <button
                  className={styles.removeImageButton}
                  onClick={() => handleRemoveImage(index)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {images.length < 9 && (
              <label className={styles.uploadButton}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <Upload size={32} />
                <span>上传图片</span>
              </label>
            )}
          </div>
          <p className={styles.uploadHint}>最多上传9张图片</p>
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
          disabled={loading || !selectedPlace || content.trim().length < 10}
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
