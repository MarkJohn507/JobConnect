import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register, updateUserProfile } from '../firebase/firestore'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader, Sun, Moon } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { dark, toggle }        = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 6)  return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(email, password)
      await updateUserProfile(name)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      const map = {
        'auth/email-already-in-use': 'That email is already registered',
        'auth/invalid-email':        'Invalid email address',
        'auth/weak-password':        'Password is too weak',
      }
      toast.error(map[err.code] || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <button style={s.themeBtn} onClick={toggle} title="Toggle theme">
        {dark ? <Sun size={18}/> : <Moon size={18}/>}
      </button>

      <div style={s.card} className="fade-in">
        <div style={s.brand}>
          <div style={s.brandIcon}>JC</div>
          <h1 style={s.brandName}>Job<em>Connect</em></h1>
        </div>
        <p style={s.sub}>Create your free account today.</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Full Name</label>
            <input
              type="text" value={name} required
              onChange={e => setName(e.target.value)}
              placeholder="Juan dela Cruz" style={s.input}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              type="email" value={email} required
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com" style={s.input}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password} required
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                style={{ ...s.input, paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={s.eyeBtn} tabIndex={-1}>
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConf ? 'text' : 'password'}
                value={confirm} required
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat password"
                style={{ ...s.input, paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowConf(p => !p)} style={s.eyeBtn} tabIndex={-1}>
                {showConf ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? <Loader size={16} className="spin"/> : 'Create Account'}
          </button>
        </form>

        <p style={s.footer}>
          Have an account? <Link to="/login" style={s.a}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg)', padding: 16,
    position: 'relative'
  },
  themeBtn: {
    position: 'fixed', top: 20, right: 20,
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '8px 10px', color: 'var(--text2)',
    cursor: 'pointer', display: 'flex', alignItems: 'center'
  },
  card: {
    width: '100%', maxWidth: 420, background: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: 20, padding: '40px 36px'
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  brandIcon: {
    width: 42, height: 42, borderRadius: 12, background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, fontWeight: 700, color: '#fff'
  },
  brandName: { fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text)' },
  sub: { color: 'var(--text2)', fontSize: 14, marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column' },
  field: { marginBottom: 14 },
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
    background: 'var(--accent)', color: '#fff', fontSize: 14,
    fontWeight: 600, cursor: 'pointer', marginTop: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
  },
  footer: { textAlign: 'center', fontSize: 13, color: 'var(--text2)', marginTop: 16 },
  a: { color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }
}
