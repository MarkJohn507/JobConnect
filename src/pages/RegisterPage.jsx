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

  const handleSubmit = async e => {
    e.preventDefault()
    if (password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 6)  return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try { await register(email, password); await updateUserProfile(name); toast.success('Account created!'); navigate('/dashboard') }
    catch (err) {
      const m = { 'auth/email-already-in-use':'Email is already registered', 'auth/invalid-email':'Invalid email address', 'auth/weak-password':'Password is too weak', 'auth/admin-email-reserved':'This email cannot be used for registration.' }
      toast.error(m[err.code] || 'Registration failed')
    } finally { setLoading(false) }
  }

  const PasswordInput = ({ value, onChange, show, onToggle, placeholder }) => (
    <div style={{ position:'relative' }}>
      <input className="input" type={show?'text':'password'} value={value} required onChange={onChange} placeholder={placeholder} style={{ paddingRight:40 }}/>
      <button type="button" onClick={onToggle} style={s.eyeBtn} tabIndex={-1}>
        {show ? <EyeOff size={16}/> : <Eye size={16}/>}
      </button>
    </div>
  )

  return (
    <div className="auth-page">
      <button onClick={toggle} style={s.themeBtn}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
      <div className="auth-card fade-in">
        <div style={s.brand}>
          <div style={s.brandIcon}>JC</div>
          <h1 style={s.brandName}>Job<em>Connect</em></h1>
        </div>
        <p style={s.sub}>Create your free account today.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">Full Name</label>
            <input className="input" type="text" value={name} required onChange={e => setName(e.target.value)} placeholder="Juan dela Cruz"/>
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" value={email} required onChange={e => setEmail(e.target.value)} placeholder="you@email.com"/>
          </div>
          <div className="field">
            <label className="label">Password</label>
            <PasswordInput value={password} onChange={e=>setPassword(e.target.value)} show={showPass} onToggle={()=>setShowPass(p=>!p)} placeholder="Min. 6 characters"/>
          </div>
          <div className="field">
            <label className="label">Confirm Password</label>
            <PasswordInput value={confirm} onChange={e=>setConfirm(e.target.value)} show={showConf} onToggle={()=>setShowConf(p=>!p)} placeholder="Repeat password"/>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width:'100%', justifyContent:'center', padding:'11px', marginTop:4 }}>
            {loading ? <Loader size={16} className="spin"/> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:13, color:'var(--text2)', marginTop:20 }}>
          Have an account? <Link to="/login" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>Sign in</Link>
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
