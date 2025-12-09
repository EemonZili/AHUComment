import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  UserCheck,
  UserPlus,
  Edit2,
  Trash2,
  RefreshCw,
  Download,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react'
import { getUserList, changeUserStatus, deleteUser } from '@/services/user'
import { AdminLayout, Loading, Avatar } from '@/components'
import type { AuthUserDTO, UserListParams } from '@/types'
import styles from './Users.module.css'

export default function AdminUsers() {
  const navigate = useNavigate()

  // --- 状态定义 ---

  // 1. 数据源：存储从后端获取的原始完整数据
  const [allUsers, setAllUsers] = useState<AuthUserDTO[]>([])
  const [loading, setLoading] = useState(true)

  // 2. 交互状态
  const [searchKeyword, setSearchKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<number | ''>('')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  // 3. 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // --- 核心逻辑：数据获取 ---

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // 获取全量数据，前端进行过滤
      const params: UserListParams = {
        pageNum: 1,
        pageSize: 10000, // 获取大量数据，前端分页
      }

      const response = await getUserList(params)
      setAllUsers(response.list || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      // 可以加一个 toast 提示
    } finally {
      setLoading(false)
    }
  }

  // 初始化加载
  useEffect(() => {
    fetchUsers()
  }, [])

  // --- 核心逻辑：前端过滤与分页 (使用 useMemo 优化) ---

  // 1. 过滤：根据搜索词和筛选条件筛选数据
  const filteredUsers = useMemo(() => {
    let result = allUsers

    // 搜索关键词过滤
    if (searchKeyword.trim()) {
      result = result.filter(user =>
        user.nickname.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        user.openid.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    }

    // 状态过滤
    if (statusFilter !== '') {
      result = result.filter(user => user.status === statusFilter)
    }

    // 角色过滤 (如果需要)
    // if (roleFilter) {
    //   result = result.filter(user => /* 角色过滤逻辑 */)
    // }

    return result
  }, [allUsers, searchKeyword, statusFilter])

  // 2. 分页：对过滤后的数据进行切片
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredUsers.slice(startIndex, startIndex + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  // 3. 统计：基于全量数据计算
  const stats = useMemo(() => ({
    total: allUsers.length,
    active: allUsers.filter(u => u.status === 1).length,
    newToday: 5, // Mock data - would come from API
  }), [allUsers])

  // 当搜索关键词或筛选条件变化时，重置回第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [searchKeyword, statusFilter])

  // --- 交互处理 ---

  // 判断当前页是否全部被选中
  const isCurrentPageAllSelected = paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUsers.has(u.openid))

  // 全选/取消全选 (仅针对当前页)
  const handleSelectAll = () => {
    const newSelected = new Set(selectedUsers)
    if (isCurrentPageAllSelected) {
      // 取消当前页所有
      paginatedUsers.forEach(u => newSelected.delete(u.openid))
    } else {
      // 选中当前页所有
      paginatedUsers.forEach(u => newSelected.add(u.openid))
    }
    setSelectedUsers(newSelected)
  }

  // 单选
  const handleSelectUser = (openid: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(openid)) {
      newSelected.delete(openid)
    } else {
      newSelected.add(openid)
    }
    setSelectedUsers(newSelected)
  }

  // 状态切换
  const handleToggleStatus = async (user: AuthUserDTO) => {
    const newStatus = user.status === 1 ? 0 : 1
    const statusText = newStatus === 1 ? '启用' : '禁用'

    if (!window.confirm(`确定要${statusText}用户 "${user.nickname}" 吗？`)) return

    try {
      await changeUserStatus(user.openid, newStatus)
      fetchUsers() // 重新获取以更新列表
    } catch (error) {
      console.error('Failed to change user status:', error)
      alert(`${statusText}用户失败`)
    }
  }

  // 删除用户
  const handleDeleteUser = async (user: AuthUserDTO) => {
    if (!window.confirm(`确定要删除用户 "${user.nickname}" 吗？`)) return

    try {
      await deleteUser(user.openid)
      // 删除成功后，重新获取全量数据
      fetchUsers()
      // 清理选中状态
      const newSelected = new Set(selectedUsers)
      newSelected.delete(user.openid)
      setSelectedUsers(newSelected)
    } catch (error) {
      console.error('Delete failed:', error)
      alert('删除失败')
    }
  }

  // 性别显示文本
  const getGenderText = (sex: string) => {
    const genderMap: Record<string, string> = {
      male: '男',
      female: '女',
      other: '其他',
    }
    return genderMap[sex] || sex
  }

  // 导出
  const handleExport = () => {
    alert('导出功能（演示）')
  }

  // 分页计算
  const total = filteredUsers.length
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, total)

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      // 简化的页码逻辑
      let start = Math.max(currentPage - 2, 1)
      let end = Math.min(start + 4, totalPages)
      if (end - start < 4) start = Math.max(end - 4, 1)
      for (let i = start; i <= end; i++) pages.push(i)
    }
    return pages
  }

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>用户管理</h1>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard} style={{ animationDelay: '150ms' }}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>总用户数</span>
              <div className={styles.statIcon} style={{ background: 'rgba(91, 124, 196, 0.1)' }}>
                <Users size={20} style={{ color: 'var(--primary)' }} />
              </div>
            </div>
            <div className={styles.statValue}>{stats.total.toLocaleString()}</div>
          </div>

          <div className={styles.statCard} style={{ animationDelay: '300ms' }}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>活跃用户</span>
              <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <UserCheck size={20} style={{ color: '#10b981' }} />
              </div>
            </div>
            <div className={styles.statValue}>{stats.active.toLocaleString()}</div>
          </div>

          <div className={styles.statCard} style={{ animationDelay: '450ms' }}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>今日新增</span>
              <div className={styles.statIcon} style={{ background: 'rgba(244, 208, 63, 0.1)' }}>
                <UserPlus size={20} style={{ color: '#f4d03f' }} />
              </div>
            </div>
            <div className={styles.statValue}>+{stats.newToday}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchWrapper} style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              className={styles.searchInput}
              style={{ paddingLeft: '32px' }}
              placeholder="搜索用户昵称或ID..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">全部状态</option>
            <option value="1">正常</option>
            <option value="0">封禁</option>
          </select>
        </div>

        <div className={styles.toolbarRight}>
          <button className={styles.btn} onClick={fetchUsers}>
            <RefreshCw size={14} />
            <span>刷新</span>
          </button>
          <button className={styles.btn} onClick={handleExport}>
            <Download size={14} />
            <span>导出</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            <Loading size="lg" />
            <p className={styles.loadingText}>加载中...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>
            <Users className={styles.emptyIcon} size={64} />
            <p className={styles.emptyText}>未找到相关用户</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <div
                      className={`${styles.checkbox} ${isCurrentPageAllSelected ? styles.checked : ''}`}
                      onClick={handleSelectAll}
                    />
                  </th>
                  <th>用户</th>
                  <th>性别</th>
                  <th>角色</th>
                  <th>状态</th>
                  <th>注册时间</th>
                  <th style={{ width: '120px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr
                    key={user.openid}
                    className={selectedUsers.has(user.openid) ? styles.selected : ''}
                  >
                    <td>
                      <div
                        className={`${styles.checkbox} ${selectedUsers.has(user.openid) ? styles.checked : ''}`}
                        onClick={() => handleSelectUser(user.openid)}
                      />
                    </td>
                    <td>
                      <div className={styles.userCell}>
                        <Avatar
                          src={user.avatar}
                          fallbackSeed={user.openid}
                          alt={user.nickname}
                          className={styles.userAvatar}
                        />
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>{user.nickname}</div>
                          <div className={styles.userId}>{user.openid.substring(0, 20)}...</div>
                        </div>
                      </div>
                    </td>
                    <td>{getGenderText(user.sex)}</td>
                    <td>
                      <span className={styles.roleBadge}>
                        {user.roleId ? `角色${user.roleId}` : '普通用户'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${user.status === 1 ? styles.active : styles.banned}`}
                      >
                        <span className={styles.statusDot} />
                        {user.status === 1 ? '正常' : '封禁'}
                      </span>
                    </td>
                    <td>
                      {user.createTime
                        ? new Date(user.createTime).toLocaleDateString('zh-CN')
                        : '-'}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => alert('编辑功能（演示）')}
                          title="编辑"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === 1 ? '封禁' : '启用'}
                        >
                          <ToggleRight size={16} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.delete}`}
                          onClick={() => handleDeleteUser(user)}
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {total > 0 && (
              <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                  显示 {startIndex}-{endIndex} 条，共 {total} 条
                </div>
                <div className={styles.paginationControls}>
                  <button
                    className={styles.pageBtn}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className={styles.pageBtn}
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
