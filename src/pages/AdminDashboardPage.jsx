import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { db } from '../firebase/config'
import { logout } from '../firebase/firestore'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Sun, Moon, LogOut, ShieldCheck } from 'lucide-react'

export default function AdminDashboardPage() {
  const { currentUser } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [search, setSearch]   = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  useEffect(() => {
    if (!currentUser) { navigate('/admin/login'); return }

    const checkAndLoad = async () => {
      try {
        // Verify admin
        const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid))
        if (!adminDoc.exists()) {
          toast.error('Access denied')
          navigate('/admin/login')
          return
        }
        setAuthorized(true)

        // Load ALL applications from all users
        const snap = await getDocs(collection(db, 'applications'))
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        data.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        setApps(data)
      } catch (err) {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    checkAndLoad()
  }, [currentUser])

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const filtered = apps.filter(a => {
    const matchSearch = (
      a.company?.toLowerCase().includes(search.toLowerCase()) ||
      a.position?.toLowerCase().includes(search.toLowerCase()) ||
      a.uid?.toLowerCase().includes(search.toLowerCase())
    )
    const matchStatus = filterStatus === 'All' || a.status === filterStatus
    return matchSearch && matchStatus
  })

  const counts = {
    total:     apps.length,
    applied:   apps.filter(a => a.status === 'Applied').length,
    interview: apps.filter(a => a.status === 'Interview').length,
    offered:   apps.filter(a => a.status === 'Offered').length,
    rejected:  apps.filter(a => a.status === 'Rejected').length,
  }

  const STATUSES = ['Applied', 'Interview', 'Offered', 'Rejected', 'Withdrawn']

  if (!authorized && !loading) return null

  return (
    <div style={s.page}>
      {/* Top bar */}
      <header style={s.topbar}>
        <div style={s.topbarLeft}>
          <div style={s.logo}>
            <ShieldCheck size={18} color="#fff"/>
          </div>
          <span style={s.title}>Admin Dashboard</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>{currentUser?.email}</span>
          <button style={s.iconBtn} onClick={toggle}>
            {dark ? <Sun size={16}/> : <Moon size={16}/>}
          </button>
          <button style={s.logoutBtn} onClick={handleLogout}>
            <LogOut size={14}/> Logout
          </button>
        </div>
      </header>

      <div style={s.body}>
        {loading
          ? <div style={{ textAlign: 'center', padding: 80 }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: '#dc2626', borderRadius: '50%', margin: '0 auto' }} className="spin"/>
            </div>
          : (
            <>
              {/* Stats */}
              <div style={s.statsGrid}>
                {[
                  { label: 'Total Applications', value: counts.total,     color: '#6c63ff' },
                  { label: 'Applied',            value: counts.applied,   color: '#60a5fa' },
                  { label: 'Interviews',         value: counts.interview, color: '#4ade80' },
                  { label: 'Offers',             value: counts.offered,   color: '#fbbf24' },
                  { label: 'Rejected',           value: counts.rejected,  color: '#f87171' },
                ].map(c => (
                  <div key={c.label} style={{ ...s.statCard, borderLeft: `4px solid ${c.color}` }}>
                    <div style={{ ...s.statValue, color: c.color }}>{c.value}</div>
                    <div style={s.statLabel}>{c.label}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div style={s.filters}>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search company, position, or user ID..."
                  style={s.searchInput}
                />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['All', ...STATUSES].map(st => (
                    <button key={st} onClick={() => setFilterStatus(st)}
                      style={{ ...s.filterBtn, ...(filterStatus === st ? s.filterBtnActive : {}) }}>
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['User ID', 'Company', 'Position', 'Status', 'Applied Date', 'Deadline'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0
                      ? <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text2)', fontSize: 13 }}>No results found</td></tr>
                      : filtered.map(app => (
                        <tr key={app.id} style={s.tr}>
                          <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11 }}>
                            {app.uid?.slice(0, 12)}...
                          </td>
                          <td style={s.td}>{app.company}</td>
                          <td style={s.td}>{app.position}</td>
                          <td style={s.td}><StatusBadge status={app.status}/></td>
                          <td style={s.td}>{app.appliedDate ? format(new Date(app.appliedDate), 'MMM d, yyyy') : '—'}</td>
                          <td style={s.td}>{app.deadline ? format(new Date(app.deadline), 'MMM d, yyyy') : '—'}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 10 }}>
                Showing {filtered.length} of {apps.length} total applications
              </p>
            </>
          )
        }
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = { Applied: 'status-applied', Interview: 'status-interview', Offered: 'status-offered', Rejected: 'status-rejected', Withdrawn: 'status-withdrawn' }
  return <span className={map[status]} style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>{status}</span>
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg)' },
  topbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 28px', background: 'var(--surface)',
    borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50
  },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  logo: {
    width: 32, height: 32, borderRadius: 8, background: '#dc2626',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  title: { fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)' },
  iconBtn: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '6px 8px', color: 'var(--text2)',
    cursor: 'pointer', display: 'flex', alignItems: 'center'
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
    background: 'transparent', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text2)', cursor: 'pointer', fontSize: 13
  },
  body: { padding: '28px' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 14, marginBottom: 24
  },
  statCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '16px'
  },
  statValue: { fontSize: 28, fontWeight: 700, lineHeight: 1.1, marginBottom: 4 },
  statLabel: { fontSize: 12, color: 'var(--text2)' },
  filters: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 },
  searchInput: {
    flex: 1, minWidth: 200, padding: '9px 12px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none'
  },
  filterBtn: { padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, cursor: 'pointer' },
  filterBtnActive: { background: '#dc2626', color: '#fff', borderColor: '#dc2626' },
  tableWrap: { overflowX: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text2)', padding: '12px 14px', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '12px 14px', fontSize: 13, color: 'var(--text)' }
}
