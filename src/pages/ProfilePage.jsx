import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile, resetPassword } from '../firebase/firestore'
import toast from 'react-hot-toast'
import { Save, Loader, Key, User, Mail } from 'lucide-react'

export default function ProfilePage() {
  const { currentUser } = useAuth()
  const [name, setName]       = useState(currentUser?.displayName || '')
  const [saving, setSaving]   = useState(false)
  const [resetting, setReset] = useState(false)

  const handleSave = async e => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Name cannot be empty')
    setSaving(true)
    try { await updateUserProfile(name.trim()); toast.success('Profile updated!') }
    catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  const handleReset = async () => {
    setReset(true)
    try { await resetPassword(currentUser.email); toast.success('Reset email sent to ' + currentUser.email) }
    catch { toast.error('Could not send reset email') }
    finally { setReset(false) }
  }

  const InfoRow = ({ label, value }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
      <span style={{ fontSize:13, color:'var(--text2)' }}>{label}</span>
      <span style={{ fontSize:13, color:'var(--text)', fontFamily:'monospace' }}>{value}</span>
    </div>
  )

  return (
    <div className="fade-in" style={{ maxWidth:560 }}>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:24, color:'var(--text)', marginBottom:4 }}>Profile Settings</h2>
      <p style={{ color:'var(--text2)', fontSize:13, marginBottom:24 }}>Manage your account information.</p>

      {/* Avatar strip */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
        <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#fff', flexShrink:0 }}>
          {(currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U').toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight:700, color:'var(--text)' }}>{currentUser?.displayName || 'User'}</div>
          <div style={{ fontSize:13, color:'var(--text2)' }}>{currentUser?.email}</div>
        </div>
      </div>

      {/* Personal info */}
      <div className="card" style={{ marginBottom:16 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:18, display:'flex', alignItems:'center', gap:6 }}><User size={15}/>Personal Information</h3>
        <form onSubmit={handleSave}>
          <div className="field">
            <label className="label">Full Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Juan dela Cruz"/>
          </div>
          <div className="field">
            <label className="label">Email Address</label>
            <div style={{ position:'relative' }}>
              <Mail size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text2)' }}/>
              <input className="input" value={currentUser?.email} disabled style={{ paddingLeft:34, opacity:0.55, cursor:'not-allowed' }}/>
            </div>
            <span style={{ fontSize:11, color:'var(--text2)', marginTop:4, display:'block' }}>Email cannot be changed.</span>
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <Loader size={14} className="spin"/> : <Save size={14}/>}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card" style={{ marginBottom:16 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}><Key size={15}/>Password</h3>
        <p style={{ fontSize:13, color:'var(--text2)', marginBottom:14 }}>
          We'll send a reset link to <strong>{currentUser?.email}</strong>.
        </p>
        <button className="btn-secondary" onClick={handleReset} disabled={resetting}>
          {resetting ? <Loader size={14} className="spin"/> : <Key size={14}/>}
          {resetting ? 'Sending…' : 'Send Password Reset Email'}
        </button>
      </div>

      {/* Account info */}
      <div className="card">
        <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:8 }}>Account Information</h3>
        <InfoRow label="User ID" value={`${currentUser?.uid?.slice(0,14)}…`}/>
        <InfoRow label="Account Created" value={currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : '—'}/>
        <InfoRow label="Last Sign In"    value={currentUser?.metadata?.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() : '—'}/>
      </div>
    </div>
  )
}
