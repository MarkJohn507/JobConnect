import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../firebase/firestore'
import { useTheme } from '../context/ThemeContext'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader, Sun, Moon } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { dark, toggle }        = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const cred = await login(email, password)

      // Check if this UID exists in the users collection (not admins)
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid))
      if (!userDoc.exists()) {
        // Account exists in Firebase Auth but not in users collection
        // (could be an admin or other account) — treat as invalid
        await import('../firebase/firestore').then(m => m.logout())
        toast.error('Invalid email or password.')
        setLoading(false)
        return
      }

      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const m = {
        'auth/user-not-found':     'Invalid email or password.',
        'auth/wrong-password':     'Invalid email or password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests':  'Too many attempts. Try again later.',
      }
      toast.error(m[err.code] || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <button onClick={toggle} style={s.themeBtn}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
      <div className="auth-card fade-in">
        <div style={s.brand}>
          <div style={s.brandIcon}>JC</div>
          <h1 style={s.brandName}>Job<em>Connect</em></h1>
        </div>
        <p style={s.sub}>Track every application. Miss nothing.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" value={email} required onChange={e => setEmail(e.target.value)} placeholder="you@email.com"/>
          </div>
          <div className="field">
            <label className="label">Password</label>
            <div style={{ position:'relative' }}>
              <input className="input" type={showPass?'text':'password'} value={password} required onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingRight:40 }}/>
              <button type="button" onClick={() => setShowPass(p=>!p)} style={s.eyeBtn} tabIndex={-1}>
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          <div style={{ textAlign:'right', marginBottom:16 }}>
            <Link to="/forgot-password" style={{ fontSize:12, color:'var(--accent)', textDecoration:'none', fontWeight:500 }}>Forgot password?</Link>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width:'100%', justifyContent:'center', padding:'11px' }}>
            {loading ? <Loader size={16} className="spin"/> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:13, color:'var(--text2)', marginTop:20 }}>
          No account? <Link to="/register" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>Register</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  themeBtn: { position:'fixed', top:16, right:16, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 10px', color:'var(--text2)', cursor:'pointer', display:'flex', alignItems:'center' },
  brand: { display:'flex', alignItems:'center', gap:10, marginBottom:8 },
  brandIcon: { width:42, height:42, borderRadius:12, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'#fff' },
  brandName: { fontFamily:'var(--font-display)', fontSize:26, color:'var(--text)' },
  sub: { color:'var(--text2)', fontSize:14, marginBottom:24 },
  eyeBtn: { position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text2)', cursor:'pointer', display:'flex', padding:2 },
}
