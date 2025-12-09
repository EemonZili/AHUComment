import { useState, useEffect, useMemo } from 'react'
import {
  Key,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react'
import { getPermissionList, addPermission, updatePermission, deletePermission } from '@/services/permission'
import { AdminLayout, Loading } from '@/components'
import type { AuthPermissionDTO, PermissionAddDTO, PermissionUpdateDTO } from '@/types'
import styles from './Permissions.module.css'

export default function AdminPermissions() {
  // --- 状态定义 ---

  // 1. 数据源：存储从后端获取的原始完整数据
  const [allPermissions, setAllPermissions] = useState<AuthPermissionDTO[]>([])
  const [loading, setLoading] = useState(true)

  // 2. 交互状态
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set())

  // 3. 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // 4. 模态框状态
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingPermission, setEditingPermission] = useState<AuthPermissionDTO | null>(null)
  const [formData, setFormData] = useState({
    permission: '',
    description: '',
  })

  // --- 核心逻辑：数据获取 ---

  const fetchPermissions = async () => {
    setLoading(true)
    try {
      // @ts-ignore: 忽略类型检查，以匹配你实际运行成功的情况
      const response = await getPermissionList()

      // 兼容性处理：如果拦截器没解包，尝试 response.data，否则直接用 response
      const dataList = Array.isArray(response) ? response : (response.data || [])

      setAllPermissions(dataList)
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
      // 可以加一个 toast 提示
    } finally {
      setLoading(false)
    }
  }

  // 初始化加载
  useEffect(() => {
    fetchPermissions()
  }, [])

  // --- 核心逻辑：前端过滤与分页 (使用 useMemo 优化) ---

  // 1. 过滤：根据搜索词筛选数据
  const filteredPermissions = useMemo(() => {
    if (!searchKeyword.trim()) return allPermissions
    return allPermissions.filter(permission =>
      permission.permission.toLowerCase().includes(searchKeyword.toLowerCase())
    )
  }, [allPermissions, searchKeyword])

  // 2. 分页：对过滤后的数据进行切片
  const paginatedPermissions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredPermissions.slice(startIndex, startIndex + pageSize)
  }, [filteredPermissions, currentPage, pageSize])

  // 3. 统计：基于全量数据计算
  const stats = useMemo(() => {
    const readPerms = allPermissions.filter((p) =>
      p.permission.toLowerCase().includes('read') ||
      p.permission.toLowerCase().includes('view') ||
      p.permission.toLowerCase().includes('get')
    ).length

    return {
      total: allPermissions.length,
      read: readPerms,
      write: allPermissions.length - readPerms,
    }
  }, [allPermissions])

  // 当搜索关键词变化时，重置回第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [searchKeyword])

  // --- 交互处理 ---

  // 判断当前页是否全部被选中
  const isCurrentPageAllSelected = paginatedPermissions.length > 0 && paginatedPermissions.every(p => selectedPermissions.has(p.id))

  // 全选/取消全选 (仅针对当前页)
  const handleSelectAll = () => {
    const newSelected = new Set(selectedPermissions)
    if (isCurrentPageAllSelected) {
      // 取消当前页所有
      paginatedPermissions.forEach(p => newSelected.delete(p.id))
    } else {
      // 选中当前页所有
      paginatedPermissions.forEach(p => newSelected.add(p.id))
    }
    setSelectedPermissions(newSelected)
  }

  // 单选
  const handleSelectPermission = (id: number) => {
    const newSelected = new Set(selectedPermissions)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedPermissions(newSelected)
  }

  // 模态框操作
  const handleAddPermission = () => {
    setModalMode('add')
    setEditingPermission(null)
    setFormData({ permission: '', description: '' })
    setShowModal(true)
  }

  const handleEditPermission = (permission: AuthPermissionDTO) => {
    setModalMode('edit')
    setEditingPermission(permission)
    setFormData({
      permission: permission.permission,
      description: permission.description || '',
    })
    setShowModal(true)
  }

  const handleDeletePermission = async (permission: AuthPermissionDTO) => {
    if (!window.confirm(`确定要删除权限 "${permission.permission}" 吗？`)) return

    try {
      await deletePermission(permission.id.toString())
      // 删除成功后，重新获取全量数据
      fetchPermissions()
      // 清理选中状态
      const newSelected = new Set(selectedPermissions)
      newSelected.delete(permission.id)
      setSelectedPermissions(newSelected)
    } catch (error) {
      console.error('Delete failed:', error)
      alert('删除失败')
    }
  }

  const handleSavePermission = async () => {
    if (!formData.permission.trim()) {
      alert('请输入权限名称')
      return
    }

    try {
      if (modalMode === 'add') {
        const data: PermissionAddDTO = { permission: formData.permission, description: formData.description }
        await addPermission(data)
      } else if (editingPermission) {
        const data: PermissionUpdateDTO = { id: editingPermission.id, permission: formData.permission, description: formData.description }
        await updatePermission(data)
      }
      setShowModal(false)
      fetchPermissions() // 重新获取以更新列表
    } catch (error) {
      console.error('Save failed:', error)
      alert('保存失败')
    }
  }

  // 分页计算
  const total = filteredPermissions.length
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
        <h1 className={styles.pageTitle}>权限管理</h1>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard} style={{ animationDelay: '150ms' }}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>总权限数</span>
              <div className={styles.statIcon} style={{ background: 'rgba(91, 124, 196, 0.1)' }}>
                <Key size={20} style={{ color: 'var(--primary)' }} />
              </div>
            </div>
            <div className={styles.statValue}>{stats.total.toLocaleString()}</div>
          </div>

          <div className={styles.statCard} style={{ animationDelay: '300ms' }}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>读权限</span>
              <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <Key size={20} style={{ color: '#10b981' }} />
              </div>
            </div>
            <div className={styles.statValue}>{stats.read.toLocaleString()}</div>
          </div>

          <div className={styles.statCard} style={{ animationDelay: '450ms' }}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>写权限</span>
              <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <Key size={20} style={{ color: '#f59e0b' }} />
              </div>
            </div>
            <div className={styles.statValue}>{stats.write.toLocaleString()}</div>
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
              placeholder="搜索权限名称..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.toolbarRight}>
          <button className={styles.btn} onClick={fetchPermissions}>
            <RefreshCw size={14} />
            <span>刷新</span>
          </button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAddPermission}>
            <Plus size={14} />
            <span>添加权限</span>
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
        ) : filteredPermissions.length === 0 ? (
          <div className={styles.emptyState}>
            <Key className={styles.emptyIcon} size={64} />
            <p className={styles.emptyText}>未找到相关权限</p>
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
                  <th>权限名称</th>
                  <th>描述</th>
                  <th>创建时间</th>
                  <th style={{ width: '120px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPermissions.map((permission) => (
                  <tr
                    key={permission.id}
                    className={selectedPermissions.has(permission.id) ? styles.selected : ''}
                  >
                    <td>
                      <div
                        className={`${styles.checkbox} ${selectedPermissions.has(permission.id) ? styles.checked : ''}`}
                        onClick={() => handleSelectPermission(permission.id)}
                      />
                    </td>
                    <td>
                      <div className={styles.permissionCell}>
                        <Key size={16} className={styles.permissionIcon} />
                        <span className={styles.permissionName}>{permission.permission}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.permissionDescription}>
                        {permission.description || '-'}
                      </span>
                    </td>
                    <td>
                      {permission.createTime
                        ? new Date(permission.createTime).toLocaleDateString('zh-CN')
                        : '-'}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => handleEditPermission(permission)}>
                          <Edit2 size={16} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.delete}`}
                          onClick={() => handleDeletePermission(permission)}
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

      {/* Modal */}
      {showModal && (
        <>
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)} />
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{modalMode === 'add' ? '添加权限' : '编辑权限'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  权限名称 <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="请输入权限名称（例如：user:read）"
                  value={formData.permission}
                  onChange={(e) => setFormData({ ...formData, permission: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>描述</label>
                <textarea
                  className={styles.formTextarea}
                  placeholder="请输入权限描述"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowModal(false)}>
                取消
              </button>
              <button className={styles.btnPrimary} onClick={handleSavePermission}>
                确定
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
