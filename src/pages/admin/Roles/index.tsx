import { useState, useEffect, useMemo } from 'react'
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Search, // 增加一个搜索图标
} from 'lucide-react'
import { getRoleList, addRole, updateRole, deleteRole } from '@/services/role'
import { AdminLayout, Loading } from '@/components'
import type { AuthRoleDTO, RoleAddDTO, RoleUpdateDTO } from '@/types'
import styles from './Roles.module.css'

export default function AdminRoles() {
  // --- 状态定义 ---
  
  // 1. 数据源：存储从后端获取的原始完整数据
  const [allRoles, setAllRoles] = useState<AuthRoleDTO[]>([])
  const [loading, setLoading] = useState(true)

  // 2. 交互状态
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<Set<number>>(new Set())
  
  // 3. 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // 4. 模态框状态
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingRole, setEditingRole] = useState<AuthRoleDTO | null>(null)
  const [formData, setFormData] = useState({
    roleName: '',
    description: '',
  })

  // --- 核心逻辑：数据获取 ---

  const fetchRoles = async () => {
    setLoading(true)
    try {
      // 假设 request 拦截器已经处理好，直接返回数组
      // @ts-ignore: 忽略类型检查，以匹配你实际运行成功的情况
      const response = await getRoleList() 
      
      // 兼容性处理：如果拦截器没解包，尝试 response.data，否则直接用 response
      const dataList = Array.isArray(response) ? response : (response.data || [])
      
      setAllRoles(dataList)
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      // 可以加一个 toast 提示
    } finally {
      setLoading(false)
    }
  }

  // 初始化加载
  useEffect(() => {
    fetchRoles()
  }, [])

  // --- 核心逻辑：前端过滤与分页 (使用 useMemo 优化) ---

  // 1. 过滤：根据搜索词筛选数据
  const filteredRoles = useMemo(() => {
    if (!searchKeyword.trim()) return allRoles
    return allRoles.filter(role => 
      role.roleName.toLowerCase().includes(searchKeyword.toLowerCase())
    )
  }, [allRoles, searchKeyword])

  // 2. 分页：对过滤后的数据进行切片
  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredRoles.slice(startIndex, startIndex + pageSize)
  }, [filteredRoles, currentPage, pageSize])

  // 3. 统计：基于全量数据计算
  const stats = useMemo(() => ({
    total: allRoles.length,
    system: allRoles.filter(r => r.roleName.includes('super') || r.roleName.includes('admin')).length,
    custom: allRoles.filter(r => !r.roleName.includes('super') && !r.roleName.includes('admin')).length,
  }), [allRoles])

  // 当搜索关键词变化时，重置回第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [searchKeyword])

  // --- 交互处理 ---

  // 判断当前页是否全部被选中
  const isCurrentPageAllSelected = paginatedRoles.length > 0 && paginatedRoles.every(r => selectedRoles.has(r.id))

  // 全选/取消全选 (仅针对当前页)
  const handleSelectAll = () => {
    const newSelected = new Set(selectedRoles)
    if (isCurrentPageAllSelected) {
      // 取消当前页所有
      paginatedRoles.forEach(r => newSelected.delete(r.id))
    } else {
      // 选中当前页所有
      paginatedRoles.forEach(r => newSelected.add(r.id))
    }
    setSelectedRoles(newSelected)
  }

  // 单选
  const handleSelectRole = (id: number) => {
    const newSelected = new Set(selectedRoles)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRoles(newSelected)
  }

  // 模态框操作
  const handleAddRole = () => {
    setModalMode('add')
    setEditingRole(null)
    setFormData({ roleName: '', description: '' })
    setShowModal(true)
  }

  const handleEditRole = (role: AuthRoleDTO) => {
    setModalMode('edit')
    setEditingRole(role)
    setFormData({
      roleName: role.roleName,
      description: role.description || '',
    })
    setShowModal(true)
  }

  const handleDeleteRole = async (role: AuthRoleDTO) => {
    if (!window.confirm(`确定要删除角色 "${role.roleName}" 吗？`)) return

    try {
      await deleteRole(role.id.toString())
      // 删除成功后，重新获取全量数据
      fetchRoles() 
      // 清理选中状态
      const newSelected = new Set(selectedRoles)
      newSelected.delete(role.id)
      setSelectedRoles(newSelected)
    } catch (error) {
      console.error('Delete failed:', error)
      alert('删除失败')
    }
  }

  const handleSaveRole = async () => {
    if (!formData.roleName.trim()) {
      alert('请输入角色名称')
      return
    }

    try {
      if (modalMode === 'add') {
        const data: RoleAddDTO = { roleName: formData.roleName, description: formData.description }
        await addRole(data)
      } else if (editingRole) {
        const data: RoleUpdateDTO = { id: editingRole.id, roleName: formData.roleName, description: formData.description }
        await updateRole(data)
      }
      setShowModal(false)
      fetchRoles() // 重新获取以更新列表
    } catch (error) {
      console.error('Save failed:', error)
      alert('保存失败')
    }
  }

  // 分页计算
  const total = filteredRoles.length
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
        <h1 className={styles.pageTitle}>角色管理</h1>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>总角色数</span>
              <div className={styles.statIcon} style={{ background: 'rgba(91, 124, 196, 0.1)' }}>
                <Shield size={20} className="text-blue-500" style={{ color: 'var(--primary)' }} />
              </div>
            </div>
            <div className={styles.statValue}>{stats.total}</div>
          </div>
          {/* ... 其他统计卡片 ... */}
          <div className={styles.statCard}>
             <div className={styles.statHeader}>
               <span className={styles.statLabel}>系统角色</span>
               <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                 <Shield size={20} style={{ color: '#10b981' }} />
               </div>
             </div>
             <div className={styles.statValue}>{stats.system}</div>
           </div>
          <div className={styles.statCard} style={{ animationDelay: '450ms' }}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>自定义角色</span>
              <div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <Shield size={20} style={{ color: '#8b5cf6' }} />
              </div>
            </div>
            <div className={styles.statValue}>{stats.custom.toLocaleString()}</div>
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
              placeholder="搜索角色名称..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.toolbarRight}>
          <button className={styles.btn} onClick={fetchRoles}>
            <RefreshCw size={14} />
            <span>刷新</span>
          </button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAddRole}>
            <Plus size={14} />
            <span>添加角色</span>
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
        ) : filteredRoles.length === 0 ? (
          <div className={styles.emptyState}>
            <Shield className={styles.emptyIcon} size={64} />
            <p className={styles.emptyText}>未找到相关角色</p>
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
                  <th>角色名称</th>
                  <th>描述</th>
                  <th>创建时间</th>
                  <th style={{ width: '120px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRoles.map((role) => (
                  <tr key={role.id} className={selectedRoles.has(role.id) ? styles.selected : ''}>
                    <td>
                      <div
                        className={`${styles.checkbox} ${selectedRoles.has(role.id) ? styles.checked : ''}`}
                        onClick={() => handleSelectRole(role.id)}
                      />
                    </td>
                    <td>
                      <div className={styles.roleCell}>
                        <Shield size={16} className={styles.roleIcon} />
                        <span className={styles.roleName}>{role.roleName}</span>
                      </div>
                    </td>
                    <td><span className={styles.roleDescription}>{role.description || '-'}</span></td>
                    <td>{role.createTime ? new Date(role.createTime).toLocaleDateString('zh-CN') : '-'}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => handleEditRole(role)}>
                          <Edit2 size={16} />
                        </button>
                        <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDeleteRole(role)}>
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

      {/* Modal - 保持不变 */}
      {showModal && (
        <>
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)} />
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{modalMode === 'add' ? '添加角色' : '编辑角色'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>角色名称 <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.roleName}
                  onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>描述</label>
                <textarea
                  className={styles.formTextarea}
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowModal(false)}>取消</button>
              <button className={styles.btnPrimary} onClick={handleSaveRole}>确定</button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}