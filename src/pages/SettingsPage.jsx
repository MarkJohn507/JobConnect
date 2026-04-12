import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, ToggleLeft, ToggleRight } from 'lucide-react'

export default function SettingsPage() {
  const { dark, toggle } = useTheme()

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text)', marginBottom: 6 }}>
        Settings
      </h1>
      <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>
        Manage your display preferences.
      </p>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>Appearance</h2>
        <div style={s.row}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ ...s.iconBox, background: dark ? '#1e1e2e' : '#f5f5ff' }}>
              {dark ? (
                <Moon size={18} style={{ color: 'var(--accent)' }} />
              ) : (
                <Sun size={18} style={{ color: 'var(--accent)' }} />
              )}
            </div>
            <div>
              <div style={s.rowLabel}>Dark Mode</div>
              <div style={s.rowSub}>{dark ? 'Currently using dark theme' : 'Currently using light theme'}</div>
            </div>
          </div>
          <button onClick={toggle} style={s.toggleBtn}>
            {dark ? (
              <ToggleRight size={36} style={{ color: 'var(--accent)' }} />
            ) : (
              <ToggleLeft size={36} style={{ color: 'var(--text2)' }} />
            )}
          </button>
        </div>
      </section>
    </div>
  )
}

const s = {
  section: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text2)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 16,
  },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowLabel: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  rowSub: { fontSize: 12, color: 'var(--text2)', marginTop: 2 },
  toggleBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, flexShrink: 0 },
}