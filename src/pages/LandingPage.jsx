import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

const MOCK = [
  { company:'Google', role:'Software Intern', status:'Interview', color:'#4ade80', bg:'#1a3a2a' },
  { company:'Meta',   role:'Product Intern',  status:'Applied',   color:'#60a5fa', bg:'#1e3a5f' },
  { company:'Grab',   role:'Backend Intern',  status:'Offered',   color:'#fbbf24', bg:'#2d2a1a' },
  { company:'Shopee', role:'Frontend Intern', status:'Rejected',  color:'#f87171', bg:'#3a1a1a' },
]

const FEATURES = [
  { e:'📋', title:'Track Applications', desc:'Log every application with company, position, status, and dates.' },
  { e:'📅', title:'Deadline Reminders', desc:'Never miss a deadline — see upcoming dates at a glance on your dashboard.' },
  { e:'📄', title:'Resume Storage',     desc:'Upload and attach resumes to each application via Cloudinary cloud storage.' },
  { e:'📊', title:'Progress Dashboard', desc:'Visualize your job search with live stats and a status breakdown chart.' },
]

export default function LandingPage() {
  const { dark, toggle } = useTheme()

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {/* Theme toggle */}
      <button onClick={toggle} style={s.themeBtn} aria-label="Toggle theme">
        {dark ? <Sun size={18}/> : <Moon size={18}/>}
      </button>

      {/* Nav */}
      <nav className="landing-nav">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={s.logoIcon}>JC</div>
          <span style={s.logoText}>Job<em>Connect</em></span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Link to="/login" style={{ color:'var(--text2)', textDecoration:'none', fontSize:14, fontWeight:500 }}>Sign In</Link>
          <Link to="/register" style={s.navBtn}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-inner">
          <div style={s.badge}>Free for students &amp; graduates</div>
          <h1 className="hero-title" style={s.heroTitle}>
            Track every job<br/>application.<br/><em>Miss nothing.</em>
          </h1>
          <p style={{ fontSize:16, color:'var(--text2)', lineHeight:1.75, marginBottom:32 }}>
            Job Connect helps you organize every internship and job application in one place
            — deadlines, statuses, resumes, and more.
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Link to="/register" style={s.ctaPrimary}>Create Free Account</Link>
            <Link to="/login"    style={s.ctaOutline}>Sign In</Link>
          </div>
        </div>

        {/* Mock preview card */}
        <div className="mock-card fade-in" style={s.mockCard}>
          <div style={{ display:'flex', gap:6, marginBottom:16 }}>
            {['#f87171','#fbbf24','#4ade80'].map(c => <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>)}
          </div>
          {MOCK.map(item => (
            <div key={item.company} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{item.company}</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>{item.role}</div>
              </div>
              <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:6, color:item.color, background:item.bg }}>{item.status}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="feat-section" style={s.featSection}>
        <h2 style={s.sectionTitle}>Everything you need to stay organized</h2>
        <div className="feat-grid">
          {FEATURES.map(f => (
            <div key={f.title} style={s.featCard}>
              <div style={{ fontSize:28, marginBottom:12 }}>{f.e}</div>
              <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:8 }}>{f.title}</h3>
              <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="cta-section" style={s.ctaSection}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:30, color:'var(--text)', marginBottom:10 }}>
          Ready to organize your job search?
        </h2>
        <p style={{ color:'var(--text2)', fontSize:15, marginBottom:28 }}>Free to use. No credit card required.</p>
        <Link to="/register" style={s.ctaPrimary}>Get Started for Free</Link>
      </section>

      {/* Footer */}
      <footer className="site-footer" style={s.footer}>
        <p style={{ color:'var(--text2)', fontSize:13 }}>© 2025 Job Connect · Built for students &amp; fresh graduates</p>
        <Link to="/admin/login" style={{ color:'var(--text2)', fontSize:12, textDecoration:'none' }}>Admin</Link>
      </footer>
    </div>
  )
}

const s = {
  themeBtn: { position:'fixed', top:16, right:16, zIndex:200, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 10px', color:'var(--text2)', cursor:'pointer', display:'flex', alignItems:'center' },
  logoIcon: { width:36, height:36, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 },
  logoText: { fontFamily:'var(--font-display)', fontSize:20, color:'var(--text)' },
  navBtn: { padding:'8px 18px', background:'var(--accent)', color:'#fff', borderRadius:8, textDecoration:'none', fontSize:14, fontWeight:600 },
  badge: { display:'inline-block', padding:'4px 14px', borderRadius:20, background:'rgba(108,99,255,0.15)', color:'var(--accent)', fontSize:12, fontWeight:600, marginBottom:20 },
  heroTitle: { fontFamily:'var(--font-display)', fontSize:46, color:'var(--text)', lineHeight:1.15, marginBottom:20 },
  ctaPrimary: { padding:'12px 26px', background:'var(--accent)', color:'#fff', borderRadius:10, textDecoration:'none', fontSize:15, fontWeight:600 },
  ctaOutline: { padding:'12px 26px', border:'1px solid var(--border)', color:'var(--text)', borderRadius:10, textDecoration:'none', fontSize:15 },
  mockCard: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:20, boxShadow:'0 16px 48px rgba(0,0,0,0.25)' },
  featSection: { padding:'72px 48px', maxWidth:1100, margin:'0 auto' },
  sectionTitle: { fontFamily:'var(--font-display)', fontSize:30, color:'var(--text)', textAlign:'center', marginBottom:36 },
  featCard: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:24 },
  ctaSection: { textAlign:'center', padding:'72px 48px', borderTop:'1px solid var(--border)' },
  footer: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 48px', borderTop:'1px solid var(--border)' },
}
