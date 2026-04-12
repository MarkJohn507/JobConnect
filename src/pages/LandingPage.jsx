import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import toast from 'react-hot-toast'
import { Sun, Moon, Loader } from 'lucide-react'

const ALLOWED_DOMAIN = 'thelewiscollege.edu.ph' // confirm exact domain with IT

const MOCK = [
  { company:'Google', role:'Software Intern', status:'Interview', color:'#facc15', bg:'rgba(250,204,21,0.12)' },
  { company:'Meta',   role:'Product Intern',  status:'Applied',   color:'#60a5fa', bg:'rgba(96,165,250,0.12)' },
  { company:'Grab',   role:'Backend Intern',  status:'Offer',     color:'#4ade80', bg:'rgba(74,222,128,0.12)' },
  { company:'Shopee', role:'Frontend Intern', status:'Rejected',  color:'#f87171', bg:'rgba(248,113,113,0.12)' },
]

const FEATURES = [
  { e:'📋', title:'Track Applications', desc:'Log every application with company, position, status, and dates.' },
  { e:'📅', title:'Deadline Reminders', desc:'Never miss a deadline — see upcoming dates at a glance on your dashboard.' },
  { e:'📄', title:'Resume Storage',     desc:'Upload and attach resumes to each application via Cloudinary cloud storage.' },
  { e:'📊', title:'Progress Dashboard', desc:'Visualize your job search with live stats and a status breakdown chart.' },
]

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink:0 }}>
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-8 19.6-20 0-1.3-.1-2.7-.4-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.6 4.8C9.8 39.7 16.4 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
    </svg>
  )
}

// ── Shared Google Sign-In logic ───────────────────────
function useGoogleSignIn() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const signIn = async () => {
    setLoading(true)
    const auth     = getAuth()
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ hd: ALLOWED_DOMAIN })

    try {
      const cred  = await signInWithPopup(auth, provider)
      const user  = cred.user
      const email = user.email ?? ''

      // Hard domain enforcement — hd param is hint only (FR-02)
      if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        await auth.signOut()
        toast.error('Only Lewis College institutional accounts are allowed.')
        return
      }

      // Create Firestore profile on first sign-in (FR-03)
      const userRef = doc(db, 'users', user.uid)
      const snap    = await getDoc(userRef)

      if (!snap.exists()) {
        await setDoc(userRef, {
          uid:       user.uid,
          name:      user.displayName ?? '',
          email:     email,
          role:      'user',
          createdAt: serverTimestamp(),
        })
      }

      // Role-based redirect (FR-26)
      const role = snap.exists() ? snap.data().role : 'user'
      toast.success('Welcome!')
      navigate(role === 'admin' ? '/admin' : '/dashboard')

    } catch (err) {
      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) return // user closed popup, no toast needed

      if (err.code === 'auth/network-request-failed') {
        toast.error('Network error. Check your connection and try again.')
        return
      }
      toast.error('Sign-in failed. Please try again.') // FR-04
    } finally {
      setLoading(false)
    }
  }

  return { signIn, loading }
}

// ── Landing Page ──────────────────────────────────────
export default function LandingPage() {
  const { dark, toggle } = useTheme()
  const { signIn, loading } = useGoogleSignIn()

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
        <button onClick={signIn} disabled={loading} style={s.navGoogleBtn}>
          {loading ? <Loader size={14} className="spin"/> : <><GoogleIcon/> Sign in with Google</>}
        </button>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-inner">
          <div style={s.badge}>Exclusive to Lewis College students &amp; graduates</div>
          <h1 className="hero-title" style={s.heroTitle}>
            Track every job<br/>application.<br/><em>Miss nothing.</em>
          </h1>
          <p style={{ fontSize:16, color:'var(--text2)', lineHeight:1.75, marginBottom:32 }}>
            Job Connect helps you organize every internship and job application in one place
            — deadlines, statuses, resumes, and more.
          </p>

          <button onClick={signIn} disabled={loading} style={s.ctaGoogle}>
            {loading
              ? <Loader size={16} className="spin"/>
              : <><GoogleIcon/> Sign in with Google</>}
          </button>
          <p style={{ fontSize:12, color:'var(--text2)', marginTop:12 }}>
            Use your <strong>@{ALLOWED_DOMAIN}</strong> account to get started.
          </p>
        </div>

        {/* Mock preview card */}
        <div className="mock-card fade-in" style={s.mockCard}>
          <div style={{ display:'flex', gap:6, marginBottom:16 }}>
            {['#f87171','#fbbf24','#4ade80'].map(c =>
              <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>
            )}
          </div>
          {MOCK.map(item => (
            <div key={item.company} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{item.company}</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>{item.role}</div>
              </div>
              <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:6, color:item.color, background:item.bg }}>
                {item.status}
              </span>
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
              <div style={{ fontSize:24, marginBottom:10 }}>{f.e}</div>
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
        <p style={{ color:'var(--text2)', fontSize:15, marginBottom:28 }}>
          Free for all Lewis College students and recent graduates.
        </p>
        <button onClick={signIn} disabled={loading} style={s.ctaGoogle}>
          {loading
            ? <Loader size={16} className="spin"/>
            : <><GoogleIcon/> Sign in with Google</>}
        </button>
      </section>

      {/* Footer */}
      <footer className="site-footer" style={s.footer}>
        <p style={{ color:'var(--text2)', fontSize:13 }}>© 2026 Job Connect · Built for Lewis College students &amp; graduates</p>
        <Link to="/admin/login" style={{ color:'var(--text2)', fontSize:12, textDecoration:'none' }}>Admin</Link>
      </footer>
    </div>
  )
}

const s = {
  themeBtn:    { position:'fixed', top:16, right:16, zIndex:200, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 10px', color:'var(--text2)', cursor:'pointer', display:'flex', alignItems:'center' },
  logoIcon:    { width:36, height:36, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 },
  logoText:    { fontFamily:'var(--font-display)', fontSize:20, color:'var(--text)' },
  navGoogleBtn:{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)' },
  badge:       { display:'inline-block', padding:'4px 14px', borderRadius:20, background:'rgba(108,99,255,0.15)', color:'var(--accent)', fontSize:12, fontWeight:600, marginBottom:20 },
  heroTitle:   { fontFamily:'var(--font-display)', fontSize:46, color:'var(--text)', lineHeight:1.15, marginBottom:20 },
  ctaGoogle:   { display:'flex', alignItems:'center', gap:10, padding:'12px 26px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text)', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)' },
  mockCard:    { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:20, boxShadow:'0 16px 48px rgba(0,0,0,0.25)' },
  featSection: { padding:'72px 48px', maxWidth:1100, margin:'0 auto' },
  sectionTitle:{ fontFamily:'var(--font-display)', fontSize:30, color:'var(--text)', textAlign:'center', marginBottom:36 },
  featCard:    { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:24 },
  ctaSection:  { textAlign:'center', padding:'72px 48px', borderTop:'1px solid var(--border)' },
  footer:      { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 48px', borderTop:'1px solid var(--border)' },
}