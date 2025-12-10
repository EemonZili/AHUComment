import { useEffect, useState } from 'react'
import { useUserCache } from '@/store/userCache'
import type { AuthUserDTO } from '@/types'

/**
 * 获取用户信息的Hook（带缓存）
 * @param openid 用户的openid
 * @returns 用户信息对象，如果尚未加载则返回null
 */
export const useUserInfo = (openid: string | undefined) => {
  const { fetchUser, getUser } = useUserCache()
  const [userInfo, setUserInfo] = useState<AuthUserDTO | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!openid) {
      setUserInfo(null)
      return
    }

    // 先检查缓存
    const cached = getUser(openid)
    if (cached) {
      setUserInfo(cached)
      return
    }

    // 如果没有缓存，则加载
    setLoading(true)
    fetchUser(openid)
      .then((info) => {
        setUserInfo(info)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [openid, fetchUser, getUser])

  return { userInfo, loading }
}
