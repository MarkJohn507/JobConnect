import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import ApplicationsPage from './pages/ApplicationsPage'
import ProfilePage from './pages/ProfilePage'
import AdminLoginPage from './pages/AdminLoginPage'
import { AdminDashboardPage, AdminUsersPage, AdminApplicationsPage, AdminAnalyticsPage } from './pages/AdminDashboardPage'
import Layout from './components/layout/Layout'

function PrivateRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Landing (has login + register modals built in) */}
      <Route path="/" element={<LandingPage />} />

      {/* Forgot password still needs its own page */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Admin */}
      <Route path="/admin/login"        element={<AdminLoginPage />} />
      <Route path="/admin/dashboard"    element={<AdminDashboardPage />} />
      <Route path="/admin/users"        element={<AdminUsersPage />} />
      <Route path="/admin/applications" element={<AdminApplicationsPage />} />
      <Route path="/admin/analytics"    element={<AdminAnalyticsPage />} />

      {/* User app (protected) */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard"    element={<DashboardPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="profile"      element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
