import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserApplications } from '../firebase/firestore'
import { format, isAfter } from 'date-fns'

const BADGE_CLASS = {
  Applied: 'badge-applied',
  Interview: 'badge-interview',
  Offer: 'badge-offer',
  Rejected: 'badge-rejected',
}

export default function DashboardPage() {
  const { currentUser } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser?.uid) return

    setLoading(true)
    getUserApplications(currentUser.uid)
      .then(d => {
        setApps(d || [])
      })
      .catch(() => {
        setApps([])
      })
      .finally(() => setLoading(false))
  }, [currentUser?.uid])

  const total = apps.length
  const applied = apps.filter(a => a.status === 'Applied').length
  const interview = apps.filter(a => a.status === 'Interview').length
  const offer = apps.filter(a => a.status === 'Offer').length
  const rejected = apps.filter(a => a.status === 'Rejected').length

  const upcoming = useMemo(() => {
    return apps
      .filter(a => a.deadline && isAfter(new Date(a.deadline), new Date()))
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5)
  }, [apps])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div
          className="spin"
          style={{
            width: 34,
            height: 34,
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
          }}
        />
      </div>
    )
  }

  if (!currentUser?.uid) {
    return (
      <div className="fade-in">
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Loading account information...</p>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text)', marginBottom: 3 }}>
          Good day, {currentUser?.name?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'there'} 👋
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Applications', val: total, color: '#6c63ff' },
          { label: 'Applied', val: applied, color: '#60a5fa' },
          { label: 'Interviews', val: interview, color: '#4ade80' },
          { label: 'Offers', val: offer, color: '#fbbf24' },
          { label: 'Rejected', val: rejected, color: '#f87171' },
        ].map(({ label, val, color }) => (
          <div
            key={label}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '16px 14px',
              borderLeft: `4px solid ${color}`,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1.1, marginBottom: 4 }}>{val}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 20, marginBottom: 20 }}>
        <h3 style={s.cardTitle}>Upcoming Deadlines</h3>
        {upcoming.length === 0 ? (
          <p style={s.empty}>No upcoming deadlines</p>
        ) : (
          upcoming.map(app => {
            const days = Math.ceil((new Date(app.deadline) - new Date()) / 86400000)
            const urgent = days <= 3
            return (
              <div
                key={app.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ minWidth: 0, marginRight: 8 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {app.company}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{app.position}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: urgent ? 'var(--danger)' : 'var(--text2)' }}>
                    {format(new Date(app.deadline), 'MMM d')}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: urgent ? 700 : 400,
                      color: urgent ? 'var(--danger)' : 'var(--text2)',
                    }}
                  >
                    {days === 0 ? 'Today!' : `${days}d left`}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="card">
        <h3 style={s.cardTitle}>Recent Applications</h3>
        {apps.length === 0 ? (
          <p style={s.empty}>No applications yet — add your first one!</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {['Company', 'Position', 'Status', 'Applied'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apps.slice(0, 5).map(app => (
                  <tr key={app.id}>
                    <td style={{ fontWeight: 500 }}>{app.company}</td>
                    <td>{app.position}</td>
                    <td>
                      <span className={`badge ${BADGE_CLASS[app.status] || 'badge-applied'}`}>{app.status}</span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {app.appliedDate ? format(new Date(app.appliedDate), 'MMM d, yyyy') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  cardTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16 },
  empty: { color: 'var(--text2)', fontSize: 13, padding: '12px 0' },
}