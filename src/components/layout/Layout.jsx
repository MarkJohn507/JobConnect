import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { LayoutDashboard, Briefcase, User, LogOut, Sun, Moon } from 'lucide-react'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications', icon: Briefcase,        label: 'Applications' },
  { to: '/profile',      icon: User,             label: 'Profile' },
]

export default function Layout() {
  const { currentUser } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>JC</span>
          <span style={styles.logoText}>Job<em>Connect</em></span>
        </div>

        <nav style={styles.nav}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
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
          {/* Theme toggle */}
          <button style={styles.themeToggle} onClick={toggle} title="Toggle light/dark mode">
            {dark ? <Sun size={16}/> : <Moon size={16}/>}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div style={styles.divider}/>

          <div style={styles.userChip}>
            <div style={styles.avatar}>
              {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={styles.userName}>{currentUser?.displayName || 'User'}</div>
              <div style={styles.userEmail}>{currentUser?.email}</div>
            </div>
          </div>

          <button style={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16}/> Logout
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

const styles = {
  shell: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },
  sidebar: {
    width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', padding: '24px 16px',
    position: 'sticky', top: 0, height: '100vh', flexShrink: 0
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10, background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0
  },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text)' },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    borderRadius: 8, color: 'var(--text2)', textDecoration: 'none',
    fontSize: 14, fontWeight: 500, transition: 'all 0.15s'
  },
  navLinkActive: { background: 'rgba(108,99,255,0.15)', color: 'var(--accent)' },
  sidebarBottom: { paddingTop: 12 },
  themeToggle: {
    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
    padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface2)', color: 'var(--text2)', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, marginBottom: 12
  },
  divider: { height: 1, background: 'var(--border)', margin: '4px 0 12px' },
  userChip: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, overflow: 'hidden' },
  avatar: {
    width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0
  },
  userName: { fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { fontSize: 11, color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
    padding: '8px 12px', borderRadius: 8, border: 'none',
    background: 'transparent', color: 'var(--text2)', cursor: 'pointer',
    fontSize: 13, fontWeight: 500
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  content: { padding: '32px 28px', flex: 1 }
}
