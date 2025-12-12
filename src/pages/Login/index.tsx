import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { School, CheckCircle, AlertCircle, RefreshCw, Check } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { getQRCode, doLogin, getUserInfo } from '@/services/user'
import { createLoginWebSocket } from '@/utils/websocket'
import { Loading } from '@/components'
import styles from './Login.module.css'

type QRState = 'loading' | 'ready' | 'scanned' | 'expired'

export default function Login() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()

  const [qrState, setQrState] = useState<QRState>('loading')
  const [qrCode, setQrCode] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [statusText, setStatusText] = useState('正在生成二维码...')

  // Fetch QR code
  const fetchQRCode = useCallback(async () => {
    setQrState('loading')
    setStatusText('正在生成二维码...')

    try {
      // 生成 sessionId（用于 WebSocket 连接和登录）
      const newSessionId = crypto.randomUUID()

      // 获取二维码 URL（传递 sessionId 作为查询参数）
      const qrCodeUrl = await getQRCode(newSessionId)

      console.log('QR Code URL received:', qrCodeUrl)

      // 检查二维码 URL 是否有效
      if (!qrCodeUrl || qrCodeUrl.includes('ticket=null')) {
        console.error('Invalid QR code URL:', qrCodeUrl)
        setQrState('expired')
        setStatusText('二维码生成失败：后端返回无效的 ticket')
        return
      }

      setQrCode(qrCodeUrl)
      setSessionId(newSessionId)
      setQrState('ready')
      setStatusText('请使用微信扫描二维码')
    } catch (error) {
      console.error('Failed to fetch QR code:', error)
      setQrState('expired')
      setStatusText('二维码获取失败')
    }
  }, [])

  // Handle login success
  const handleLoginSuccess = useCallback(
    async (tokenValue: string, openId?: string) => {
      try {
        setToken(tokenValue)

        // 如果有 openId，传递给 getUserInfo
        const userInfo = await getUserInfo(openId)
        console.log('User info received:', userInfo)

        // 直接使用后端返回的字段，保持一致性
        const mappedUserInfo = {
          id: userInfo.id || 0,
          openid: userInfo.openid || openId || '',
          nickname: userInfo.nickname || '未命名用户',
          sex: userInfo.sex || '男',
          avatar: userInfo.avatar || '',
          bio: userInfo.bio || '',
          createTime: userInfo.createTime,
          isAdmin: (userInfo as any).isAdmin ?? false,
        }

        console.log('Mapped user info:', mappedUserInfo)
        setUser(mappedUserInfo)
        navigate('/')
      } catch (error) {
        console.error('Failed to get user info:', error)
        alert('获取用户信息失败，请重新登录')
      }
    },
    [setToken, setUser, navigate]
  )

  // WebSocket connection
  // WebSocket connection
  useEffect(() => {
    if (!sessionId) return

    // 用于存储扫码确认超时的计时器ID
    let confirmationTimeout: any = null

    const ws = createLoginWebSocket(sessionId)

    ws.connect()

    ws.onMessage((data) => {
      console.log('WebSocket message received:', data)

      // 一旦收到新的消息（如CONFIRMED, EXPIRED等），就清除等待确认的计时器
      if (confirmationTimeout) {
        clearTimeout(confirmationTimeout)
      }

      // 处理后端直接返回的登录成功响应
      if (data.success && data.data && data.data.tokenValue) {
        console.log('Login successful, token received:', data.data.tokenValue)
        const openId = data.data.loginId
        console.log('OpenId (loginId):', openId)
        handleLoginSuccess(data.data.tokenValue, openId)
        return
      }

      // 处理旧格式的消息（兼容）
      if (data.type === 'SCANNED') {
        setQrState('scanned')
        setStatusText('扫码成功，请在手机上确认登录')
        
        // 在用户扫码后，启动一个超时计时器
        // 如果用户在 (例如) 60秒 内未确认，则提示超时
        confirmationTimeout = setTimeout(() => {
          setQrState('expired')
          setStatusText('登录确认超时，请刷新二维码重试')
        }, 60000) // 设置为60秒，5秒对于用户操作来说太短

      } else if (data.type === 'CONFIRMED') {
        const openId = data.openId || data.openid

        if (!openId) {
          console.error('openId not found in WebSocket message:', data)
          setQrState('expired')
          setStatusText('登录失败：未获取到用户信息')
          return
        }

        console.log('Calling doLogin with openId:', openId, 'sessionId:', sessionId)
        doLogin(openId, sessionId)
          .then((response) => {
            console.log('doLogin response:', response)
            handleLoginSuccess(response.tokenValue)
          })
          .catch((error) => {
            console.error('Login failed:', error)
            setQrState('expired')
            setStatusText('登录失败，请重试')
          })
      } else if (data.type === 'EXPIRED') {
        setQrState('expired')
        setStatusText('二维码已过期')
      }
    })

    return () => {
      // 在组件卸载时，确保清除任何可能存在的计时器
      if (confirmationTimeout) {
        clearTimeout(confirmationTimeout)
      }
      ws.disconnect()
    }
  }, [sessionId, handleLoginSuccess])


  // Initial fetch QR code
  useEffect(() => {
    fetchQRCode()
  }, [fetchQRCode])

  const handleRefresh = () => {
    fetchQRCode()
  }

  return (
    <div className={styles.loginContainer}>
      {/* Left Section - Branding */}
      <div className={styles.brandingSection}>
        <div className={styles.brandContent}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <School size={32} />
            </div>
            <h1 className={styles.brandName}>Campus Review</h1>
          </div>
          <p className={styles.brandTagline}>发现你的校园生活</p>

          <svg className={styles.heroImage} viewBox="0 0 360 270" fill="none">
            <rect x="45" y="45" width="270" height="180" rx="12" fill="white" opacity="0.2" />
            <circle cx="180" cy="108" r="36" fill="white" opacity="0.3" />
            <rect x="90" y="162" width="180" height="7" rx="3.5" fill="rgba(212,175,55,0.4)" />
            <rect x="108" y="180" width="144" height="7" rx="3.5" fill="rgba(212,175,55,0.3)" />
            <rect x="126" y="198" width="108" height="7" rx="3.5" fill="white" opacity="0.2" />
          </svg>

          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <Check className={styles.featureIcon} />
              <span>真实点评，来自你的同学</span>
            </li>
            <li className={styles.featureItem}>
              <Check className={styles.featureIcon} />
              <span>校园社交，结识新朋友</span>
            </li>
            <li className={styles.featureItem}>
              <Check className={styles.featureIcon} />
              <span>发现好店，探索校园美食</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Section - Login */}
      <div className={styles.loginSection}>
        <div className={styles.loginBox}>
          <h2 className={styles.loginTitle}>欢迎登录</h2>
          <p className={styles.loginSubtitle}>使用微信扫码快速登录</p>

          <div className={styles.qrContainer}>
            <div className={styles.qrWrapper}>
              {/* Loading State */}
              {qrState === 'loading' && (
                <div className={styles.qrState}>
                  <Loading size="lg" />
                  <p className={styles.loadingText}>正在生成二维码...</p>
                </div>
              )}

              {/* Ready State */}
              {qrState === 'ready' && (
                <div className={styles.qrState}>
                  <div className={styles.qrImage}>
                    <img src={qrCode} alt="登录二维码" />
                  </div>
                </div>
              )}

              {/* Scanned State */}
              {qrState === 'scanned' && (
                <div className={styles.qrState}>
                  <div className={styles.successIcon}>
                    <CheckCircle size={44} />
                  </div>
                  <p className={styles.scannedText}>扫码成功</p>
                  <p className={styles.scannedSubtext}>请在手机上确认登录</p>
                </div>
              )}

              {/* Expired State */}
              {qrState === 'expired' && (
                <div className={styles.qrState}>
                  <div className={styles.warningIcon}>
                    <AlertCircle size={44} />
                  </div>
                  <p className={styles.expiredText}>二维码已过期</p>
                  <button className={styles.refreshBtn} onClick={handleRefresh}>
                    <RefreshCw size={15} />
                    <span>点击刷新</span>
                  </button>
                </div>
              )}
            </div>

            <p className={styles.qrStatus}>{statusText}</p>
          </div>

          <div className={styles.loginFooter}>
            <div className={styles.footerLinks}>
              <a href="#">隐私政策</a>
              <a href="#">服务条款</a>
              <a href="#">关于我们</a>
            </div>
            <p className={styles.copyright}>© 2025 Campus Review. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
