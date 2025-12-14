import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Settings,
  Camera,
  BarChart3,
  FileText,
  ThumbsUp,
  Bookmark,
  Star,
  Eye,
  ChevronRight,
  Edit2,
  Lock,
  AlertCircle,
  MessageCircle,
  Database,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { updateUser, uploadAvatar, getUserInfo, downLoadAvatar } from '@/services/user'
import { Button, Input, Loading } from '@/components'
import styles from './Profile.module.css'

interface FormData {
  nickname: string
  sex: string  // 改为 sex
  bio: string
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [serverAvatarUrl, setServerAvatarUrl] = useState<string>(user?.avatar || '')
  const [avatarChanged, setAvatarChanged] = useState<boolean>(false)
  const downloadedAvatarUrlRef = useRef<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    nickname: user?.nickname || '',
    sex: user?.sex || '男',  // 改为 sex
    bio: user?.bio || '',
  })

  const [initialData, setInitialData] = useState<FormData>({
    nickname: user?.nickname || '',
    sex: user?.sex || '男',  // 改为 sex
    bio: user?.bio || '',
  })

  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user?.openid || 'default')  // 改为 openid
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges =
      formData.nickname !== initialData.nickname ||
      formData.sex !== initialData.sex ||
      formData.bio !== initialData.bio ||
      avatarChanged

    setHasUnsavedChanges(hasChanges)
  }, [formData, initialData, avatarChanged])

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Create a local URL for instant preview
    const localPreviewUrl = URL.createObjectURL(file)
    const previousAvatarUrl = avatarUrl // Store previous URL to revert on failure
    setAvatarUrl(localPreviewUrl) // Show local preview immediately

    setUploading(true)
    try {
      // API returns a string URL
      const serverUrl = await uploadAvatar(file)
      setAvatarUrl(serverUrl)
      setServerAvatarUrl(serverUrl)
      setAvatarChanged(true)
      URL.revokeObjectURL(localPreviewUrl) // Clean up the local URL
      alert('头像上传成功！')
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      setAvatarUrl(previousAvatarUrl) // On failure, revert to the previous avatar
      URL.revokeObjectURL(localPreviewUrl) // Clean up the local URL
      alert('头像上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  // Handle form input change
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle save
  const handleSave = async () => {
    if (!user?.openid) {
      alert('用户信息错误，请重新登录')
      return
    }

    setSaving(true)
    try {
      // 调用 updateUser API（返回 boolean）
      await updateUser({
        id: user.id,
        openid: user.openid,
        nickname: formData.nickname,
        sex: formData.sex,  // 改为 sex
        avatar: serverAvatarUrl || user.avatar || '',
        bio: formData.bio,
      })

      // 更新成功后，重新获取用户信息
      const updatedUserInfo = await getUserInfo(user.openid)
      setUser({
        ...updatedUserInfo,
        isAdmin: user?.isAdmin || false,
      })

      // Download the new avatar and set it
      if (updatedUserInfo.avatar) {
        const avatarBlob = await downLoadAvatar(updatedUserInfo.avatar)
        const newObjectUrl = URL.createObjectURL(avatarBlob)
        // Revoke previous object URL to avoid memory leaks
        if (downloadedAvatarUrlRef.current) {
          URL.revokeObjectURL(downloadedAvatarUrlRef.current)
        }
        downloadedAvatarUrlRef.current = newObjectUrl
        setAvatarUrl(newObjectUrl)
        setServerAvatarUrl(updatedUserInfo.avatar)
      }

      setInitialData(formData)
      setAvatarChanged(false)
      alert('保存成功！')
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  // Cleanup created object URLs on component unmount
  useEffect(() => {
    return () => {
      if (downloadedAvatarUrlRef.current) {
        URL.revokeObjectURL(downloadedAvatarUrlRef.current)
        downloadedAvatarUrlRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const urlToFetch = serverAvatarUrl || user?.avatar
    if (!urlToFetch) return

    let active = true
    ;(async () => {
      try {
        const blob = await downLoadAvatar(urlToFetch)
        if (!active) return
        const objUrl = URL.createObjectURL(blob)
        if (downloadedAvatarUrlRef.current) {
          URL.revokeObjectURL(downloadedAvatarUrlRef.current)
        }
        downloadedAvatarUrlRef.current = objUrl
        setAvatarUrl(objUrl)
      } catch (e) {
        // Failed to download avatar, keep using fallback
        console.error('Failed to download avatar:', e)
      }
    })()

    return () => {
      active = false
    }
  }, [serverAvatarUrl, user?.avatar])

  // Handle cancel
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('你有未保存的更改，确定要取消吗？')) {
        setFormData(initialData)
        setAvatarUrl(
          user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user?.openid || 'default')
        )
      }
    }
  }

  // Handle back
  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('你有未保存的更改，确定要离开吗？')) {
        navigate(-1)
      }
    } else {
      navigate(-1)
    }
  }

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout()
      navigate('/login')
    }
  }

  const nicknameLength = formData.nickname.length
  const bioLength = formData.bio.length

  return (
    <div className={styles.profileContainer}>
      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className={styles.unsavedWarning}>
          <AlertCircle size={16} />
          你有未保存的更改
        </div>
      )}

      {/* Top Navigation */}
      <div className={styles.topNav}>
        <div className={styles.backBtn} onClick={handleBack}>
          <ArrowLeft size={18} />
          <span>返回</span>
        </div>
        <h1 className={styles.pageTitle}>个人中心</h1>
        <div className={styles.settingsBtn} onClick={() => alert('设置功能（演示）')}>
          <Settings size={20} />
        </div>
      </div>

      {/* Profile Content */}
      <div className={styles.profileContent}>
        {/* Avatar Section */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
            <img src={avatarUrl} alt="用户头像" className={styles.avatar} />
            <div className={styles.avatarOverlay}>
              {uploading ? <Loading size="sm" /> : <Camera size={32} className={styles.uploadIcon} />}
            </div>
          </div>
          <p className={styles.changeAvatarText}>点击更换头像</p>
          <h2 className={styles.username}>{formData.nickname}</h2>
          <span className={styles.userBadge}>普通用户</span>
        </div>

        {/* Stats Section */}
        <div className={styles.statsSection}>
          <div className={styles.statsTitle}>
            <BarChart3 size={16} />
            <span>我的数据</span>
          </div>
          <div className={styles.statsGrid}>
            <div className={styles.statItem} onClick={() => alert('我的点评')}>
              <FileText className={styles.statIcon} size={24} />
              <div className={styles.statNumber}>15</div>
              <div className={styles.statLabel}>篇点评</div>
            </div>
            <div className={styles.statItem} onClick={() => alert('我的点赞')}>
              <ThumbsUp className={styles.statIcon} size={24} />
              <div className={styles.statNumber}>128</div>
              <div className={styles.statLabel}>个赞</div>
            </div>
            <div className={styles.statItem} onClick={() => alert('我的收藏')}>
              <Bookmark className={styles.statIcon} size={24} />
              <div className={styles.statNumber}>23</div>
              <div className={styles.statLabel}>个收藏</div>
            </div>
          </div>
        </div>

        {/* Basic Info Card */}
        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>基本信息</h3>

          {/* Nickname */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              昵称 <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.formInput}
                value={formData.nickname}
                maxLength={20}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
              />
              <Edit2 className={styles.inputIcon} size={16} />
            </div>
            <div
              className={`${styles.charCounter} ${nicknameLength >= 19 ? styles.error : nicknameLength >= 16 ? styles.warning : ''}`}
            >
              {nicknameLength}/20
            </div>
          </div>

          {/* Gender */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              性别 <span className={styles.required}>*</span>
            </label>
            <div className={styles.radioGroup}>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  name="sex"
                  id="male"
                  value="男"
                  checked={formData.sex === '男'}
                  onChange={(e) => handleInputChange('sex', e.target.value)}
                />
                <label htmlFor="male" className={styles.radioLabel}>
                  <div className={styles.radioInput}></div>
                  <span className={styles.radioText}>男生</span>
                </label>
              </div>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  name="sex"
                  id="female"
                  value="女"
                  checked={formData.sex === '女'}
                  onChange={(e) => handleInputChange('sex', e.target.value)}
                />
                <label htmlFor="female" className={styles.radioLabel}>
                  <div className={styles.radioInput}></div>
                  <span className={styles.radioText}>女生</span>
                </label>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>个人简介</label>
            <textarea
              className={`${styles.formInput} ${styles.formTextarea}`}
              placeholder="介绍一下你自己吧..."
              maxLength={100}
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
            />
            <div
              className={`${styles.charCounter} ${bioLength >= 95 ? styles.error : bioLength >= 80 ? styles.warning : ''}`}
            >
              {bioLength}/100
            </div>
          </div>

          {/* OpenID (Read-only) */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>微信 OpenID</label>
            <div className={styles.inputWrapper}>
              <input type="text" className={styles.formInput} value={user?.openid} disabled />
              <Lock className={styles.inputIcon} size={16} />
            </div>
          </div>

          {/* Registration Date */}
          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
            <label className={styles.formLabel}>注册时间</label>
            <p className={styles.dateText}>{user?.createTime || '未知'}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.quickLinks}>
          <h3 className={styles.cardTitle}>快捷入口</h3>

          <div className={styles.linkItem} onClick={() => alert('我的点评')}>
            <div className={styles.linkLeft}>
              <FileText className={styles.linkIcon} size={20} />
              <span className={styles.linkText}>我的点评</span>
            </div>
            <ChevronRight className={styles.linkArrow} size={20} />
          </div>

          <div className={styles.linkItem} onClick={() => alert('我的收藏')}>
            <div className={styles.linkLeft}>
              <Star className={styles.linkIcon} size={20} />
              <span className={styles.linkText}>我的收藏</span>
            </div>
            <ChevronRight className={styles.linkArrow} size={20} />
          </div>

          <div className={styles.linkItem} onClick={() => alert('浏览历史')}>
            <div className={styles.linkLeft}>
              <Eye className={styles.linkIcon} size={20} />
              <span className={styles.linkText}>浏览历史</span>
            </div>
            <ChevronRight className={styles.linkArrow} size={20} />
          </div>

          <div className={styles.linkItem} onClick={() => navigate('/cache-manager')}>
            <div className={styles.linkLeft}>
              <Database className={styles.linkIcon} size={20} />
              <span className={styles.linkText}>缓存管理</span>
            </div>
            <ChevronRight className={styles.linkArrow} size={20} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <Button variant="secondary" onClick={handleCancel}>
            取消
          </Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            保存修改
          </Button>
        </div>

        {/* Logout */}
        <div className={styles.logoutSection}>
          <div className={styles.logoutBtn} onClick={handleLogout}>
            退出登录
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarChange}
      />
    </div>
  )
}
