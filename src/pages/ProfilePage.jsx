import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import toast from 'react-hot-toast'
import { Save, Loader, User, Mail, ShieldCheck, Phone, GraduationCap } from 'lucide-react'

// Batch years for benchmark grouping
const BATCH_YEARS = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString())

export default function ProfilePage() {
  const { currentUser } = useAuth()

  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [batchYear, setBatchYear] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || currentUser.displayName || '')
      setContact(currentUser.contact || '')
      setBatchYear(currentUser.batchYear || '')
    }
  }, [currentUser])

  const handleSave = async e => {
    e.preventDefault()

    if (!name.trim()) return toast.error('Name cannot be empty.')
    if (!currentUser?.uid) return toast.error('User data not loaded yet.')

    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: name.trim(),
        contact: contact.trim(),
        batchYear: batchYear,
      })

      toast.success('Profile updated!')
    } catch (error) {
      console.error(error)
      toast.error('Update failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const InfoRow = ({ label, value }) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '11px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'monospace' }}>{value}</span>
    </div>
  )

  const photoURL = currentUser?.photoURL

  return (
    <div className="fade-in" style={{ maxWidth: 560 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text)', marginBottom: 4 }}>
        Profile Settings
      </h2>
      <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 24 }}>
        Manage your account information.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        {photoURL ? (
          <img
            src={photoURL}
            alt="profile"
            referrerPolicy="no-referrer"
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {(currentUser?.name?.[0] || currentUser?.email?.[0] || 'U').toUpperCase()}
          </div>
        )}
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text)' }}>{currentUser?.name || 'User'}</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>{currentUser?.email}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11, color: 'var(--text2)' }}>
            <ShieldCheck size={11} style={{ color: '#4ade80' }} />
            Signed in with Google
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <User size={15} />
          Personal Information
        </h3>

        <form onSubmit={handleSave}>
          <div className="field">
            <label className="label">Full Name</label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Juan dela Cruz"
            />
          </div>

          <div className="field">
            <label className="label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={14}
                style={{
                  position: 'absolute',
                  left: 11,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text2)',
                }}
              />
              <input
                className="input"
                value={currentUser?.email || ''}
                disabled
                style={{ paddingLeft: 34, opacity: 0.55, cursor: 'not-allowed' }}
              />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4, display: 'block' }}>
              Managed by your Lewis College Google account. Cannot be changed here.
            </span>
          </div>

          <div className="field">
            <label className="label">Contact Number</label>
            <div style={{ position: 'relative' }}>
              <Phone
                size={14}
                style={{
                  position: 'absolute',
                  left: 11,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text2)',
                }}
              />
              <input
                className="input"
                value={contact}
                type="tel"
                onChange={e => setContact(e.target.value)}
                placeholder="+63 912 345 6789"
                style={{ paddingLeft: 34 }}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Batch Year</label>
            <div style={{ position: 'relative' }}>
              <GraduationCap
                size={14}
                style={{
                  position: 'absolute',
                  left: 11,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text2)',
                }}
              />
              <select
                className="input"
                value={batchYear}
                onChange={e => setBatchYear(e.target.value)}
                style={{ paddingLeft: 34, appearance: 'none' }}
              >
                <option value="">Select batch year…</option>
                {BATCH_YEARS.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4, display: 'block' }}>
              Used to group your data in the School Benchmarks panel.
            </span>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <Loader size={14} className="spin" /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <ShieldCheck size={15} />
          Account Security
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
          Your account is secured through your <strong>Lewis College Google Workspace</strong> account.
          Passwords and security settings are managed by Google — Job Connect does not store or manage any credentials.
        </p>
        <a
          href="https://myaccount.google.com/security"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 12,
            fontSize: 13,
            color: 'var(--accent)',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Manage Google Account Security ↗
        </a>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
          Account Information
        </h3>
        <InfoRow label="User ID" value={`${currentUser?.uid?.slice(0, 14) || '—'}…`} />
        <InfoRow
          label="Account Created"
          value={currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : '—'}
        />
        <InfoRow
          label="Last Sign In"
          value={currentUser?.metadata?.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() : '—'}
        />
        <InfoRow label="Batch Year" value={batchYear || '—'} />
      </div>
    </div>
  )
}