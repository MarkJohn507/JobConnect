import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register, updateUserProfile } from '../firebase/firestore'
import toast from 'react-hot-toast'
import { UserPlus, Mail, Lock, User, Loader } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(email, password)
      await updateUserProfile(name)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      const map = {
        'auth/email-already-in-use': 'That email is already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/weak-password': 'Password is too weak',
      }
      toast.error(map[err.code] || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card} className="fade-in">
        <div style={s.brand}>
          <div style={s.brandIcon}>JC</div>
          <h1 style={s.brandName}>Job<em>Connect</em></h1>
        </div>
        <p style={s.sub}>Create your free account today.</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <Field label="Full Name" icon={<User size={15}/>}>
            <input
              type="text" value={name} required
              onChange={e => setName(e.target.value)}
              placeholder="Juan dela Cruz" style={s.input}
            />
          </Field>
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
              placeholder="Min. 6 characters" style={s.input}
            />
          </Field>
          <Field label="Confirm Password" icon={<Lock size={15}/>}>
            <input
              type="password" value={confirm} required
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password" style={s.input}
            />
          </Field>

          <button type="submit" style={s.btn} disabled={loading}>
            {loading
              ? <Loader size={16} className="spin" />
              : <><UserPlus size={16}/> Create Account</>
            }
          </button>
        </form>

        <p style={s.footer}>
          Have an account? <Link to="/login" style={s.a}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

function Field({ label, icon, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
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
  brandName: { fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text)' },
  sub: { color: 'var(--text2)', fontSize: 14, marginBottom: 24 },
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
  footer: { textAlign: 'center', fontSize: 13, color: 'var(--text2)', marginTop: 16 },
  a: { color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }
}
