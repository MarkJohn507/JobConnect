import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserApplications } from '../firebase/firestore'
import { differenceInCalendarDays, format } from 'date-fns'

function calcStats(apps) {
  const total = apps.length
  const interview = apps.filter(a => a.status === 'Interview').length
  const offer = apps.filter(a => a.status === 'Offer').length
  const rejected = apps.filter(a => a.status === 'Rejected').length

  const callbackRate = total ? Math.round(((interview + offer) / total) * 100) : 0
  const offerRate = total ? Math.round((offer / total) * 100) : 0
  const rejectionRate = total ? Math.round((rejected / total) * 100) : 0

  const responseDays = apps
    .filter(app => app.appliedDate && app.updatedAt)
    .map(app => {
      const applied = new Date(app.appliedDate)
      const updated = app.updatedAt?.seconds ? new Date(app.updatedAt.seconds * 1000) : new Date(app.updatedAt)
      return differenceInCalendarDays(updated, applied)
    })
    .filter(days => Number.isFinite(days) && days >= 0)

  const avgResponseTime = responseDays.length
    ? Math.round(responseDays.reduce((sum, d) => sum + d, 0) / responseDays.length)
    : null

  const byIndustry = {}
  apps.forEach(app => {
    const industry = app.industry || 'Unspecified'
    if (!byIndustry[industry]) {
      byIndustry[industry] = { total: 0, interview: 0, offer: 0, rejected: 0 }
    }
    byIndustry[industry].total += 1
    if (app.status === 'Interview') byIndustry[industry].interview += 1
    if (app.status === 'Offer') byIndustry[industry].offer += 1
    if (app.status === 'Rejected') byIndustry[industry].rejected += 1
  })

  const industryRows = Object.entries(byIndustry)
    .map(([industry, v]) => ({
      industry,
      callbackRate: v.total ? Math.round(((v.interview + v.offer) / v.total) * 100) : 0,
      offerRate: v.total ? Math.round((v.offer / v.total) * 100) : 0,
      rejectionRate: v.total ? Math.round((v.rejected / v.total) * 100) : 0,
      total: v.total,
    }))
    .sort((a, b) => b.callbackRate - a.callbackRate)

  const followUps = apps.filter(app => {
    if (app.status !== 'Applied' || !app.appliedDate) return false
    const daysApplied = differenceInCalendarDays(new Date(), new Date(app.appliedDate))
    return daysApplied > 14
  })

  return {
    total,
    callbackRate,
    offerRate,
    rejectionRate,
    avgResponseTime,
    industryRows,
    followUps,
  }
}

export default function InsightsPage() {
  const { currentUser } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser?.uid) return

    setLoading(true)
    getUserApplications(currentUser.uid)
      .then(d => setApps(d || []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false))
  }, [currentUser?.uid])

  const stats = useMemo(() => calcStats(apps), [apps])

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

  const topIndustry = stats.industryRows[0]

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text)', marginBottom: 3 }}>
          Personalized Insights
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>
          Actionable analysis based on your own application history.
        </p>
      </div>

      {apps.length < 3 ? (
        <div className="card">
          <p style={s.empty}>
            Insufficient data available. Add at least 3 application entries to generate meaningful insights.
          </p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {[
              { label: 'Callback Rate', val: `${stats.callbackRate}%`, color: '#a78bfa' },
              { label: 'Offer Rate', val: `${stats.offerRate}%`, color: '#38bdf8' },
              { label: 'Rejection Rate', val: `${stats.rejectionRate}%`, color: '#fb7185' },
              {
                label: 'Avg Response Time',
                val: stats.avgResponseTime !== null ? `${stats.avgResponseTime}d` : '—',
                color: '#34d399',
              },
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

          <div className="two-col" style={{ marginTop: 20 }}>
            <div className="card">
              <h3 style={s.cardTitle}>Best Performing Industry</h3>
              {topIndustry ? (
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                    {topIndustry.industry}
                  </div>
                  <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6 }}>
                    Callback rate: <strong>{topIndustry.callbackRate}%</strong>
                    <br />
                    Offer rate: <strong>{topIndustry.offerRate}%</strong>
                    <br />
                    Applications logged: <strong>{topIndustry.total}</strong>
                  </div>
                </div>
              ) : (
                <p style={s.empty}>No industry data yet.</p>
              )}
            </div>

            <div className="card">
              <h3 style={s.cardTitle}>Applications Requiring Follow-Up</h3>
              {stats.followUps.length === 0 ? (
                <p style={s.empty}>No follow-up applications detected.</p>
              ) : (
                <div>
                  {stats.followUps.slice(0, 5).map(app => {
                    const days = differenceInCalendarDays(new Date(), new Date(app.appliedDate))
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
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{app.company}</div>
                          <div style={{ fontSize: 12, color: 'var(--text2)' }}>{app.position}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 12, color: 'var(--danger)' }}>{days}d in Applied</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)' }}>Follow up</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <h3 style={s.cardTitle}>Industry Performance</h3>
            {stats.industryRows.length === 0 ? (
              <p style={s.empty}>No industry breakdown available.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Industry</th>
                      <th>Total</th>
                      <th>Callback Rate</th>
                      <th>Offer Rate</th>
                      <th>Rejection Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.industryRows.map(row => (
                      <tr key={row.industry}>
                        <td style={{ fontWeight: 500 }}>{row.industry}</td>
                        <td>{row.total}</td>
                        <td>{row.callbackRate}%</td>
                        <td>{row.offerRate}%</td>
                        <td>{row.rejectionRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const s = {
  cardTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16 },
  empty: { color: 'var(--text2)', fontSize: 13, padding: '12px 0' },
}