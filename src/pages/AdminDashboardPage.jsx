import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { db } from '../firebase/config'
import { logout } from '../firebase/firestore'
import {
  collection, getDocs, doc, getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import {
  Sun, Moon, LogOut, ShieldCheck, Users, Briefcase,
  BarChart2, LayoutDashboard, Menu, X, UserCheck, UserX
} from 'lucide-react'

/* ══════════════════════════════════════════════════════
   SHARED: Admin Auth Guard
══════════════════════════════════════════════════════ */
function useAdminGuard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!currentUser) { navigate('/admin/login'); return }
    getDoc(doc(db, 'admins', currentUser.uid)).then(d => {
      if (!d.exists()) { toast.error('Access denied'); navigate('/admin/login') }
      else setReady(true)
    }).catch(() => navigate('/admin/login'))
  }, [currentUser])

  return ready
}

/* ══════════════════════════════════════════════════════
   SHARED: Admin Layout (sidebar + mobile topbar)
══════════════════════════════════════════════════════ */
function AdminLayout({ children, active }) {
  const { currentUser } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/admin/login')
  }

  const NAV = [
    { label: 'Dashboard',    Icon: LayoutDashboard, path: '/admin/dashboard'    },
    { label: 'Users',        Icon: Users,           path: '/admin/users'        },
    { label: 'Applications', Icon: Briefcase,       path: '/admin/applications' },
    { label: 'Analytics',    Icon: BarChart2,       path: '/admin/analytics'    },
  ]

  return (
    <div className="app-shell">
      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)}/>

      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:36 }}>
          <div style={al.logoIcon}><ShieldCheck size={17} color="#fff"/></div>
          <span style={al.logoText}>Admin Panel</span>
          <button onClick={() => setOpen(false)} className="sidebar-x-btn"><X size={18}/></button>
        </div>

        {/* Nav */}
        <nav style={{ display:'flex', flexDirection:'column', gap:4, flex:1 }}>
          {NAV.map(({ label, Icon, path }) => (
            <button key={path} onClick={() => { navigate(path); setOpen(false) }}
              style={{ ...al.navBtn, ...(active===label ? al.navActive : {}) }}>
              <Icon size={17}/>{label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ paddingTop:12 }}>
          <button style={al.themeBtn} onClick={toggle}>
            {dark ? <Sun size={15}/> : <Moon size={15}/>}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div style={{ height:1, background:'var(--border)', margin:'8px 0 12px' }}/>
          <div style={{ fontSize:11, color:'var(--text2)', marginBottom:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {currentUser?.email}
          </div>
          <button style={al.logoutBtn} onClick={handleLogout}>
            <LogOut size={15}/> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {/* Mobile topbar */}
        <div className="mobile-topbar">
          <button style={al.iconBtn} onClick={() => setOpen(o=>!o)}><Menu size={22}/></button>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={al.logoIcon}><ShieldCheck size={15} color="#fff"/></div>
            <span style={{ fontFamily:'var(--font-display)', fontSize:17, color:'var(--text)' }}>Admin Panel</span>
          </div>
          <button style={al.iconBtn} onClick={toggle}>
            {dark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
        </div>

        <div className="page-content">{children}</div>
      </main>
    </div>
  )
}

const al = {
  logoIcon: { width:36, height:36, borderRadius:10, background:'#dc2626', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  logoText: { fontFamily:'var(--font-display)', fontSize:18, color:'var(--text)', flex:1 },
  navBtn: { display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, border:'none', background:'transparent', color:'var(--text2)', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'var(--font)', width:'100%', textAlign:'left', transition:'all 0.15s' },
  navActive: { background:'rgba(220,38,38,0.12)', color:'#dc2626' },
  themeBtn: { display:'flex', alignItems:'center', gap:8, width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface2)', color:'var(--text2)', cursor:'pointer', fontSize:13, fontWeight:500, marginBottom:8, fontFamily:'var(--font)' },
  logoutBtn: { display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 12px', borderRadius:8, border:'none', background:'transparent', color:'var(--text2)', cursor:'pointer', fontSize:13, fontFamily:'var(--font)' },
  iconBtn: { background:'none', border:'none', color:'var(--text)', cursor:'pointer', display:'flex', padding:4 },
}

function Spinner() {
  return (
    <div style={{ display:'flex', justifyContent:'center', padding:80 }}>
      <div className="spin" style={{ width:34, height:34, border:'3px solid var(--border)', borderTopColor:'#dc2626', borderRadius:'50%' }}/>
    </div>
  )
}

const BADGE = { Applied:'badge-applied', Interview:'badge-interview', Offered:'badge-offered', Rejected:'badge-rejected', Withdrawn:'badge-withdrawn' }
const ps = {
  title: { fontFamily:'var(--font-display)', fontSize:24, color:'var(--text)', marginBottom:4 },
  sub:   { color:'var(--text2)', fontSize:13, marginBottom:24 },
  cardTitle: { fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:16 },
}

/* ══════════════════════════════════════════════════════
   PAGE 1: DASHBOARD
══════════════════════════════════════════════════════ */
export function AdminDashboardPage() {
  const ready = useAdminGuard()
  const [apps, setApps]     = useState([])
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    Promise.all([
      getDocs(collection(db, 'applications')),
      getDocs(collection(db, 'users')),
    ]).then(([aSnap, uSnap]) => {
      setApps(aSnap.docs.map(d => ({ id:d.id, ...d.data() })))
      setUsers(uSnap.docs.map(d => ({ id:d.id, ...d.data() })))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [ready])

  if (!ready || loading) return <AdminLayout active="Dashboard"><Spinner/></AdminLayout>

  const total     = apps.length
  const interview = apps.filter(a => a.status==='Interview').length
  const offered   = apps.filter(a => a.status==='Offered').length
  const rejected  = apps.filter(a => a.status==='Rejected').length
  const active    = users.filter(u => !u.disabled).length
  const recent    = [...apps].sort((a,b) => (b.createdAt?.seconds??0)-(a.createdAt?.seconds??0)).slice(0,8)

  return (
    <AdminLayout active="Dashboard">
      <div className="fade-in">
        <h2 style={ps.title}>Dashboard Overview</h2>
        <p style={ps.sub}>System-wide summary of all users and applications.</p>

        <div className="admin-stats">
          {[
            { label:'Total Users',   val:users.length, color:'#6c63ff' },
            { label:'Active Users',  val:active,       color:'#4ade80' },
            { label:'Total Apps',    val:total,        color:'#60a5fa' },
            { label:'Interviews',    val:interview,    color:'#fbbf24' },
            { label:'Offers',        val:offered,      color:'#a78bfa' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 14px', borderLeft:`4px solid ${color}` }}>
              <div style={{ fontSize:26, fontWeight:700, color, lineHeight:1.1, marginBottom:4 }}>{val}</div>
              <div style={{ fontSize:12, color:'var(--text2)' }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={ps.cardTitle}>Recent Applications (All Users)</h3>
          <div className="table-wrap">
            <table>
              <thead><tr>
                {['Company','Position','Status','Applied Date'].map(h=><th key={h}>{h}</th>)}
              </tr></thead>
              <tbody>
                {recent.length === 0
                  ? <tr><td colSpan={4} style={{ textAlign:'center', padding:24, color:'var(--text2)' }}>No applications yet</td></tr>
                  : recent.map(app => (
                    <tr key={app.id}>
                      <td style={{ fontWeight:500 }}>{app.company}</td>
                      <td>{app.position}</td>
                      <td><span className={`badge ${BADGE[app.status]||'badge-applied'}`}>{app.status}</span></td>
                      <td style={{ whiteSpace:'nowrap' }}>{app.appliedDate ? format(new Date(app.appliedDate),'MMM d, yyyy') : '—'}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

/* ══════════════════════════════════════════════════════
   PAGE 2: USERS (view + deactivate/reactivate)
══════════════════════════════════════════════════════ */
export function AdminUsersPage() {
  const ready = useAdminGuard()
  const [users, setUsers]   = useState([])
  const [apps, setApps]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilter] = useState('All')
  const [toggling, setToggling] = useState(null)

  const load = async () => {
    try {
      const [uSnap, aSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'applications')),
      ])
      setUsers(uSnap.docs.map(d => ({ id:d.id, ...d.data() })))
      setApps(aSnap.docs.map(d => ({ id:d.id, ...d.data() })))
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  useEffect(() => { if (ready) load() }, [ready])

  // Toggle disabled flag in Firestore
  const toggleDisabled = async (user) => {
    setToggling(user.id)
    try {
      const next = !user.disabled
      await updateDoc(doc(db, 'users', user.id), {
        disabled: next,
        updatedAt: serverTimestamp(),
      })
      setUsers(prev => prev.map(u => u.id===user.id ? { ...u, disabled:next } : u))
      toast.success(next ? `${user.displayName||user.email} deactivated` : `${user.displayName||user.email} reactivated`)
    } catch { toast.error('Failed to update account status') }
    finally { setToggling(null) }
  }

  const filtered = users
    .filter(u =>
      (u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
       u.email?.toLowerCase().includes(search.toLowerCase())) &&
      (filterStatus==='All' ||
       (filterStatus==='Active' && !u.disabled) ||
       (filterStatus==='Disabled' && u.disabled))
    )
    .sort((a,b) => (b.createdAt?.seconds??0)-(a.createdAt?.seconds??0))

  if (!ready || loading) return <AdminLayout active="Users"><Spinner/></AdminLayout>

  return (
    <AdminLayout active="Users">
      <div className="fade-in">
        <h2 style={ps.title}>User Management</h2>
        <p style={ps.sub}>{users.length} registered user{users.length!==1?'s':''} · {users.filter(u=>u.disabled).length} deactivated</p>

        <div className="filter-bar">
          <input className="input" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search by name or email…" style={{ flex:1, minWidth:180 }}/>
          <div style={{ display:'flex', gap:6 }}>
            {['All','Active','Disabled'].map(f => (
              <button key={f} onClick={()=>setFilter(f)} style={{
                padding:'6px 14px', borderRadius:6, border:'1px solid var(--border)',
                background: filterStatus===f ? '#dc2626' : 'transparent',
                color: filterStatus===f ? '#fff' : 'var(--text2)',
                fontSize:12, cursor:'pointer', fontFamily:'var(--font)',
              }}>{f}</button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead><tr>
                {['Name','Email','Date Joined','No. of Apps','Status','Action'].map(h=><th key={h}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.length===0
                  ? <tr><td colSpan={6} style={{ textAlign:'center', padding:32, color:'var(--text2)' }}>No users found</td></tr>
                  : filtered.map(user => {
                      const userApps = apps.filter(a=>a.uid===user.id)
                      const isDisabled = user.disabled===true
                      return (
                        <tr key={user.id}>
                          <td style={{ fontWeight:600 }}>{user.displayName || <span style={{ color:'var(--text2)' }}>—</span>}</td>
                          <td>{user.email}</td>
                          <td style={{ whiteSpace:'nowrap' }}>
                            {user.createdAt ? format(new Date(user.createdAt.seconds*1000),'MMM d, yyyy') : '—'}
                          </td>
                          <td style={{ textAlign:'center' }}>{userApps.length}</td>
                          <td>
                            <span className="badge" style={{
                              background: isDisabled ? (document.documentElement.getAttribute('data-theme')==='light' ? '#fee2e2' : '#3a1a1a') : (document.documentElement.getAttribute('data-theme')==='light' ? '#dcfce7' : '#1a3a2a'),
                              color: isDisabled ? '#f87171' : '#4ade80'
                            }}>
                              {isDisabled ? 'Disabled' : 'Active'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => toggleDisabled(user)}
                              disabled={toggling===user.id}
                              style={{
                                display:'inline-flex', alignItems:'center', gap:5,
                                padding:'5px 12px', borderRadius:6, border:'1px solid var(--border)',
                                background:'transparent', cursor:'pointer', fontSize:12, fontFamily:'var(--font)',
                                color: isDisabled ? '#4ade80' : '#f87171',
                                opacity: toggling===user.id ? 0.5 : 1,
                              }}
                            >
                              {isDisabled ? <><UserCheck size={13}/>Reactivate</> : <><UserX size={13}/>Deactivate</>}
                            </button>
                          </td>
                        </tr>
                      )
                    })
                }
              </tbody>
            </table>
          </div>
        </div>
        <p style={{ fontSize:12, color:'var(--text2)', marginTop:10 }}>Showing {filtered.length} of {users.length} users</p>
      </div>
    </AdminLayout>
  )
}

/* ══════════════════════════════════════════════════════
   PAGE 3: APPLICATIONS (read-only view of all)
══════════════════════════════════════════════════════ */
export function AdminApplicationsPage() {
  const ready = useAdminGuard()
  const [apps, setApps]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilter] = useState('All')

  useEffect(() => {
    if (!ready) return
    getDocs(collection(db, 'applications')).then(snap => {
      const data = snap.docs.map(d=>({ id:d.id, ...d.data() }))
      data.sort((a,b)=>(b.createdAt?.seconds??0)-(a.createdAt?.seconds??0))
      setApps(data)
      setLoading(false)
    }).catch(()=>setLoading(false))
  }, [ready])

  const STATUSES = ['Applied','Interview','Offered','Rejected','Withdrawn']
  const filtered = apps.filter(a =>
    (a.company?.toLowerCase().includes(search.toLowerCase()) ||
     a.position?.toLowerCase().includes(search.toLowerCase()) ||
     a.uid?.includes(search)) &&
    (filterStatus==='All' || a.status===filterStatus)
  )

  if (!ready || loading) return <AdminLayout active="Applications"><Spinner/></AdminLayout>

  return (
    <AdminLayout active="Applications">
      <div className="fade-in">
        <h2 style={ps.title}>All Applications</h2>
        <p style={ps.sub}>{apps.length} total application{apps.length!==1?'s':''} across all users</p>

        <div className="filter-bar">
          <input className="input" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search company, position, or user ID…" style={{ flex:1, minWidth:200 }}/>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['All',...STATUSES].map(st => (
              <button key={st} onClick={()=>setFilter(st)} style={{
                padding:'6px 12px', borderRadius:6, border:'1px solid var(--border)',
                background: filterStatus===st ? '#dc2626' : 'transparent',
                color: filterStatus===st ? '#fff' : 'var(--text2)',
                fontSize:12, cursor:'pointer', fontFamily:'var(--font)',
              }}>{st}</button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead><tr>
                {['User ID','Company','Position','Status','Applied','Deadline','Resume'].map(h=><th key={h}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.length===0
                  ? <tr><td colSpan={7} style={{ textAlign:'center', padding:32, color:'var(--text2)' }}>No results found</td></tr>
                  : filtered.map(app => (
                    <tr key={app.id}>
                      <td style={{ fontFamily:'monospace', fontSize:11 }}>{app.uid?.slice(0,12)}…</td>
                      <td style={{ fontWeight:500 }}>{app.company}</td>
                      <td>{app.position}</td>
                      <td><span className={`badge ${BADGE[app.status]||'badge-applied'}`}>{app.status}</span></td>
                      <td style={{ whiteSpace:'nowrap' }}>{app.appliedDate ? format(new Date(app.appliedDate),'MMM d, yyyy') : '—'}</td>
                      <td style={{ whiteSpace:'nowrap' }}>{app.deadline ? format(new Date(app.deadline),'MMM d, yyyy') : '—'}</td>
                      <td>
                        {app.resumeUrl
                          ? <a href={app.resumeUrl} target="_blank" rel="noreferrer" style={{ color:'var(--accent)', fontSize:12 }}>View</a>
                          : <span style={{ color:'var(--text2)', fontSize:12 }}>None</span>
                        }
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
        <p style={{ fontSize:12, color:'var(--text2)', marginTop:10 }}>Showing {filtered.length} of {apps.length} applications</p>
      </div>
    </AdminLayout>
  )
}

/* ══════════════════════════════════════════════════════
   PAGE 4: ANALYTICS & REPORTS
══════════════════════════════════════════════════════ */
export function AdminAnalyticsPage() {
  const ready = useAdminGuard()
  const [apps, setApps]   = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    Promise.all([
      getDocs(collection(db, 'applications')),
      getDocs(collection(db, 'users')),
    ]).then(([aSnap, uSnap]) => {
      setApps(aSnap.docs.map(d=>({ id:d.id, ...d.data() })))
      setUsers(uSnap.docs.map(d=>({ id:d.id, ...d.data() })))
      setLoading(false)
    }).catch(()=>setLoading(false))
  }, [ready])

  if (!ready || loading) return <AdminLayout active="Analytics"><Spinner/></AdminLayout>

  const total     = apps.length
  const applied   = apps.filter(a=>a.status==='Applied').length
  const interview = apps.filter(a=>a.status==='Interview').length
  const offered   = apps.filter(a=>a.status==='Offered').length
  const rejected  = apps.filter(a=>a.status==='Rejected').length
  const withdrawn = apps.filter(a=>a.status==='Withdrawn').length
  const successRate   = total ? ((offered/total)*100).toFixed(1) : '0.0'
  const interviewRate = total ? ((interview/total)*100).toFixed(1) : '0.0'
  const activeUsers   = users.filter(u=>!u.disabled).length

  const STATUS_BARS = [
    { label:'Applied',   count:applied,   color:'#60a5fa' },
    { label:'Interview', count:interview, color:'#4ade80' },
    { label:'Offered',   count:offered,   color:'#fbbf24' },
    { label:'Rejected',  count:rejected,  color:'#f87171' },
    { label:'Withdrawn', count:withdrawn, color:'#9090a8' },
  ]

  // Monthly applications — last 6 months
  const now = new Date()
  const months = Array.from({ length:6 }, (_,i) => {
    const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1)
    return { label: d.toLocaleString('default',{month:'short'}), month:d.getMonth(), year:d.getFullYear() }
  })
  const monthlyData = months.map(m => ({
    ...m,
    count: apps.filter(a => {
      if (!a.createdAt?.seconds) return false
      const d = new Date(a.createdAt.seconds*1000)
      return d.getMonth()===m.month && d.getFullYear()===m.year
    }).length
  }))
  const maxBar = Math.max(...monthlyData.map(m=>m.count), 1)

  // Monthly users joined
  const monthlyUsers = months.map(m => ({
    ...m,
    count: users.filter(u => {
      if (!u.createdAt?.seconds) return false
      const d = new Date(u.createdAt.seconds*1000)
      return d.getMonth()===m.month && d.getFullYear()===m.year
    }).length
  }))
  const maxUserBar = Math.max(...monthlyUsers.map(m=>m.count), 1)

  // Top 5 companies applied to
  const companyCounts = {}
  apps.forEach(a => { if(a.company) companyCounts[a.company] = (companyCounts[a.company]||0)+1 })
  const topCompanies = Object.entries(companyCounts).sort((a,b)=>b[1]-a[1]).slice(0,5)

  return (
    <AdminLayout active="Analytics">
      <div className="fade-in">
        <h2 style={ps.title}>Analytics & Reports</h2>
        <p style={ps.sub}>System-wide usage statistics and trends.</p>

        {/* KPI cards */}
        <div className="admin-stats">
          {[
            { label:'Total Users',    val:users.length,  color:'#6c63ff' },
            { label:'Active Users',   val:activeUsers,   color:'#4ade80' },
            { label:'Total Apps',     val:total,         color:'#60a5fa' },
            { label:'Success Rate',   val:`${successRate}%`,   color:'#fbbf24' },
            { label:'Interview Rate', val:`${interviewRate}%`, color:'#a78bfa' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 14px', borderLeft:`4px solid ${color}` }}>
              <div style={{ fontSize:24, fontWeight:700, color, lineHeight:1.1, marginBottom:4 }}>{val}</div>
              <div style={{ fontSize:12, color:'var(--text2)' }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="two-col" style={{ marginBottom:20 }}>
          {/* Status breakdown */}
          <div className="card">
            <h3 style={ps.cardTitle}>Application Status Breakdown</h3>
            {STATUS_BARS.map(({ label, count, color }) => {
              const pct = total ? (count/total*100) : 0
              return (
                <div key={label} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:13, color:'var(--text2)' }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>
                      {count} <span style={{ color:'var(--text2)', fontWeight:400 }}>({pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div style={{ height:10, background:'var(--surface2)', borderRadius:5, overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:5, transition:'width 0.6s ease' }}/>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Top companies */}
          <div className="card">
            <h3 style={ps.cardTitle}>Top Companies Applied To</h3>
            {topCompanies.length===0
              ? <p style={{ color:'var(--text2)', fontSize:13 }}>No data yet</p>
              : topCompanies.map(([company, count], i) => (
                <div key={company} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:26, height:26, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
                    {i+1}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{company}</div>
                    <div style={{ height:5, background:'var(--surface2)', borderRadius:3, marginTop:4, overflow:'hidden' }}>
                      <div style={{ width:`${(count/topCompanies[0][1])*100}%`, height:'100%', background:'var(--accent)', borderRadius:3 }}/>
                    </div>
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', flexShrink:0 }}>{count}</div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="two-col">
          {/* Monthly applications bar chart */}
          <div className="card">
            <h3 style={ps.cardTitle}>Applications per Month (Last 6 Months)</h3>
            <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:130, marginBottom:10 }}>
              {monthlyData.map(m => (
                <div key={m.label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <span style={{ fontSize:11, color:'var(--text2)', fontWeight:600 }}>{m.count||''}</span>
                  <div style={{
                    width:'100%', background:'var(--accent)', opacity: m.count===0 ? 0.15 : 1,
                    borderRadius:'4px 4px 0 0',
                    height:`${Math.max((m.count/maxBar)*110, m.count>0?4:0)}px`,
                    transition:'height 0.6s ease'
                  }}/>
                  <span style={{ fontSize:11, color:'var(--text2)' }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly users registered */}
          <div className="card">
            <h3 style={ps.cardTitle}>New Users per Month (Last 6 Months)</h3>
            <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:130, marginBottom:10 }}>
              {monthlyUsers.map(m => (
                <div key={m.label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <span style={{ fontSize:11, color:'var(--text2)', fontWeight:600 }}>{m.count||''}</span>
                  <div style={{
                    width:'100%', background:'#4ade80', opacity: m.count===0 ? 0.15 : 1,
                    borderRadius:'4px 4px 0 0',
                    height:`${Math.max((m.count/maxUserBar)*110, m.count>0?4:0)}px`,
                    transition:'height 0.6s ease'
                  }}/>
                  <span style={{ fontSize:11, color:'var(--text2)' }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboardPage
