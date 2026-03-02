import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile, resetPassword } from '../firebase/firestore'
import toast from 'react-hot-toast'
import { User, Mail, Key, Save, Loader } from 'lucide-react'

export default function ProfilePage() {
  const { currentUser } = useAuth()
  const [name, setName]     = useState(currentUser?.displayName || '')
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Name cannot be empty')
    setSaving(true)
    try {
      await updateUserProfile(name.trim())
      toast.success('Profile updated!')
    } catch {
      toast.error('Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      await resetPassword(currentUser.email)
      toast.success('Password reset email sent to ' + currentUser.email)
    } catch {
      toast.error('Could not send reset email')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="fade-in" style={{ maxWidth: 560 }}>
      <h2 style={s.title}>Profile Settings</h2>
      <p style={s.sub}>Manage your account information.</p>

      {/* Avatar */}
      <div style={s.avatarSection}>
        <div style={s.avatar}>
          {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={s.avatarName}>{currentUser?.displayName || 'User'}</div>
          <div style={s.avatarEmail}>{currentUser?.email}</div>
        </div>
      </div>

      {/* Name form */}
      <div style={s.card}>
        <h3 style={s.cardTitle}><User size={15}/> Personal Information</h3>
        <form onSubmit={handleSave}>
          <div style={s.field}>
            <label style={s.label}>Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={s.input}
              placeholder="Juan dela Cruz"
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }}/>
              <input
                value={currentUser?.email}
                disabled
                style={{ ...s.input, paddingLeft: 36, opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
            <p style={s.hint}>Email address cannot be changed.</p>
          </div>
          <button type="submit" style={s.saveBtn} disabled={saving}>
            {saving ? <Loader size={14} className="spin"/> : <Save size={14}/>}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div style={s.card}>
        <h3 style={s.cardTitle}><Key size={15}/> Password</h3>
        <p style={s.cardText}>
          We'll send a password reset link to <strong>{currentUser?.email}</strong>.
        </p>
        <button style={s.resetBtn} onClick={handleReset} disabled={resetting}>
          {resetting ? <Loader size={14} className="spin"/> : <Key size={14}/>}
          {resetting ? 'Sending...' : 'Send Password Reset Email'}
        </button>
      </div>

      {/* Account info */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>Account Information</h3>
        <div style={s.infoRow}>
          <span style={s.infoLabel}>User ID</span>
          <span style={s.infoValue}>{currentUser?.uid?.slice(0, 16)}...</span>
        </div>
        <div style={s.infoRow}>
          <span style={s.infoLabel}>Account Created</span>
          <span style={s.infoValue}>
            {currentUser?.metadata?.creationTime
              ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
              : '—'}
          </span>
        </div>
        <div style={s.infoRow}>
          <span style={s.infoLabel}>Last Sign In</span>
          <span style={s.infoValue}>
            {currentUser?.metadata?.lastSignInTime
              ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
              : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

const s = {
  title: { fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text)', marginBottom: 4 },
  sub: { color: 'var(--text2)', fontSize: 13, marginBottom: 24 },
  avatarSection: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  avatar: { width: 60, height: 60, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0 },
  avatarName: { fontSize: 16, fontWeight: 700, color: 'var(--text)' },
  avatarEmail: { fontSize: 13, color: 'var(--text2)' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 },
  cardText: { fontSize: 13, color: 'var(--text2)', marginBottom: 14 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 6 },
  input: { width: '100%', padding: '9px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none' },
  hint: { fontSize: 11, color: 'var(--text2)', marginTop: 4 },
  saveBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  resetBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' },
  infoLabel: { fontSize: 13, color: 'var(--text2)' },
  infoValue: { fontSize: 13, color: 'var(--text)', fontFamily: 'monospace' }
}
