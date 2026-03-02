import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getUserApplications, addApplication,
  updateApplication, deleteApplication, uploadResume
} from '../firebase/firestore'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  Plus, Search, Pencil, Trash2, ExternalLink,
  Upload, X, Loader, FileText, ChevronDown
} from 'lucide-react'

const STATUSES = ['Applied', 'Interview', 'Offered', 'Rejected', 'Withdrawn']

const EMPTY_FORM = {
  company: '', position: '', status: 'Applied',
  appliedDate: '', deadline: '', jobUrl: '',
  notes: '', resumeUrl: ''
}

export default function ApplicationsPage() {
  const { currentUser } = useAuth()
  const [apps, setApps]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    try {
      const data = await getUserApplications(currentUser.uid)
      setApps(data)
    } catch (err) {
      console.error('Failed to load applications:', err)
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (app) => {
    setEditing(app.id)
    setForm({
      company: app.company || '',
      position: app.position || '',
      status: app.status || 'Applied',
      appliedDate: app.appliedDate || '',
      deadline: app.deadline || '',
      jobUrl: app.jobUrl || '',
      notes: app.notes || '',
      resumeUrl: app.resumeUrl || ''
    })
    setShowModal(true)
  }

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) return toast.error('File must be under 10MB')
    setUploading(true)
    try {
      const url = await uploadResume(file)
      setForm(f => ({ ...f, resumeUrl: url }))
      toast.success('Resume uploaded!')
    } catch {
      toast.error('Upload failed. Check Cloudinary preset.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.company || !form.position) return toast.error('Company and position are required')
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
      load()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this application?')) return
    setDeleting(id)
    try {
      await deleteApplication(id)
      toast.success('Deleted')
      setApps(prev => prev.filter(a => a.id !== id))
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = apps.filter(a => {
    const matchSearch = (
      a.company?.toLowerCase().includes(search.toLowerCase()) ||
      a.position?.toLowerCase().includes(search.toLowerCase())
    )
    const matchStatus = filterStatus === 'All' || a.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="fade-in">
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Applications</h2>
          <p style={s.sub}>{apps.length} total application{apps.length !== 1 ? 's' : ''}</p>
        </div>
        <button style={s.addBtn} onClick={openAdd}>
          <Plus size={16}/> Add Application
        </button>
      </div>

      {/* Filters */}
      <div style={s.filters}>
        <div style={s.searchWrap}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }}/>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search company or position..."
            style={s.searchInput}
          />
        </div>
        <div style={s.statusFilters}>
          {['All', ...STATUSES].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{ ...s.filterBtn, ...(filterStatus === st ? s.filterBtnActive : {}) }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading
        ? <Spinner/>
        : filtered.length === 0
          ? <Empty search={search} onAdd={openAdd}/>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Company','Position','Status','Applied','Deadline','Resume','Actions'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(app => (
                    <tr key={app.id} style={s.tr}>
                      <td style={s.td}>
                        <div style={{ fontWeight: 600 }}>{app.company}</div>
                        {app.jobUrl && (
                          <a href={app.jobUrl} target="_blank" rel="noreferrer" style={s.link}>
                            <ExternalLink size={11}/> View job
                          </a>
                        )}
                      </td>
                      <td style={s.td}>{app.position}</td>
                      <td style={s.td}><StatusBadge status={app.status}/></td>
                      <td style={s.td}>{app.appliedDate ? format(new Date(app.appliedDate), 'MMM d, yyyy') : '—'}</td>
                      <td style={s.td}>
                        {app.deadline
                          ? <DeadlineCell deadline={app.deadline}/>
                          : '—'
                        }
                      </td>
                      <td style={s.td}>
                        {app.resumeUrl
                          ? <a href={app.resumeUrl} target="_blank" rel="noreferrer" style={s.link}><FileText size={14}/> View</a>
                          : <span style={{ color: 'var(--text2)', fontSize: 12 }}>None</span>
                        }
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button style={s.iconBtn} onClick={() => openEdit(app)} title="Edit">
                            <Pencil size={14}/>
                          </button>
                          <button
                            style={{ ...s.iconBtn, color: 'var(--danger)' }}
                            onClick={() => handleDelete(app.id)}
                            disabled={deleting === app.id}
                            title="Delete"
                          >
                            {deleting === app.id ? <Loader size={14} className="spin"/> : <Trash2 size={14}/>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      }

      {/* Modal */}
      {showModal && (
        <div style={s.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()} className="fade-in">
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>{editing ? 'Edit Application' : 'Add Application'}</h3>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>

            <form onSubmit={handleSubmit} style={s.modalForm}>
              <div style={s.formRow}>
                <FormField label="Company *">
                  <input value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))}
                    placeholder="Google" style={s.input} required/>
                </FormField>
                <FormField label="Position *">
                  <input value={form.position} onChange={e => setForm(f => ({...f, position: e.target.value}))}
                    placeholder="Software Engineer Intern" style={s.input} required/>
                </FormField>
              </div>

              <div style={s.formRow}>
                <FormField label="Status">
                  <div style={{ position: 'relative' }}>
                    <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} style={s.select}>
                      {STATUSES.map(st => <option key={st}>{st}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text2)' }}/>
                  </div>
                </FormField>
                <FormField label="Job Posting URL">
                  <input value={form.jobUrl} onChange={e => setForm(f => ({...f, jobUrl: e.target.value}))}
                    placeholder="https://..." style={s.input} type="url"/>
                </FormField>
              </div>

              <div style={s.formRow}>
                <FormField label="Date Applied">
                  <input type="date" value={form.appliedDate} onChange={e => setForm(f => ({...f, appliedDate: e.target.value}))} style={s.input}/>
                </FormField>
                <FormField label="Application Deadline">
                  <input type="date" value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))} style={s.input}/>
                </FormField>
              </div>

              <FormField label="Notes">
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
                  placeholder="Interview notes, requirements, contact info..." style={s.textarea} rows={3}/>
              </FormField>

              <FormField label="Resume">
                <div style={s.uploadArea}>
                  {form.resumeUrl
                    ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <a href={form.resumeUrl} target="_blank" rel="noreferrer" style={s.link}>
                          <FileText size={14}/> View uploaded resume
                        </a>
                        <button type="button" style={s.removeBtn} onClick={() => setForm(f => ({...f, resumeUrl: ''}))}>
                          <X size={12}/>
                        </button>
                      </div>
                    )
                    : (
                      <label style={s.uploadLabel}>
                        {uploading
                          ? <><Loader size={14} className="spin"/> Uploading...</>
                          : <><Upload size={14}/> Upload Resume (PDF, max 10MB)</>
                        }
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile} style={{ display: 'none' }}/>
                      </label>
                    )
                  }
                </div>
              </FormField>

              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={s.submitBtn} disabled={saving || uploading}>
                  {saving ? <><Loader size={14} className="spin"/> Saving...</> : editing ? 'Update' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = { Applied: 'status-applied', Interview: 'status-interview', Offered: 'status-offered', Rejected: 'status-rejected', Withdrawn: 'status-withdrawn' }
  return <span className={map[status]} style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>{status}</span>
}

