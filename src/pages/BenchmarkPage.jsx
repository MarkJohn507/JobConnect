import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { getUserApplications } from '../firebase/firestore'
import { AlertCircle, ShieldCheck, BarChart3, Users } from 'lucide-react'
import { differenceInCalendarDays } from 'date-fns'

function calcPersonal(apps) {
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

  return { total, callbackRate, offerRate, rejectionRate, avgResponseTime }
}

export default function BenchmarkPage() {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [approved, setApproved] = useState(false)
  const [report, setReport] = useState(null)
  const [personal, setPersonal] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        if (!currentUser?.uid) {
          setApproved(false)
          setReport(null)
          setPersonal(null)
          return
        }

        const [settingsSnap, apps] = await Promise.all([
          getDoc(doc(db, 'benchmarkSettings', 'global')),
          getUserApplications(currentUser.uid).catch(() => []),
        ])

        const isApproved = settingsSnap.exists() && settingsSnap.data()?.approved === true
        setApproved(isApproved)
        setPersonal(calcPersonal(apps || []))

        if (isApproved) {
          const reportSnap = await getDoc(doc(db, 'benchmarkReports', '2026-report'))
          setReport(reportSnap.exists() ? reportSnap.data() : null)
        } else {
          setReport(null)
        }
      } catch (error) {
        console.error('BenchmarkPage load error:', error)
        setApproved(false)
        setReport(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [currentUser?.uid])

  const comparison = useMemo(() => {
    if (!personal || !report) return null
    return {
      callbackDelta: personal.callbackRate - (report.callbackRate ?? 0),
      offerDelta: personal.offerRate - (report.offerRate ?? 0),
      rejectionDelta: personal.rejectionRate - (report.rejectionRate ?? 0),
      responseDelta: (personal.avgResponseTime ?? 0) - (report.avgResponseTime ?? 0),
    }
  }, [personal, report])

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

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text)', marginBottom: 4 }}>
          School Benchmark Data
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>
          Compare your personal job search performance against anonymized Lewis College benchmarks.
        </p>
      </div>

      {!approved ? (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={18} style={{ color: '#fbbf24' }} />
          <p style={{ color: 'var(--text2)', fontSize: 13, margin: 0 }}>
            Benchmark data is not yet approved for publication by an administrator.
          </p>
        </div>
      ) : !report ? (
        <div className="card">
          <p style={{ color: 'var(--text2)', fontSize: 13, margin: 0 }}>
            Benchmark is approved, but no public report was found.
          </p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {[
              { label: 'School Callback Rate', val: `${report.callbackRate ?? 0}%`, color: '#a78bfa' },
              { label: 'School Offer Rate', val: `${report.offerRate ?? 0}%`, color: '#38bdf8' },
              { label: 'School Rejection Rate', val: `${report.rejectionRate ?? 0}%`, color: '#fb7185' },
              {
                label: 'School Avg Response Time',
                val: report.avgResponseTime != null ? `${report.avgResponseTime}d` : '—',
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

          {comparison && (
            <div className="card" style={{ marginTop: 20 }}>
              <h3 style={s.cardTitle}>Your Performance vs School Average</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>You</th>
                      <th>School Avg</th>
                      <th>Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Callback Rate</td>
                      <td>{personal.callbackRate}%</td>
                      <td>{report.callbackRate ?? 0}%</td>
                      <td style={{ color: comparison.callbackDelta >= 0 ? '#22c55e' : '#ef4444' }}>
                        {comparison.callbackDelta >= 0 ? '+' : ''}
                        {comparison.callbackDelta}%
                      </td>
                    </tr>
                    <tr>
                      <td>Offer Rate</td>
                      <td>{personal.offerRate}%</td>
                      <td>{report.offerRate ?? 0}%</td>
                      <td style={{ color: comparison.offerDelta >= 0 ? '#22c55e' : '#ef4444' }}>
                        {comparison.offerDelta >= 0 ? '+' : ''}
                        {comparison.offerDelta}%
                      </td>
                    </tr>
                    <tr>
                      <td>Rejection Rate</td>
                      <td>{personal.rejectionRate}%</td>
                      <td>{report.rejectionRate ?? 0}%</td>
                      <td style={{ color: comparison.rejectionDelta <= 0 ? '#22c55e' : '#ef4444' }}>
                        {comparison.rejectionDelta >= 0 ? '+' : ''}
                        {comparison.rejectionDelta}%
                      </td>
                    </tr>
                    <tr>
                      <td>Avg Response Time</td>
                      <td>{personal.avgResponseTime != null ? `${personal.avgResponseTime}d` : '—'}</td>
                      <td>{report.avgResponseTime != null ? `${report.avgResponseTime}d` : '—'}</td>
                      <td style={{ color: comparison.responseDelta <= 0 ? '#22c55e' : '#ef4444' }}>
                        {comparison.responseDelta >= 0 ? '+' : ''}
                        {comparison.responseDelta}d
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="two-col" style={{ marginTop: 20 }}>
            <div className="card">
              <h3 style={s.cardTitle}>Publication Notes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={sn.noteRow}>
                  <AlertCircle size={16} style={{ color: '#fbbf24' }} />
                  <span>Only approved benchmark reports are visible to users.</span>
                </div>
                <div style={sn.noteRow}>
                  <Users size={16} style={{ color: '#60a5fa' }} />
                  <span>All data is anonymized before publication.</span>
                </div>
                <div style={sn.noteRow}>
                  <BarChart3 size={16} style={{ color: '#4ade80' }} />
                  <span>School benchmarks help you compare against Lewis College trends.</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={s.cardTitle}>Report Summary</h3>
              <p style={{ color: 'var(--text2)', fontSize: 13, margin: 0 }}>
                This report is the public benchmark snapshot approved by admin.
              </p>
            </div>
          </div>

          {Array.isArray(report.byIndustry) && report.byIndustry.length > 0 && (
            <div className="card" style={{ marginTop: 20 }}>
              <h3 style={s.cardTitle}>Industry / Category Breakdown</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Industry / Category</th>
                      <th>Total</th>
                      <th>Applied</th>
                      <th>Interview</th>
                      <th>Offer</th>
                      <th>Rejected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byIndustry.map((row, idx) => (
                      <tr key={`${row.industry}-${idx}`}>
                        <td style={{ fontWeight: 500 }}>{row.industry}</td>
                        <td>{row.total}</td>
                        <td>{row.Applied}</td>
                        <td>{row.Interview}</td>
                        <td>{row.Offer}</td>
                        <td>{row.Rejected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {Array.isArray(report.byBatchYear) && report.byBatchYear.length > 0 && (
            <div className="card" style={{ marginTop: 20 }}>
              <h3 style={s.cardTitle}>Batch Year Breakdown</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Batch Year</th>
                      <th>Total</th>
                      <th>Applied</th>
                      <th>Interview</th>
                      <th>Offer</th>
                      <th>Rejected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byBatchYear.map((row, idx) => (
                      <tr key={`${row.batchYear}-${idx}`}>
                        <td style={{ fontWeight: 500 }}>{row.batchYear}</td>
                        <td>{row.total}</td>
                        <td>{row.Applied}</td>
                        <td>{row.Interview}</td>
                        <td>{row.Offer}</td>
                        <td>{row.Rejected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const s = {
  cardTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16 },
}

const sn = {
  noteRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    fontSize: 13,
    color: 'var(--text2)',
    lineHeight: 1.5,
  },
}