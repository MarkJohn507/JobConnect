import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../firebase/firestore'
import { useTheme } from '../context/ThemeContext'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader, Sun, Moon, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { dark, toggle }        = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const cred = await login(email, password)

      // Check if this user has admin role in Firestore
      const adminDoc = await getDoc(doc(db, 'admins', cred.user.uid))
      if (!adminDoc.exists()) {
        toast.error('Access denied. This account is not an admin.')
        setLoading(false)
        return
      }

      toast.success('Welcome, Admin!')
      navigate('/admin/dashboard')
    } catch (err) {
      const map = {
        'auth/user-not-found':     'No account with that email',
        'auth/wrong-password':     'Incorrect password',
        'auth/invalid-credential': 'Invalid email or password',
        'auth/too-many-requests':  'Too many attempts. Try again later.',
      }
      toast.error(map[err.code] || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <button style={s.themeBtn} onClick={toggle}>
        {dark ? <Sun size={18}/> : <Moon size={18}/>}
      </button>

      <div style={s.card} className="fade-in">
        <div style={s.brand}>
          <div style={s.brandIcon}><ShieldCheck size={20} color="#fff"/></div>
          <h1 style={s.brandName}>Admin Portal</h1>
        </div>
        <p style={s.sub}>Job Connect · Restricted Access</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Admin Email</label>
            <input
              type="email" value={email} required
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@email.com" style={s.input}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password} required
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...s.input, paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={s.eyeBtn} tabIndex={-1}>
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? <Loader size={16} className="spin"/> : 'Sign In as Admin'}
          </button>
        </form>

        <Link to="/" style={s.backLink}>← Back to Home</Link>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg)', padding: 16
  },
  themeBtn: {
    position: 'fixed', top: 20, right: 20,
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '8px 10px', color: 'var(--text2)',
    cursor: 'pointer', display: 'flex', alignItems: 'center'
  },
  card: {
    width: '100%', maxWidth: 400, background: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: 20, padding: '40px 36px'
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  brandIcon: {
    width: 42, height: 42, borderRadius: 12, background: '#dc2626',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  brandName: { fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text)' },
  sub: { color: 'var(--text2)', fontSize: 13, marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column' },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 12px',
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none'
  },
  eyeBtn: {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: 'var(--text2)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 2
  },
  btn: {
    padding: '12px', borderRadius: 10, border: 'none',
    background: '#dc2626', color: '#fff', fontSize: 14,
    fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
  },
  backLink: {
    display: 'block', textAlign: 'center', marginTop: 20,
    color: 'var(--text2)', textDecoration: 'none', fontSize: 13
  }
}