function DeadlineCell({ deadline }) {
  const days = Math.ceil((new Date(deadline) - new Date()) / 86400000)
  const urgent = days >= 0 && days <= 3
  const past = days < 0
  return (
    <div>
      <div style={{ fontSize: 13 }}>{format(new Date(deadline), 'MMM d, yyyy')}</div>
      <div style={{ fontSize: 11, color: past ? 'var(--text2)' : urgent ? 'var(--danger)' : 'var(--text2)', fontWeight: urgent ? 700 : 400 }}>
        {past ? 'Passed' : days === 0 ? 'Today!' : `${days}d left`}
      </div>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 14, flex: 1 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function Empty({ search, onAdd }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text2)' }}>
      <p style={{ marginBottom: 16, fontSize: 15 }}>
        {search ? `No results for "${search}"` : "You haven't added any applications yet."}
      </p>
      {!search && <button style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14 }} onClick={onAdd}>Add your first application</button>}
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="spin"/>
    </div>
  )
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text)' },
  sub: { color: 'var(--text2)', fontSize: 13, marginTop: 4 },
  addBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  filters: { marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: { position: 'relative', flex: 1, minWidth: 200 },
  searchInput: { width: '100%', padding: '9px 12px 9px 36px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none' },
  statusFilters: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  filterBtn: { padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', fontWeight: 500 },
  filterBtnActive: { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text2)', padding: '10px 12px', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '12px', fontSize: 13, color: 'var(--text)', verticalAlign: 'middle' },
  link: { display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent)', textDecoration: 'none', fontSize: 12 },
  iconBtn: { background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 4 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 },
  modal: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' },
  modalTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text)' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', display: 'flex' },
  modalForm: { padding: '20px 24px' },
  formRow: { display: 'flex', gap: 14 },
  input: { width: '100%', padding: '9px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none' },
  select: { width: '100%', padding: '9px 32px 9px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none', appearance: 'none' },
  textarea: { width: '100%', padding: '9px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'var(--font)' },
  uploadArea: { padding: '12px', background: 'var(--surface2)', border: '1px dashed var(--border)', borderRadius: 8 },
  uploadLabel: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)', fontSize: 13 },
  removeBtn: { background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', display: 'flex' },
  modalActions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' },
  cancelBtn: { padding: '9px 18px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  submitBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }
}
