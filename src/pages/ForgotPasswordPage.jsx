import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { resetPassword } from '../firebase/firestore'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { Loader, Sun, Moon, ArrowLeft, Mail, CheckCircle } from 'lucide-react'

const COOLDOWN = 60

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const { dark, toggle }        = useTheme()

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c-1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const send = async e => {
    if (e) e.preventDefault()
    if (cooldown > 0) return
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true); setCooldown(COOLDOWN); toast.success('Reset email sent!')
    } catch (err) {
      const m = { 'auth/user-not-found':'No account with that email', 'auth/invalid-email':'Enter a valid email', 'auth/too-many-requests':'Too many requests. Wait a moment.' }
      toast.error(m[err.code] || 'Failed to send reset email')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <button onClick={toggle} style={s.themeBtn}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>

      <div className="auth-card fade-in">
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <div style={s.brandIcon}>JC</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, color:'var(--text)' }}>Job<em>Connect</em></h1>
        </div>

        {sent ? (
          <div style={{ textAlign:'center' }}>
            <CheckCircle size={44} style={{ color:'#4ade80', marginBottom:14 }}/>
            <h2 style={{ fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:10 }}>Check your email</h2>
            <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.65, marginBottom:24 }}>
              We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.
            </p>
            <button onClick={send} className="btn-primary" disabled={cooldown>0||loading}
              style={{ width:'100%', justifyContent:'center', padding:'11px', opacity:cooldown>0?0.6:1 }}>
              {loading ? <Loader size={15} className="spin"/> : cooldown>0 ? `Resend in ${cooldown}s` : <><Mail size={15}/>Resend Email</>}
            </button>
            <p style={{ fontSize:12, color:'var(--text2)', marginTop:12 }}>Didn't receive it? Check your spam folder.</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:8 }}>Reset your password</h2>
            <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.65, marginBottom:24 }}>
              Enter the email linked to your account and we'll send you a reset link.
            </p>
            <form onSubmit={send}>
              <div className="field">
                <label className="label">Email Address</label>
                <input className="input" type="email" value={email} required onChange={e => setEmail(e.target.value)} placeholder="you@email.com"/>
              </div>
              <button type="submit" className="btn-primary" disabled={loading||cooldown>0}
                style={{ width:'100%', justifyContent:'center', padding:'11px', opacity:cooldown>0?0.6:1 }}>
                {loading ? <Loader size={16} className="spin"/> : cooldown>0 ? `Wait ${cooldown}s` : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <Link to="/login" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:24, color:'var(--text2)', textDecoration:'none', fontSize:13 }}>
          <ArrowLeft size={14}/> Back to Sign In
        </Link>
      </div>
    </div>
  )
}

const s = {
  themeBtn: { position:'fixed', top:16, right:16, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 10px', color:'var(--text2)', cursor:'pointer', display:'flex', alignItems:'center' },
  brandIcon: { width:40, height:40, borderRadius:11, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff' },
}
