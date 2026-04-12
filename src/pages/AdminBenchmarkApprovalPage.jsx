import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { db } from '../firebase/config'
import {
  logout,
  getBenchmarkSettings,
  updateBenchmarkApproval,
  upsertBenchmarkReport,
  MIN_BENCHMARK_DATA_POINTS,
} from '../firebase/firestore'
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from 'firebase/firestore'
import toast from 'react-hot-toast'
import {
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Menu,
  Moon,
  Sun,
  Users,
  Briefcase,
  BarChart2,
  LayoutDashboard,
  X,
} from 'lucide-react'

function useAdminGuard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      navigate('/admin/login')
      return
    }

    getDoc(doc(db, 'admins', currentUser.uid))
      .then(d => {
        if (!d.exists()) {
          toast.error('Access denied')
          navigate('/admin/login')
        } else {
          setReady(true)
        }
      })
      .catch(() => navigate('/admin/login'))
  }, [currentUser, navigate])

  return ready
}

function AdminLayout({ children, active }) {
  const { currentUser } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isMobile = () => window.innerWidth <= 640

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/admin/login')
  }

  const NAV = [
    { label: 'Dashboard', Icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Users', Icon: Users, path: '/admin/users' },
    { label: 'Applications', Icon: Briefcase, path: '/admin/applications' },
    { label: 'Benchmark Approval', Icon: ShieldCheck, path: '/admin/benchmark' },
    { label: 'Analytics', Icon: BarChart2, path: '/admin/analytics' },
  ]

  const mobile = isMobile()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {mobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 199 }}
        />
      )}

      <aside
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          ...(!mobile
            ? {
                width: sidebarOpen ? 240 : 0,
                padding: sidebarOpen ? '24px 16px' : 0,
                overflow: 'hidden',
                position: 'sticky',
                top: 0,
                height: '100vh',
                transition: 'width 0.25s ease, padding 0.25s ease',
              }
            : {
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: 240,
                padding: '24px 16px',
                overflow: 'auto',
                transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.25s ease',
                zIndex: 200,
              }),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div style={al.logoIcon}>
            <ShieldCheck size={17} color="#fff" />
          </div>
          <span style={al.logoText}>Admin Panel</span>
          {mobile && (
            <button onClick={() => setMobileOpen(false)} style={{ ...al.iconBtn, marginLeft: 'auto' }}>
              <X size={18} />
            </button>
          )}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflow: 'hidden' }}>
          {NAV.map(({ label, Icon, path }) => (
            <button
              key={path}
              onClick={() => {
                navigate(path)
                setMobileOpen(false)
              }}
              style={{ ...al.navBtn, ...(active === label ? al.navActive : {}) }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        <div style={{ paddingTop: 12, overflow: 'hidden' }}>
          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0 12px' }} />
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.email}
          </div>
          <button style={al.logoutBtn} onClick={handleLogout}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={al.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              style={al.iconBtn}
              onClick={() => {
                if (isMobile()) setMobileOpen(o => !o)
                else setSidebarOpen(o => !o)
              }}
            >
              <Menu size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4 }}>
              <div style={{ ...al.logoIcon, width: 28, height: 28, borderRadius: 8 }}>
                <ShieldCheck size={14} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text)', fontWeight: 600 }}>
                Admin Panel
              </span>
            </div>
          </div>

          <button style={al.iconBtn} onClick={toggle} title="Toggle theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="page-content">{children}</div>
      </main>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div
        className="spin"
        style={{
          width: 34,
          height: 34,
          border: '3px solid var(--border)',
          borderTopColor: '#dc2626',
          borderRadius: '50%',
        }}
      />
    </div>
  )
}

const al = {
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)', flex: 1 },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: 'var(--text2)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'var(--font)',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  navActive: { background: 'rgba(220,38,38,0.12)', color: '#dc2626' },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 12px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: 'var(--text2)',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'var(--font)',
    whiteSpace: 'nowrap',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
  },
}

const ps = {
  title: { fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text)', marginBottom: 4 },
  sub: { color: 'var(--text2)', fontSize: 13, marginBottom: 24 },
}

function buildBenchmarkReport(apps, users) {
  const totalApplications = apps.length
  const callbackCount = apps.filter(a => a.status === 'Interview' || a.status === 'Offer').length
  const offerCount = apps.filter(a => a.status === 'Offer').length
  const rejectionCount = apps.filter(a => a.status === 'Rejected').length

  const responseTimes = apps
    .filter(a => a.appliedDate && a.updatedAt)
    .map(a => {
      const applied = new Date(a.appliedDate)
      const updated = a.updatedAt?.seconds ? new Date(a.updatedAt.seconds * 1000) : new Date(a.updatedAt)
      const days = Math.round((updated - applied) / (1000 * 60 * 60 * 24))
      return Number.isFinite(days) && days >= 0 ? days : null
    })
    .filter(v => v !== null)

  const byIndustryMap = new Map()
  apps.forEach(app => {
    const industry = app.industry || 'Unspecified'
    if (!byIndustryMap.has(industry)) {
      byIndustryMap.set(industry, { industry, total: 0 })
    }
    byIndustryMap.get(industry).total += 1
  })

  const byIndustry = Array.from(byIndustryMap.values()).filter(
    r => r.total >= MIN_BENCHMARK_DATA_POINTS
  )

  const byBatchYearMap = new Map()
  apps.forEach(app => {
    const user = users.find(u => u.uid === app.uid || u.id === app.uid)
    const batchYear = user?.batchYear || 'Unspecified'
    if (!byBatchYearMap.has(batchYear)) {
      byBatchYearMap.set(batchYear, { batchYear, total: 0 })
    }
    byBatchYearMap.get(batchYear).total += 1
  })

  const byBatchYear = Array.from(byBatchYearMap.values()).filter(
    r => r.total >= MIN_BENCHMARK_DATA_POINTS
  )

  return {
    title: 'Benchmark Report',
    totalApplications,
    callbackRate: totalApplications ? Math.round((callbackCount / totalApplications) * 100) : 0,
    offerRate: totalApplications ? Math.round((offerCount / totalApplications) * 100) : 0,
    rejectionRate: totalApplications ? Math.round((rejectionCount / totalApplications) * 100) : 0,
    avgResponseTime: responseTimes.length
      ? Math.round(responseTimes.reduce((sum, n) => sum + n, 0) / responseTimes.length)
      : null,
    byIndustry,
    byBatchYear,
    filteredOutCategories: [],
  }
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
    </div>
  )
}

