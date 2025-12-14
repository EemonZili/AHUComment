import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Profile from '@/pages/Profile'
import UserProfile from '@/pages/UserProfile'
import ReviewList from '@/pages/ReviewList'
import ReviewDetail from '@/pages/ReviewDetail'
import PlaceList from '@/pages/PlaceList'
import PlaceDetail from '@/pages/PlaceDetail'
import ReviewCreate from '@/pages/ReviewCreate'
import PostList from '@/pages/PostList'
import PostDetail from '@/pages/PostDetail'
import PostCreate from '@/pages/PostCreate'
import CacheManager from '@/pages/CacheManager'
import ApiTest from '@/pages/ApiTest'
import AdminUsers from '@/pages/admin/Users'
import AdminRoles from '@/pages/admin/Roles'
import AdminPermissions from '@/pages/admin/Permissions'
import { useAuthStore } from '@/store/auth'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user has admin role
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ReviewList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/:openid"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cache-manager"
        element={
          <ProtectedRoute>
            <CacheManager />
          </ProtectedRoute>
        }
      />

      {/* 具体路径必须在动态路径之前 */}
      <Route
        path="/review/create"
        element={
          <ProtectedRoute>
            <ReviewCreate />
          </ProtectedRoute>
        }
      />

      <Route
        path="/review/:id"
        element={
          <ProtectedRoute>
            <ReviewDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/places"
        element={
          <ProtectedRoute>
            <PlaceList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/place/:id"
        element={
          <ProtectedRoute>
            <PlaceDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/posts"
        element={
          <ProtectedRoute>
            <PostList />
          </ProtectedRoute>
        }
      />

      {/* 具体路径必须在动态路径之前 */}
      <Route
        path="/post/create"
        element={
          <ProtectedRoute>
            <PostCreate />
          </ProtectedRoute>
        }
      />

      <Route
        path="/post/:id"
        element={
          <ProtectedRoute>
            <PostDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/api-test"
        element={
          <ProtectedRoute>
            <ApiTest />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/roles"
        element={
          <AdminRoute>
            <AdminRoles />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/permissions"
        element={
          <AdminRoute>
            <AdminPermissions />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
