import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserApplications, addApplication, updateApplication, deleteApplication, uploadResume } from '../firebase/firestore'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Plus, Search, Pencil, Trash2, ExternalLink, Upload, X, Loader, FileText, ChevronDown } from 'lucide-react'

const STATUSES = ['Applied','Interview','Offered','Rejected','Withdrawn']
const BADGE = { Applied:'badge-applied', Interview:'badge-interview', Offered:'badge-offered', Rejected:'badge-rejected', Withdrawn:'badge-withdrawn' }
const EMPTY_FORM = { company:'', position:'', status:'Applied', appliedDate:'', deadline:'', jobUrl:'', notes:'', resumeUrl:'' }

export default function ApplicationsPage() {
  const { currentUser } = useAuth()
  const [apps, setApps]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilter]   = useState('All')
  const [uploading, setUploading]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState(null)

  const load = async () => {
    try { setApps(await getUserApplications(currentUser.uid)) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = app => {
    setEditing(app.id)
    setForm({ company:app.company||'', position:app.position||'', status:app.status||'Applied',
      appliedDate:app.appliedDate||'', deadline:app.deadline||'', jobUrl:app.jobUrl||'',
      notes:app.notes||'', resumeUrl:app.resumeUrl||'' })
    setShowModal(true)
  }

  const handleFile = async e => {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 10*1024*1024) return toast.error('Max 10MB')
    setUploading(true)
    try { const url = await uploadResume(file); setForm(f => ({...f, resumeUrl:url})); toast.success('Uploaded!') }
    catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.company||!form.position) return toast.error('Company and position required')
    setSaving(true)
    try {
      editing ? await updateApplication(editing, form) : await addApplication(currentUser.uid, form)
      toast.success(editing ? 'Updated!' : 'Added!')
      setShowModal(false); load()
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this application?')) return
    setDeleting(id)
    try { await deleteApplication(id); setApps(p => p.filter(a => a.id !== id)); toast.success('Deleted') }
    catch { toast.error('Delete failed') }
    finally { setDeleting(null) }
  }

  const filtered = apps.filter(a =>
    (a.company?.toLowerCase().includes(search.toLowerCase()) || a.position?.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === 'All' || a.status === filterStatus)
  )

  return (
    <div className="fade-in">
      {/* Page header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, gap:12, flexWrap:'wrap' }}>
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:24, color:'var(--text)' }}>Applications</h2>
          <p style={{ color:'var(--text2)', fontSize:13, marginTop:3 }}>{apps.length} total</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={15}/> Add Application</button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text2)' }}/>
          <input className="input" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search company or position…" style={{ paddingLeft:32 }}/>
        </div>
        <div className="filter-chips" style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['All', ...STATUSES].map(st => (
            <button key={st} onClick={() => setFilter(st)} style={{
              padding:'6px 12px', borderRadius:6, border:'1px solid var(--border)',
              background: filterStatus===st ? 'var(--accent)' : 'transparent',
              color: filterStatus===st ? '#fff' : 'var(--text2)',
              fontSize:12, cursor:'pointer', fontFamily:'var(--font)',
            }}>{st}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading
        ? <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
            <div className="spin" style={{ width:32, height:32, border:'3px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%' }}/>
          </div>
        : filtered.length === 0
          ? <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text2)' }}>
              <p style={{ marginBottom:16 }}>{search ? `No results for "${search}"` : "No applications yet."}</p>
              {!search && <button className="btn-primary" onClick={openAdd}>Add first application</button>}
            </div>
          : <div className="card" style={{ padding:0, overflow:'hidden' }}>
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    {['Company','Position','Status','Applied','Deadline','Resume',''].map(h => <th key={h}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {filtered.map(app => (
                      <tr key={app.id}>
                        <td>
                          <div style={{ fontWeight:600 }}>{app.company}</div>
                          {app.jobUrl && <a href={app.jobUrl} target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:3, color:'var(--accent)', fontSize:11, textDecoration:'none' }}><ExternalLink size={10}/>View</a>}
                        </td>
                        <td>{app.position}</td>
                        <td><span className={`badge ${BADGE[app.status]||'badge-applied'}`}>{app.status}</span></td>
                        <td style={{ whiteSpace:'nowrap' }}>{app.appliedDate ? format(new Date(app.appliedDate),'MMM d, yyyy') : '—'}</td>
                        <td style={{ whiteSpace:'nowrap' }}>{app.deadline ? <DeadlineCell d={app.deadline}/> : '—'}</td>
                        <td>{app.resumeUrl
                          ? <a href={app.resumeUrl} target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:4, color:'var(--accent)', fontSize:12, textDecoration:'none' }}><FileText size={13}/>View</a>
                          : <span style={{ color:'var(--text2)', fontSize:12 }}>None</span>}
                        </td>
                        <td>
                          <div style={{ display:'flex', gap:6 }}>
                            <button onClick={() => openEdit(app)} style={s.iconBtn} title="Edit"><Pencil size={14}/></button>
                            <button onClick={() => handleDelete(app.id)} style={{ ...s.iconBtn, color:'var(--danger)' }} disabled={deleting===app.id}>
                              {deleting===app.id ? <Loader size={14} className="spin"/> : <Trash2 size={14}/>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
      }

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box fade-in" onClick={e => e.stopPropagation()}>
            <div style={s.modalHead}>
              <span style={{ fontSize:16, fontWeight:700, color:'var(--text)' }}>{editing ? 'Edit' : 'Add'} Application</span>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding:'20px 24px' }}>
              <div className="form-row">
                <div className="field" style={{ flex:1 }}>
                  <label className="label">Company *</label>
                  <input className="input" value={form.company} onChange={e => setForm(f=>({...f,company:e.target.value}))} placeholder="Google" required/>
                </div>
                <div className="field" style={{ flex:1 }}>
                  <label className="label">Position *</label>
                  <input className="input" value={form.position} onChange={e => setForm(f=>({...f,position:e.target.value}))} placeholder="Software Intern" required/>
                </div>
              </div>

              <div className="form-row">
                <div className="field" style={{ flex:1 }}>
                  <label className="label">Status</label>
                  <div style={{ position:'relative' }}>
                    <select className="input" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))} style={{ appearance:'none', paddingRight:32 }}>
                      {STATUSES.map(st => <option key={st}>{st}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'var(--text2)' }}/>
                  </div>
                </div>
                <div className="field" style={{ flex:1 }}>
                  <label className="label">Job URL</label>
                  <input className="input" type="url" value={form.jobUrl} onChange={e => setForm(f=>({...f,jobUrl:e.target.value}))} placeholder="https://…"/>
                </div>
              </div>

              <div className="form-row">
                <div className="field" style={{ flex:1 }}>
                  <label className="label">Date Applied</label>
                  <input className="input" type="date" value={form.appliedDate} onChange={e => setForm(f=>({...f,appliedDate:e.target.value}))}/>
                </div>
                <div className="field" style={{ flex:1 }}>
                  <label className="label">Deadline</label>
                  <input className="input" type="date" value={form.deadline} onChange={e => setForm(f=>({...f,deadline:e.target.value}))}/>
                </div>
              </div>

              <div className="field">
                <label className="label">Notes</label>
                <textarea className="input" value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))}
                  placeholder="Interview notes, requirements…" rows={3} style={{ resize:'vertical', fontFamily:'var(--font)' }}/>
              </div>

              <div className="field">
                <label className="label">Resume</label>
                <div style={{ padding:12, background:'var(--surface2)', border:'1px dashed var(--border)', borderRadius:8 }}>
                  {form.resumeUrl
                    ? <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <a href={form.resumeUrl} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:4, color:'var(--accent)', fontSize:13, textDecoration:'none' }}><FileText size={14}/>View resume</a>
                        <button type="button" style={{ background:'none', border:'none', color:'var(--text2)', cursor:'pointer' }} onClick={() => setForm(f=>({...f,resumeUrl:''}))}><X size={13}/></button>
                      </div>
                    : <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', color:'var(--text2)', fontSize:13 }}>
                        {uploading ? <><Loader size={14} className="spin"/>Uploading…</> : <><Upload size={14}/>Upload Resume (PDF, max 10MB)</>}
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile} style={{ display:'none' }}/>
                      </label>
                  }
                </div>
              </div>

              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:16, borderTop:'1px solid var(--border)' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving||uploading}>
                  {saving ? <><Loader size={14} className="spin"/>Saving…</> : editing ? 'Update' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function DeadlineCell({ d }) {
  const days = Math.ceil((new Date(d) - new Date()) / 86400000)
  const urgent = days >= 0 && days <= 3
  const past   = days < 0
  return (
    <div>
      <div>{format(new Date(d), 'MMM d, yyyy')}</div>
      <div style={{ fontSize:11, color: past ? 'var(--text2)' : urgent ? 'var(--danger)' : 'var(--text2)', fontWeight: urgent ? 700 : 400 }}>
        {past ? 'Passed' : days === 0 ? 'Today!' : `${days}d left`}
      </div>
    </div>
  )
}

const s = {
  iconBtn: { background:'none', border:'none', color:'var(--text2)', cursor:'pointer', padding:5, display:'flex', borderRadius:4 },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:16 },
  modal: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, width:'100%', maxWidth:600, maxHeight:'92vh', overflowY:'auto' },
  modalHead: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', borderBottom:'1px solid var(--border)' },
  closeBtn: { background:'none', border:'none', color:'var(--text2)', cursor:'pointer', display:'flex' },
}