export default function AdminBenchmarkApprovalPage() {
  const ready = useAdminGuard()
  const [loading, setLoading] = useState(true)
  const [approved, setApproved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(null)
  const [insufficientData, setInsufficientData] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!ready) return
      try {
        const settings = await getBenchmarkSettings()
        setApproved(!!settings.approved)
      } catch (err) {
        console.error(err)
        setApproved(false)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [ready])

  const handleGenerateReport = async () => {
    try {
      setSaving(true)

      const [appsSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, 'applications')),
        getDocs(collection(db, 'users')),
      ])

      const apps = appsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))

      const report = buildBenchmarkReport(apps, users)
      setPreview(report)

      const publishable =
        report.byIndustry.length > 0 || report.byBatchYear.length > 0

      setInsufficientData(!publishable)

      await upsertBenchmarkReport('2026-report', {
        ...report,
        publishable,
      })

      if (publishable) {
        toast.success('Benchmark report generated')
      } else {
        toast.error('Benchmark report generated as draft only — insufficient data to publish')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate benchmark report')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleApproval = async () => {
    if (!preview) {
      toast.error('Generate the report first')
      return
    }

    if (insufficientData) {
      toast.error('Not enough data to approve benchmark publication')
      return
    }

    try {
      setSaving(true)
      const next = !approved
      await updateBenchmarkApproval(next)
      setApproved(next)
      toast.success(next ? 'Benchmark approved' : 'Benchmark approval revoked')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update benchmark approval')
    } finally {
      setSaving(false)
    }
  }

  if (!ready || loading) {
    return <AdminLayout active="Benchmark Approval"><Spinner /></AdminLayout>
  }

  return (
    <AdminLayout active="Benchmark Approval">
      <div className="fade-in">
        <h2 style={ps.title}>Benchmark Approval</h2>
        <p style={ps.sub}>
          Generate anonymized aggregate benchmark data and approve it before users can view it.
        </p>

        <div className="card" style={{ maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
            {approved ? (
              <ShieldCheck size={26} style={{ color: '#22c55e', flexShrink: 0, marginTop: 2 }} />
            ) : (
              <ShieldAlert size={26} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 2 }} />
            )}

            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                Current Status: {approved ? 'Approved' : 'Not Approved'}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>
                {approved
                  ? 'Users can currently view benchmark data.'
                  : 'Users cannot view benchmark data until you approve it.'}
              </div>
            </div>
          </div>

          {insufficientData && (
            <div
              style={{
                marginBottom: 18,
                padding: 14,
                borderRadius: 12,
                background: 'rgba(251,191,36,0.12)',
                color: 'var(--text)',
                border: '1px solid rgba(251,191,36,0.35)',
                fontSize: 14,
              }}
            >
              Insufficient benchmark data. No category has enough data points to publish.
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <button
              onClick={handleGenerateReport}
              disabled={saving}
              style={{
                padding: '14px 18px',
                borderRadius: 12,
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: 15,
                color: '#fff',
                background: '#2563eb',
                opacity: saving ? 0.75 : 1,
              }}
            >
              {saving ? 'Working...' : 'Generate Benchmark Report'}
            </button>

            <button
              onClick={handleToggleApproval}
              disabled={saving || !preview || insufficientData}
              style={{
                padding: '14px 18px',
                borderRadius: 12,
                border: 'none',
                cursor: saving || !preview || insufficientData ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: 15,
                color: '#fff',
                background: approved ? '#ef4444' : '#22c55e',
                opacity: saving || !preview || insufficientData ? 0.75 : 1,
              }}
            >
              {approved ? 'Revoke Approval' : 'Approve Benchmark'}
            </button>
          </div>

          {preview && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                Preview Summary
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <InfoBox label="Total Applications" value={preview.totalApplications} />
                <InfoBox label="Callback Rate" value={`${preview.callbackRate}%`} />
                <InfoBox label="Offer Rate" value={`${preview.offerRate}%`} />
                <InfoBox label="Rejection Rate" value={`${preview.rejectionRate}%`} />
                <InfoBox label="Avg Response Time" value={preview.avgResponseTime != null ? `${preview.avgResponseTime} days` : '—'} />
                <InfoBox label="Industry Groups" value={preview.byIndustry.length} />
                <InfoBox label="Batch Year Groups" value={preview.byBatchYear.length} />
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}