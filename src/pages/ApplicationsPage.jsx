import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import {
  getUserApplications,
  addApplication,
  updateApplication,
  deleteApplication,
  uploadResume,
} from '../firebase/firestore'
import toast from 'react-hot-toast'
import { format, differenceInDays } from 'date-fns'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Upload,
  X,
  Loader,
  FileText,
  ChevronDown,
  AlertCircle,
} from 'lucide-react'

// FR-11 — exactly four stages
const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected']

const BADGE = {
  Applied: 'badge-applied',
  Interview: 'badge-interview',
  Offer: 'badge-offer',
  Rejected: 'badge-rejected',
}

// FR-32, FR-38 — controlled vocabulary for consistent grouping in insights & benchmarks
const INDUSTRIES = [
  'Software / IT',
  'Business / Finance',
  'Marketing / Advertising',
  'Design / Creative',
  'Engineering',
  'Education',
  'Healthcare',
  'Government / Public Sector',
  'Non-Profit / NGO',
  'Hospitality / Tourism',
  'Media / Communications',
  'Other',
]

// FR-19 — accepted file formats
const ACCEPTED_FORMATS = '.pdf,.doc,.docx,.png,.jpg,.jpeg'
const ACCEPTED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
]

const EMPTY_FORM = {
  company: '',
  position: '',
  industry: INDUSTRIES[0],
  status: 'Applied',
  appliedDate: '',
  deadline: '',
  jobUrl: '',
  notes: '',
  resumeUrl: '',
}

