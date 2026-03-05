import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { resetPassword } from '../firebase/firestore'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { Loader, Sun, Moon, ArrowLeft, Mail, CheckCircle } from 'lucide-react'

const COOLDOWN = 60 // seconds

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const { dark, toggle }        = useTheme()

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (cooldown > 0) return
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
      setCooldown(COOLDOWN)
      toast.success('Reset email sent!')
    } catch (err) {
      const map = {
        'auth/user-not-found':  'No account found with that email',
        'auth/invalid-email':   'Please enter a valid email address',
        'auth/too-many-requests': 'Too many attempts. Please wait before trying again.',
      }
      toast.error(map[err.code] || 'Failed to send reset email')
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

        {sent ? (
          // Success state
          <div style={s.successBox}>
            <CheckCircle size={40} style={{ color: 'var(--success)', marginBottom: 12 }}/>
            <h2 style={s.successTitle}>Check your email</h2>
            <p style={s.successText}>
              We sent a password reset link to <strong>{email}</strong>.
              Check your inbox and follow the instructions.
            </p>

            <button
              onClick={handleSubmit}
              disabled={cooldown > 0 || loading}
              style={{ ...s.btn, marginTop: 20, opacity: cooldown > 0 ? 0.6 : 1 }}
            >
              {loading
                ? <Loader size={15} className="spin"/>
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : <><Mail size={15}/> Resend Email</>
              }
            </button>

            <p style={s.hint}>
              Didn't receive it? Check your spam folder.
            </p>
          </div>
        ) : (
          // Form state
          <>
            <h2 style={s.heading}>Reset your password</h2>
            <p style={s.sub}>
              Enter the email address linked to your account and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Email Address</label>
                <input
                  type="email" value={email} required
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  style={s.input}
                />
              </div>

              <button
                type="submit"
                style={{ ...s.btn, opacity: cooldown > 0 ? 0.6 : 1 }}
                disabled={loading || cooldown > 0}
              >
                {loading
                  ? <Loader size={16} className="spin"/>
                  : cooldown > 0
                    ? `Wait ${cooldown}s to resend`
                    : 'Send Reset Link'
                }
              </button>
            </form>
          </>
        )}

        <Link to="/login" style={s.backLink}>
          <ArrowLeft size={14}/> Back to Sign In
        </Link>
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
  brand: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 },
  brandIcon: {
    width: 42, height: 42, borderRadius: 12, background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, fontWeight: 700, color: '#fff'
  },
  brandName: { fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text)' },
  heading: { fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 },
  sub: { color: 'var(--text2)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 },
  form: { display: 'flex', flexDirection: 'column' },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 12px',
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none'
  },
  btn: {
    width: '100%', padding: '12px', borderRadius: 10, border: 'none',
    background: 'var(--accent)', color: '#fff', fontSize: 14,
    fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
  },
  successBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', padding: '8px 0'
  },
  successTitle: { fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 10 },
  successText: { fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 },
  hint: { fontSize: 12, color: 'var(--text2)', marginTop: 12 },
  backLink: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 24, color: 'var(--text2)',
    textDecoration: 'none', fontSize: 13, fontWeight: 500
  }
}
