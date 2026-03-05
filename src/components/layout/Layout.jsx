import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { LayoutDashboard, Briefcase, User, LogOut, Sun, Moon, Menu, X } from 'lucide-react'

const NAV = [
  { to: '/dashboard',    Icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications', Icon: Briefcase,        label: 'Applications' },
  { to: '/profile',      Icon: User,             label: 'Profile' },
]

export default function Layout() {
  const { currentUser } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="app-shell">
      {/* Overlay — mobile only */}
      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={close} />

      {/* Sidebar */}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Logo row */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:36 }}>
          <span style={st.logoIcon}>JC</span>
          <span style={st.logoText}>Job<em>Connect</em></span>
          {/* X close button — shown only on mobile via CSS class */}
          <button onClick={close} className="sidebar-x-btn" aria-label="Close menu">
            <X size={18}/>
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ display:'flex', flexDirection:'column', gap:4, flex:1 }}>
          {NAV.map(({ to, Icon, label }) => (
            <NavLink key={to} to={to} onClick={close}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon size={18}/>{label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div style={{ paddingTop:12 }}>
          <button style={st.themeBtn} onClick={toggle}>
            {dark ? <Sun size={15}/> : <Moon size={15}/>}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div style={st.divider}/>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, overflow:'hidden' }}>
            <div style={st.avatar}>
              {(currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U').toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={st.userName}>{currentUser?.displayName || 'User'}</div>
              <div style={st.userEmail}>{currentUser?.email}</div>
            </div>
          </div>
          <button style={st.logoutBtn} onClick={handleLogout}>
            <LogOut size={15}/> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Mobile topbar — hidden on desktop via CSS */}
        <div className="mobile-topbar">
          <button style={st.hamburger} onClick={() => setOpen(o => !o)} aria-label="Menu">
            <Menu size={22}/>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={st.logoIcon}>JC</span>
            <span style={st.logoText}>Job<em>Connect</em></span>
          </div>
          <button style={st.themeIconBtn} onClick={toggle} aria-label="Toggle theme">
            {dark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
        </div>

        <div className="page-content">
          <Outlet/>
        </div>
      </main>
    </div>
  )
}

const st = {
  logoIcon: {
    width:36, height:36, borderRadius:10, background:'var(--accent)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:13, fontWeight:700, color:'#fff', flexShrink:0,
  },
  logoText: { fontFamily:'var(--font-display)', fontSize:19, color:'var(--text)', flex:1 },
  themeBtn: {
    display:'flex', alignItems:'center', gap:8, width:'100%',
    padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)',
    background:'var(--surface2)', color:'var(--text2)', cursor:'pointer',
    fontSize:13, fontWeight:500, marginBottom:12, fontFamily:'var(--font)',
  },
  divider: { height:1, background:'var(--border)', margin:'4px 0 12px' },
  avatar: {
    width:34, height:34, borderRadius:'50%', background:'var(--accent)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:14, fontWeight:700, color:'#fff', flexShrink:0,
  },
  userName: { fontSize:13, fontWeight:600, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  userEmail: { fontSize:11, color:'var(--text2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  logoutBtn: {
    display:'flex', alignItems:'center', gap:8, width:'100%',
    padding:'8px 12px', borderRadius:8, border:'none',
    background:'transparent', color:'var(--text2)', cursor:'pointer',
    fontSize:13, fontWeight:500, fontFamily:'var(--font)',
  },
  hamburger: { background:'none', border:'none', color:'var(--text)', cursor:'pointer', display:'flex', padding:4 },
  themeIconBtn: { background:'none', border:'none', color:'var(--text2)', cursor:'pointer', display:'flex', padding:4 },
}
