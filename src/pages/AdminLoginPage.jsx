import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, logout } from '../firebase/firestore'
import { useTheme } from '../context/ThemeContext'
import { db } from '../firebase/config'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader, Sun, Moon, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
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

      // Check if this account is in the admins collection
      const adminDoc = await getDoc(doc(db, 'admins', cred.user.uid))
      if (!adminDoc.exists()) {
        await logout()
        toast.error('Access denied. This account is not registered as an admin.')
        setLoading(false)
        return
      }

      // Auto-save email to admin doc if not already saved (for email uniqueness checks)
      const adminData = adminDoc.data()
      if (!adminData.email) {
        await updateDoc(doc(db, 'admins', cred.user.uid), {
          email: email.toLowerCase()
        })
      }

      toast.success('Welcome, Admin!')
      navigate('/admin/dashboard')
    } catch (err) {
      const m = {
        'auth/user-not-found':     'No account with that email',
        'auth/wrong-password':     'Incorrect password',
        'auth/invalid-credential': 'Invalid email or password',
        'auth/too-many-requests':  'Too many attempts. Try again later.',
      }
      toast.error(m[err.code] || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <button onClick={toggle} style={s.themeBtn}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
      <div className="auth-card fade-in">
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <div style={s.brandIcon}><ShieldCheck size={20} color="#fff"/></div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, color:'var(--text)' }}>Admin Portal</h1>
        </div>
        <p style={{ color:'var(--text2)', fontSize:13, marginBottom:28 }}>Job Connect · Restricted Access</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">Admin Email</label>
            <input className="input" type="email" value={email} required
              onChange={e => setEmail(e.target.value)} placeholder="admin@email.com"/>
          </div>
          <div className="field">
            <label className="label">Password</label>
            <div style={{ position:'relative' }}>
              <input className="input" type={showPass?'text':'password'} value={password} required
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingRight:40 }}/>
              <button type="button" onClick={() => setShowPass(p=>!p)} style={s.eyeBtn} tabIndex={-1}>
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width:'100%', justifyContent:'center', padding:'11px', background:'#dc2626' }}>
            {loading ? <Loader size={16} className="spin"/> : 'Sign In as Admin'}
          </button>
        </form>

        <Link to="/" style={{ display:'block', textAlign:'center', marginTop:20, color:'var(--text2)', textDecoration:'none', fontSize:13 }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

const s = {
  themeBtn: { position:'fixed', top:16, right:16, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 10px', color:'var(--text2)', cursor:'pointer', display:'flex', alignItems:'center' },
  brandIcon: { width:42, height:42, borderRadius:12, background:'#dc2626', display:'flex', alignItems:'center', justifyContent:'center' },
  eyeBtn: { position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text2)', cursor:'pointer', display:'flex', padding:2 },
}