export default function ApplicationsPage() {
  const { currentUser } = useAuth()

  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilter] = useState('All')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    if (!currentUser?.uid) return
    try {
      const data = await getUserApplications(currentUser.uid)
      setApps(data || [])
    } catch {
      toast.error('Failed to load applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid])

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = app => {
    setEditing(app.id)
    setForm({
      company: app.company || '',
      position: app.position || '',
      industry: app.industry || INDUSTRIES[0],
      status: app.status || 'Applied',
      appliedDate: app.appliedDate || '',
      deadline: app.deadline || '',
      jobUrl: app.jobUrl || '',
      notes: app.notes || '',
      resumeUrl: app.resumeUrl || '',
    })
    setShowModal(true)
  }

  // FR-19 — validate file type and size before upload
  const handleFile = async e => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      return toast.error('File must be 10 MB or less.')
    }

    if (!ACCEPTED_MIME.includes(file.type)) {
      return toast.error('Unsupported file format. Use PDF, DOC, DOCX, PNG, or JPG.')
    }

    setUploading(true)
    try {
      const url = await uploadResume(file)
      setForm(f => ({ ...f, resumeUrl: url }))
      toast.success('Resume uploaded!')
    } catch (error) {
      console.error(error)
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // FR-08, FR-09, FR-14
  const handleSubmit = async e => {
    e.preventDefault()

    if (!form.company.trim() || !form.position.trim()) {
      return toast.error('Company and position are required.')
    }

    if (!currentUser?.uid) {
      return toast.error('User not authenticated.')
    }

    setSaving(true)
    try {
      if (editing) {
        await updateApplication(editing, form)
        toast.success('Application updated!')
      } else {
        await addApplication(currentUser.uid, form)
        toast.success('Application added!')
      }
      setShowModal(false)
      await load()
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // FR-10 — confirm before delete
  const handleDelete = async id => {
    if (!confirm('Delete this application? This cannot be undone.')) return

    setDeleting(id)
    try {
      await deleteApplication(id)
      setApps(p => p.filter(a => a.id !== id))
      toast.success('Application deleted.')
    } catch (error) {
      console.error(error)
      toast.error('Delete failed. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  // FR-34 — flag apps stuck in "Applied" for 14+ days
  const needsFollowUp = app =>
    app.status === 'Applied' &&
    app.appliedDate &&
    differenceInDays(new Date(), new Date(app.appliedDate)) > 14

  // FR-12 — filter and search
  const filtered = apps.filter(
    a =>
      (a.company?.toLowerCase().includes(search.toLowerCase()) ||
        a.position?.toLowerCase().includes(search.toLowerCase())) &&
      (filterStatus === 'All' || a.status === filterStatus)
  )

  return (
    <div className="fade-in">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text)' }}>
            Applications
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 3 }}>{apps.length} total</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={15} /> Add Application
        </button>
      </div>

      {(() => {
        const flagged = apps.filter(needsFollowUp)
        return flagged.length > 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.35)',
              borderRadius: 10,
              marginBottom: 16,
              color: 'var(--text)',
              fontSize: 13,
            }}
          >
            <AlertCircle size={15} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <span>
              <strong>{flagged.length} application{flagged.length > 1 ? 's' : ''}</strong> stuck in
              "Applied" for over 14 days — consider following up.
            </span>
          </div>
        ) : null
      })()}

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text2)',
            }}
          />
          <input
            className="input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search company or position…"
            style={{ paddingLeft: 32 }}
          />
        </div>

        <div className="filter-chips" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All', ...STATUSES].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: filterStatus === st ? 'var(--accent)' : 'transparent',
                color: filterStatus === st ? '#fff' : 'var(--text2)',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'var(--font)',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div
            className="spin"
            style={{
              width: 32,
              height: 32,
              border: '3px solid var(--border)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
            }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text2)' }}>
          <p style={{ marginBottom: 16 }}>{search ? `No results for "${search}"` : 'No applications yet.'}</p>
          {!search && (
            <button className="btn-primary" onClick={openAdd}>
              Add first application
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {['Company', 'Position', 'Industry', 'Status', 'Applied', 'Deadline', 'Resume', '', ''].map(
                    h => <th key={h}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app.id} style={needsFollowUp(app) ? { background: 'rgba(251,191,36,0.05)' } : {}}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600 }}>{app.company}</span>
                        {needsFollowUp(app) && (
                          <span title="Needs follow-up" style={{ color: '#fbbf24' }}>
                            <AlertCircle size={13} />
                          </span>
                        )}
                      </div>
                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            color: 'var(--accent)',
                            fontSize: 11,
                            textDecoration: 'none',
                          }}
                        >
                          <ExternalLink size={10} />
                          View
                        </a>
                      )}
                    </td>
                    <td>{app.position}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>{app.industry || '—'}</td>
                    <td>
                      <span className={`badge ${BADGE[app.status] || 'badge-applied'}`}>{app.status}</span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {app.appliedDate ? format(new Date(app.appliedDate), 'MMM d, yyyy') : '—'}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {app.deadline ? <DeadlineCell d={app.deadline} /> : '—'}
                    </td>
                    <td>
                      {app.resumeUrl ? (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            color: 'var(--accent)',
                            fontSize: 12,
                            textDecoration: 'none',
                          }}
                        >
                          <FileText size={13} />
                          View
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text2)', fontSize: 12 }}>None</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(app)} style={s.iconBtn} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          style={{ ...s.iconBtn, color: 'var(--danger)' }}
                          disabled={deleting === app.id}
                        >
                          {deleting === app.id ? <Loader size={14} className="spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              zIndex: 9999,
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100%',
                padding: '24px 16px',
                boxSizing: 'border-box',
              }}
            >
              <div
                className="fade-in"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  width: '100%',
                  maxWidth: 600,
                }}
              >
                <div style={s.modalHead}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                    {editing ? 'Edit' : 'Add'} Application
                  </span>
                  <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
                  <div className="form-row">
                    <div className="field" style={{ flex: 1 }}>
                      <label className="label">Company *</label>
                      <input
                        className="input"
                        value={form.company}
                        required
                        onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        placeholder="Google"
                      />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="label">Position *</label>
                      <input
                        className="input"
                        value={form.position}
                        required
                        onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                        placeholder="Software Intern"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="field" style={{ flex: 1 }}>
                      <label className="label">Industry / Category</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          className="input"
                          value={form.industry}
                          onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                          style={{ appearance: 'none', paddingRight: 32 }}
                        >
                          {INDUSTRIES.map(ind => (
                            <option key={ind}>{ind}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            color: 'var(--text2)',
                          }}
                        />
                      </div>
                    </div>

                    <div className="field" style={{ flex: 1 }}>
                      <label className="label">Status</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          className="input"
                          value={form.status}
                          onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                          style={{ appearance: 'none', paddingRight: 32 }}
                        >
                          {STATUSES.map(st => (
                            <option key={st}>{st}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            color: 'var(--text2)',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="field" style={{ flex: 1 }}>
                      <label className="label">Date Applied</label>
                      <input
                        className="input"
                        type="date"
                        value={form.appliedDate}
                        onChange={e => setForm(f => ({ ...f, appliedDate: e.target.value }))}
                      />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="label">Deadline</label>
                      <input
                        className="input"
                        type="date"
                        value={form.deadline}
                        onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Job URL</label>
                    <input
                      className="input"
                      type="url"
                      value={form.jobUrl}
                      onChange={e => setForm(f => ({ ...f, jobUrl: e.target.value }))}
                      placeholder="https://…"
                    />
                  </div>

                  <div className="field">
                    <label className="label">Notes</label>
                    <textarea
                      className="input"
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Interview notes, requirements…"
                      rows={3}
                      style={{ resize: 'vertical', fontFamily: 'var(--font)' }}
                    />
                  </div>

                  <div className="field">
                    <label className="label">Resume</label>
                    <div
                      style={{
                        padding: 12,
                        background: 'var(--surface2)',
                        border: '1px dashed var(--border)',
                        borderRadius: 8,
                      }}
                    >
                      {form.resumeUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <a
                            href={form.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              color: 'var(--accent)',
                              fontSize: 13,
                              textDecoration: 'none',
                            }}
                          >
                            <FileText size={14} />
                            View resume
                          </a>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}
                            onClick={() => setForm(f => ({ ...f, resumeUrl: '' }))}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            cursor: 'pointer',
                            color: 'var(--text2)',
                            fontSize: 13,
                          }}
                        >
                          {uploading ? (
                            <>
                              <Loader size={14} className="spin" />
                              Uploading…
                            </>
                          ) : (
                            <>
                              <Upload size={14} />
                              Upload Resume (PDF, DOC, DOCX, PNG, JPG — max 10 MB)
                            </>
                          )}
                          <input
                            type="file"
                            accept={ACCEPTED_FORMATS}
                            onChange={handleFile}
                            style={{ display: 'none' }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      justifyContent: 'flex-end',
                      paddingTop: 16,
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={saving || uploading}>
                      {saving ? (
                        <>
                          <Loader size={14} className="spin" />
                          Saving…
                        </>
                      ) : editing ? (
                        'Update'
                      ) : (
                        'Add Application'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

function DeadlineCell({ d }) {
  const days = Math.ceil((new Date(d) - new Date()) / 86400000)
  const urgent = days >= 0 && days <= 3
  const past = days < 0

  return (
    <div>
      <div>{format(new Date(d), 'MMM d, yyyy')}</div>
      <div
        style={{
          fontSize: 11,
          fontWeight: urgent ? 700 : 400,
          color: past ? 'var(--text2)' : urgent ? 'var(--danger)' : 'var(--text2)',
        }}
      >
        {past ? 'Passed' : days === 0 ? 'Today!' : `${days}d left`}
      </div>
    </div>
  )
}

const s = {
  iconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text2)',
    cursor: 'pointer',
    padding: 5,
    display: 'flex',
    borderRadius: 4,
  },
  modalHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    borderBottom: '1px solid var(--border)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text2)',
    cursor: 'pointer',
    display: 'flex',
  },
}