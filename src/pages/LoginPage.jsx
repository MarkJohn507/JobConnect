import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, resetPassword } from '../firebase/firestore'
import toast from 'react-hot-toast'
import { LogIn, Mail, Lock, Loader } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!email) return toast.error('Enter your email first')
    try {
      await resetPassword(email)
      toast.success('Password reset email sent!')
    } catch {
      toast.error('Could not send reset email')
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card} className="fade-in">
        <div style={s.brand}>
          <div style={s.brandIcon}>JC</div>
          <h1 style={s.brandName}>Job<em>Connect</em></h1>
        </div>
        <p style={s.sub}>Track every application. Miss nothing.</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <Field label="Email" icon={<Mail size={15}/>}>
            <input
              type="email" value={email} required
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com" style={s.input}
            />
          </Field>
          <Field label="Password" icon={<Lock size={15}/>}>
            <input
              type="password" value={password} required
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={s.input}
            />
          </Field>

          <button type="submit" style={s.btn} disabled={loading}>
            {loading
              ? <Loader size={16} className="spin" />
              : <><LogIn size={16}/> Sign In</>
            }
          </button>
        </form>

        <button style={s.link} onClick={handleReset}>Forgot password?</button>
        <p style={s.footer}>
          No account? <Link to="/register" style={s.a}>Register</Link>
        </p>
      </div>
    </div>
  )
}

function Field({ label, icon, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }}>
          {icon}
        </span>
        {children}
      </div>
    </div>
  )
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found': 'No account with that email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
  }
  return map[code] || 'Something went wrong'
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg)', padding: 16
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
  brandName: {
    fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text)'
  },
  sub: { color: 'var(--text2)', fontSize: 14, marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column' },
  input: {
    width: '100%', padding: '10px 12px 10px 36px',
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none'
  },
  btn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '12px', borderRadius: 10, border: 'none',
    background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', marginTop: 8
  },
  link: {
    background: 'none', border: 'none', color: 'var(--text2)',
    fontSize: 13, cursor: 'pointer', marginTop: 14, textAlign: 'center',
    width: '100%'
  },
  footer: { textAlign: 'center', fontSize: 13, color: 'var(--text2)', marginTop: 8 },
  a: { color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }
}
