import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import ApplicationsPage from './pages/ApplicationsPage'
import InsightsPage from './pages/InsightsPage'
import BenchmarkPage from './pages/BenchmarkPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminBenchmarkApprovalPage from './pages/AdminBenchmarkApprovalPage'
import { AdminDashboardPage, AdminUsersPage, AdminApplicationsPage, AdminAnalyticsPage } from './pages/AdminDashboardPage'
import Layout from './components/layout/Layout'

function PrivateRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/applications" element={<AdminApplicationsPage />} />
      <Route path="/admin/benchmark" element={<AdminBenchmarkApprovalPage />} />
      <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      

      {/* User app (protected) */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="benchmark" element={<BenchmarkPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}