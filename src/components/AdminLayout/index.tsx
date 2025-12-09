import { useState, ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Users,
  Shield,
  Key,
  School,
  ChevronLeft,
  ChevronsLeft,
  Search,
  Bell,
  ChevronRight,
  Menu,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import Avatar from '@/components/Avatar'
import styles from './AdminLayout.module.css'

interface AdminLayoutProps {
  children: ReactNode
}

interface NavItem {
  path: string
  icon: typeof Users
  label: string
}

const navItems: NavItem[] = [
  { path: '/admin/users', icon: Users, label: '用户管理' },
  { path: '/admin/roles', icon: Shield, label: '角色管理' },
  { path: '/admin/permissions', icon: Key, label: '权限管理' },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleMobileSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  const isActive = (path: string) => location.pathname === path

  // Get breadcrumb
  const getBreadcrumb = () => {
    const item = navItems.find((nav) => nav.path === location.pathname)
    return item ? item.label : '管理后台'
  }

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''} ${sidebarVisible ? styles.show : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <School size={20} color="white" />
          </div>
          <span className={styles.sidebarTitle}>Campus Review</span>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.path}
                className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                onClick={() => {
                  navigate(item.path)
                  setSidebarVisible(false)
                }}
              >
                <Icon className={styles.navIcon} size={20} />
                <span className={styles.navText}>{item.label}</span>
              </div>
            )
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.toggleBtn} onClick={toggleSidebar}>
            <ChevronsLeft size={16} />
            <span className={styles.navText}>收起</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarVisible && <div className={styles.overlay} onClick={toggleMobileSidebar} />}

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button className={styles.mobileMenuBtn} onClick={toggleMobileSidebar}>
              <Menu size={20} />
            </button>
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbItem}>管理后台</span>
              <ChevronRight size={14} />
              <span className={`${styles.breadcrumbItem} ${styles.active}`}>{getBreadcrumb()}</span>
            </div>
          </div>

          <div className={styles.topBarActions}>
            <button className={styles.homeBtn} onClick={() => navigate('/')}>
              <ChevronLeft size={16} />
              <span>返回首页</span>
            </button>

            <div
              className={styles.userInfo}
              onClick={() => navigate('/profile')}
            >
              <Avatar
                src={user?.avatar}
                fallbackSeed={user?.openid || 'admin'}
                alt={user?.nickname}
                className={styles.adminAvatar}
              />
              <span className={styles.userName}>{user?.nickname}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className={styles.pageContent}>{children}</div>
      </main>
    </div>
  )
}
