import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, Briefcase, User, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications', icon: Briefcase,        label: 'Applications' },
  { to: '/profile',      icon: User,             label: 'Profile' },
]

export default function Layout() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div style={styles.shell}>
      {/* Mobile overlay */}
      {open && <div style={styles.overlay} onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, left: open ? 0 : undefined }}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>JC</span>
          <span style={styles.logoText}>Job<em>Connect</em></span>
        </div>

        <nav style={styles.nav}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {})
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.userChip}>
            <div style={styles.avatar}>
              {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={styles.userName}>
                {currentUser?.displayName || 'User'}
              </div>
              <div style={styles.userEmail}>{currentUser?.email}</div>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <button style={styles.menuBtn} onClick={() => setOpen(o => !o)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

const styles = {
  shell: {
    display: 'flex', minHeight: '100vh', background: 'var(--bg)'
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    zIndex: 40, display: 'none',
    '@media(maxWidth:768px)': { display: 'block' }
  },
  sidebar: {
    width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', padding: '24px 16px',
    position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
    zIndex: 50
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36
  },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10, background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0
  },
  logoText: {
    fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text)',
    letterSpacing: '-0.5px'
  },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    borderRadius: 8, color: 'var(--text2)', textDecoration: 'none',
    fontSize: 14, fontWeight: 500, transition: 'all 0.15s'
  },
  navLinkActive: {
    background: 'rgba(108,99,255,0.15)', color: 'var(--accent)'
  },
  sidebarBottom: { borderTop: '1px solid var(--border)', paddingTop: 16 },
  userChip: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  avatar: {
    width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0
  },
  userName: { fontSize: 13, fontWeight: 600, color: 'var(--text)' },
  userEmail: { fontSize: 11, color: 'var(--text2)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
    padding: '8px 12px', borderRadius: 8, border: 'none',
    background: 'transparent', color: 'var(--text2)', cursor: 'pointer',
    fontSize: 13, fontWeight: 500
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  menuBtn: {
    display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 60,
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 8, padding: 8, color: 'var(--text)', cursor: 'pointer'
  },
  content: { padding: '32px 28px', flex: 1 }
}
