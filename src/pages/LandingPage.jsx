import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function LandingPage() {
  const { dark, toggle } = useTheme()

  return (
    <div style={s.page}>
      <button style={s.themeBtn} onClick={toggle}>
        {dark ? <Sun size={18}/> : <Moon size={18}/>}
      </button>

      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.logo}>
          <div style={s.logoIcon}>JC</div>
          <span style={s.logoText}>Job<em>Connect</em></span>
        </div>
        <div style={s.navLinks}>
          <Link to="/login" style={s.navLink}>Sign In</Link>
          <Link to="/register" style={s.navBtn}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.badge}>Free for students</div>
          <h1 style={s.heroTitle}>
            Track every job application.<br/>
            <em>Miss nothing.</em>
          </h1>
          <p style={s.heroSub}>
            Job Connect helps students and fresh graduates organize their internship
            and job applications in one place — deadlines, statuses, resumes, and more.
          </p>
          <div style={s.heroCta}>
            <Link to="/register" style={s.ctaBtn}>Create Free Account</Link>
            <Link to="/login" style={s.ctaOutline}>Sign In</Link>
          </div>
        </div>

        {/* Mock card */}
        <div style={s.mockCard} className="fade-in">
          <div style={s.mockHeader}>
            <div style={s.mockDot('#f87171')}/>
            <div style={s.mockDot('#fbbf24')}/>
            <div style={s.mockDot('#4ade80')}/>
          </div>
          {[
            { company: 'Google', role: 'Software Intern', status: 'Interview', color: '#4ade80', bg: '#1a3a2a' },
            { company: 'Meta',   role: 'Product Intern',  status: 'Applied',   color: '#60a5fa', bg: '#1e3a5f' },
            { company: 'Grab',   role: 'Backend Intern',  status: 'Offered',   color: '#fbbf24', bg: '#2d2a1a' },
            { company: 'Shopee', role: 'Frontend Intern', status: 'Rejected',  color: '#f87171', bg: '#3a1a1a' },
          ].map(item => (
            <div key={item.company} style={s.mockRow}>
              <div>
                <div style={s.mockCompany}>{item.company}</div>
                <div style={s.mockRole}>{item.role}</div>
              </div>
              <span style={{ ...s.mockBadge, color: item.color, background: item.bg }}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={s.features}>
        <h2 style={s.featTitle}>Everything you need to stay organized</h2>
        <div style={s.featGrid}>
          {[
            { emoji: '📋', title: 'Track Applications', desc: 'Log every application with company, position, status, and dates.' },
            { emoji: '📅', title: 'Deadline Reminders', desc: 'Never miss a deadline — see upcoming dates at a glance.' },
            { emoji: '📄', title: 'Resume Storage', desc: 'Upload and attach resumes to each application via Cloudinary.' },
            { emoji: '📊', title: 'Progress Dashboard', desc: 'Visualize your job search with stats and a status breakdown.' },
          ].map(f => (
            <div key={f.title} style={s.featCard}>
              <div style={s.featEmoji}>{f.emoji}</div>
              <h3 style={s.featCardTitle}>{f.title}</h3>
              <p style={s.featCardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={s.ctaSection}>
        <h2 style={s.ctaTitle}>Ready to organize your job search?</h2>
        <p style={s.ctaSub}>Free to use. No credit card required.</p>
        <Link to="/register" style={s.ctaBtn}>Get Started for Free</Link>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>
          © 2025 Job Connect · Built for students &amp; fresh graduates
        </p>
        <Link to="/admin/login" style={{ color: 'var(--text2)', fontSize: 12, textDecoration: 'none' }}>
          Admin
        </Link>
      </footer>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg)', position: 'relative' },
  themeBtn: {
    position: 'fixed', top: 20, right: 20, zIndex: 100,
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '8px 10px', color: 'var(--text2)',
    cursor: 'pointer', display: 'flex', alignItems: 'center'
  },
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 48px', borderBottom: '1px solid var(--border)',
    position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 50
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10, background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: '#fff'
  },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text)' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 12 },
  navLink: { color: 'var(--text2)', textDecoration: 'none', fontSize: 14, fontWeight: 500 },
  navBtn: {
    padding: '8px 18px', background: 'var(--accent)', color: '#fff',
    borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600
  },
  hero: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 60, padding: '80px 48px', flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto'
  },
  heroInner: { flex: 1, minWidth: 300, maxWidth: 520 },
  badge: {
    display: 'inline-block', padding: '4px 12px', borderRadius: 20,
    background: 'rgba(108,99,255,0.15)', color: 'var(--accent)',
    fontSize: 12, fontWeight: 600, marginBottom: 20
  },
  heroTitle: {
    fontFamily: 'var(--font-display)', fontSize: 46, color: 'var(--text)',
    lineHeight: 1.15, marginBottom: 20
  },
  heroSub: { fontSize: 16, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 32 },
  heroCta: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  ctaBtn: {
    padding: '12px 24px', background: 'var(--accent)', color: '#fff',
    borderRadius: 10, textDecoration: 'none', fontSize: 15, fontWeight: 600
  },
  ctaOutline: {
    padding: '12px 24px', border: '1px solid var(--border)', color: 'var(--text)',
    borderRadius: 10, textDecoration: 'none', fontSize: 15, fontWeight: 500
  },
  mockCard: {
    flex: 1, minWidth: 280, maxWidth: 380, background: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: 16, padding: 20,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  mockHeader: { display: 'flex', gap: 6, marginBottom: 16 },
  mockDot: (color) => ({ width: 10, height: 10, borderRadius: '50%', background: color }),
  mockRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid var(--border)'
  },
  mockCompany: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  mockRole: { fontSize: 12, color: 'var(--text2)' },
  mockBadge: { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6 },
  features: { padding: '80px 48px', maxWidth: 1100, margin: '0 auto' },
  featTitle: {
    fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--text)',
    textAlign: 'center', marginBottom: 40
  },
  featGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 },
  featCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 14, padding: 24
  },
  featEmoji: { fontSize: 28, marginBottom: 12 },
  featCardTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 },
  featCardDesc: { fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 },
  ctaSection: {
    textAlign: 'center', padding: '80px 48px',
    borderTop: '1px solid var(--border)'
  },
  ctaTitle: { fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--text)', marginBottom: 12 },
  ctaSub: { color: 'var(--text2)', fontSize: 15, marginBottom: 28 },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 48px', borderTop: '1px solid var(--border)'
  }
}
