import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { LayoutDashboard, Briefcase, User, LogOut, Menu, X, Settings, Brain, BarChart3 } from 'lucide-react'

const NAV = [
  { to: '/dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications', Icon: Briefcase, label: 'Applications' },
  { to: '/insights', Icon: Brain, label: 'Insights' },
  { to: '/benchmark', Icon: BarChart3, label: 'Benchmarks' },
  { to: '/profile', Icon: User, label: 'Profile' },
  { to: '/settings', Icon: Settings, label: 'Settings' },
]

// Track screen size outside state to avoid re-renders
const isMobile = () => window.innerWidth <= 640

export default function Layout() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onResize = () => {
      if (!isMobile()) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleHamburger = () => {
    if (isMobile()) {
      setMobileOpen(o => !o)
    } else {
      setCollapsed(o => !o)
    }
  }

  const closeMobile = () => setMobileOpen(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out')
      navigate('/')
    } catch (err) {
      console.error(err)
      toast.error('Logout failed')
    }
  }

  const displayName = currentUser?.displayName || currentUser?.name || 'User'
  const displayEmail = currentUser?.email || ''
  const avatarLetter = (displayName?.[0] || displayEmail?.[0] || 'U').toUpperCase()

  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay${mobileOpen ? ' open' : ''}`}
        onClick={closeMobile}
      />

      <aside
        className={[
          'sidebar',
          mobileOpen ? ' open' : '',
          collapsed ? ' collapsed' : '',
        ].join(' ')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
          <span style={st.logoIcon}>JC</span>
          <span style={st.logoText}>Job<em>Connect</em></span>
          <button onClick={closeMobile} className="sidebar-x-btn" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {NAV.map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMobile}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ paddingTop: 12 }}>
          <div style={st.divider} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, overflow: 'hidden' }}>
            <div style={st.avatar}>{avatarLetter}</div>
            <div style={{ minWidth: 0 }}>
              <div style={st.userName}>{displayName}</div>
              <div style={st.userEmail}>{displayEmail}</div>
            </div>
          </div>
          <button style={st.logoutBtn} onClick={handleLogout}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="main-topbar">
          <button style={st.iconBtn} onClick={handleHamburger} aria-label="Toggle menu">
            <Menu size={22} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="mobile-only">
            <span style={st.logoIcon}>JC</span>
            <span style={st.logoText}>Job<em>Connect</em></span>
          </div>
        </div>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

const st = {
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--text)', flex: 1 },
  divider: { height: 1, background: 'var(--border)', margin: '4px 0 12px' },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: 11,
    color: 'var(--text2)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
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
    fontWeight: 500,
    fontFamily: 'var(--font)',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text2)',
    cursor: 'pointer',
    display: 'flex',
    padding: 6,
    borderRadius: 8,
  },
}