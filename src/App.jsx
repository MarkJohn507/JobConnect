import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import ApplicationsPage from './pages/ApplicationsPage'
import ProfilePage from './pages/ProfilePage'
import AdminLoginPage from './pages/AdminLoginPage'
import { AdminDashboardPage, AdminUsersPage, AdminApplicationsPage, AdminAnalyticsPage } from './pages/AdminDashboardPage'
import Layout from './components/layout/Layout'

function PrivateRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { currentUser } = useAuth()
  return !currentUser ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register"        element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

      {/* Admin */}
      <Route path="/admin/login"        element={<AdminLoginPage />} />
      <Route path="/admin/dashboard"    element={<AdminDashboardPage />} />
      <Route path="/admin/users"        element={<AdminUsersPage />} />
      <Route path="/admin/applications" element={<AdminApplicationsPage />} />
      <Route path="/admin/analytics"    element={<AdminAnalyticsPage />} />

      {/* User app */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard"    element={<DashboardPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="profile"      element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
