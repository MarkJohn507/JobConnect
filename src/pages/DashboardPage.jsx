import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserApplications } from '../firebase/firestore'
import { format, isAfter, addDays } from 'date-fns'
import { Briefcase, CheckCircle, XCircle, Clock, TrendingUp, CalendarClock } from 'lucide-react'

const STATUS_COLORS = {
  Applied:   '#60a5fa',
  Interview: '#4ade80',
  Offered:   '#fbbf24',
  Rejected:  '#f87171',
  Withdrawn: '#9090a8'
}

export default function DashboardPage() {
  const { currentUser } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('Dashboard: loading for uid', currentUser.uid)
    getUserApplications(currentUser.uid)
      .then(data => {
        console.log('Dashboard: loaded', data.length, 'apps')
        setApps(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Dashboard load error:', err.code, err.message)
        setLoading(false)
      })
  }, [currentUser])

  const counts = {
    total:     apps.length,
    applied:   apps.filter(a => a.status === 'Applied').length,
    interview: apps.filter(a => a.status === 'Interview').length,
    offered:   apps.filter(a => a.status === 'Offered').length,
    rejected:  apps.filter(a => a.status === 'Rejected').length,
  }

  const upcoming = apps
    .filter(a => a.deadline && isAfter(new Date(a.deadline), new Date()))
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5)

  const recent = [...apps].slice(0, 5)

  const successRate = counts.total
    ? Math.round((counts.offered / counts.total) * 100)
    : 0

  if (loading) return <LoadingState />

  return (
    <div className="fade-in">
      <div style={s.header}>
        <div>
          <h2 style={s.greeting}>
            Good day, {currentUser?.displayName?.split(' ')[0] || 'there'} 👋
          </h2>
          <p style={s.date}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={s.statsGrid}>
        <StatCard icon={<Briefcase size={20}/>} label="Total Applications" value={counts.total} color="#6c63ff" />
        <StatCard icon={<Clock size={20}/>}      label="In Review"          value={counts.applied}   color="#60a5fa" />
        <StatCard icon={<CheckCircle size={20}/>} label="Interviews"        value={counts.interview} color="#4ade80" />
        <StatCard icon={<TrendingUp size={20}/>}  label="Offers Received"   value={counts.offered}   color="#fbbf24" />
        <StatCard icon={<XCircle size={20}/>}     label="Rejected"          value={counts.rejected}  color="#f87171" />
        <StatCard icon={<TrendingUp size={20}/>}  label="Success Rate"      value={`${successRate}%`} color="#a78bfa" />
      </div>

      <div style={s.row}>
        {/* Status breakdown */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>Status Breakdown</h3>
          {counts.total === 0
            ? <Empty text="No applications yet" />
            : Object.entries(STATUS_COLORS).map(([status, color]) => {
                const count = apps.filter(a => a.status === status).length
                const pct = counts.total ? Math.round((count / counts.total) * 100) : 0
                return (
                  <div key={status} style={s.barRow}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{status}</span>
                      <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{count}</span>
                    </div>
                    <div style={s.barBg}>
                      <div style={{ ...s.barFill, width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                )
              })
          }
        </div>

        {/* Upcoming deadlines */}
        <div style={s.card}>
          <h3 style={s.cardTitle}><CalendarClock size={16}/> Upcoming Deadlines</h3>
          {upcoming.length === 0
            ? <Empty text="No upcoming deadlines" />
            : upcoming.map(app => {
                const daysLeft = Math.ceil((new Date(app.deadline) - new Date()) / 86400000)
                const urgent = daysLeft <= 3
                return (
                  <div key={app.id} style={s.deadlineRow}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{app.company}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{app.position}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: urgent ? 'var(--danger)' : 'var(--text2)' }}>
                        {format(new Date(app.deadline), 'MMM d')}
                      </div>
                      <div style={{ fontSize: 11, color: urgent ? 'var(--danger)' : 'var(--text2)', fontWeight: urgent ? 700 : 400 }}>
                        {daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
                      </div>
                    </div>
                  </div>
                )
              })
          }
        </div>
      </div>

      {/* Recent applications */}
      <div style={{ ...s.card, marginTop: 20 }}>
        <h3 style={s.cardTitle}>Recent Applications</h3>
        {recent.length === 0
          ? <Empty text="No applications yet — add your first one!" />
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Company','Position','Status','Applied Date'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map(app => (
                    <tr key={app.id} style={s.tr}>
                      <td style={s.td}>{app.company}</td>
                      <td style={s.td}>{app.position}</td>
                      <td style={s.td}>
                        <StatusBadge status={app.status} />
                      </td>
                      <td style={s.td}>
                        {app.appliedDate
                          ? format(new Date(app.appliedDate), 'MMM d, yyyy')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ ...s.statCard }}>
      <div style={{ ...s.statIcon, background: color + '22', color }}>
        {icon}
      </div>
      <div>
        <div style={s.statValue}>{value}</div>
        <div style={s.statLabel}>{label}</div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    Applied:   'status-applied',
    Interview: 'status-interview',
    Offered:   'status-offered',
    Rejected:  'status-rejected',
    Withdrawn: 'status-withdrawn'
  }
  return (
    <span className={map[status] || 'status-applied'} style={s.badge}>
      {status}
    </span>
  )
}

function Empty({ text }) {
  return <p style={{ color: 'var(--text2)', fontSize: 13, padding: '16px 0' }}>{text}</p>
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="spin" />
    </div>
  )
}

const s = {
  header: { marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text)', marginBottom: 4 },
  date: { color: 'var(--text2)', fontSize: 13 },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 20
  },
  statCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '16px', display: 'flex', alignItems: 'center', gap: 12
  },
  statIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: 22, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 },
  statLabel: { fontSize: 11, color: 'var(--text2)', marginTop: 2 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 },
  barRow: { marginBottom: 12 },
  barBg: { height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, transition: 'width 0.4s ease' },
  deadlineRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid var(--border)'
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text2)', padding: '8px 12px', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '10px 12px', fontSize: 13, color: 'var(--text)' },
  badge: { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }
}
