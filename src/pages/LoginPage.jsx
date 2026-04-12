import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { Loader, Sun, Moon } from 'lucide-react'

const ALLOWED_DOMAIN = 'thelewiscollege.edu.ph' // confirm exact domain with IT

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { dark, toggle }      = useTheme()
  const navigate              = useNavigate()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const auth     = getAuth()
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ hd: ALLOWED_DOMAIN })

    try {
      const cred  = await signInWithPopup(auth, provider)
      const user  = cred.user
      const email = user.email ?? ''

      // Enforce domain — hd param is a hint only, must hard-check here
      if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        await auth.signOut()
        toast.error('Only Lewis College institutional accounts are allowed.')
        return
      }

      // Create Firestore profile on first sign-in (FR-03)
      const userRef = doc(db, 'users', user.uid)
      const snap    = await getDoc(userRef)

      if (!snap.exists()) {
        await setDoc(userRef, {
          uid:       user.uid,
          name:      user.displayName ?? '',
          email:     email,
          role:      'user',
          createdAt: serverTimestamp(),
        })
      }

      // Role-based redirect (FR-26)
      const data = snap.exists() ? snap.data() : { role: 'user' }
      toast.success('Welcome!')
      navigate(data.role === 'admin' ? '/admin' : '/dashboard')

    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User closed the popup — no toast needed
        return
      }
      if (err.code === 'auth/network-request-failed') {
        toast.error('Network error. Check your connection and try again.')
        return
      }
      toast.error('Sign-in failed. Please try again.') // FR-04
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <button onClick={toggle} style={s.themeBtn}>
        {dark ? <Sun size={18}/> : <Moon size={18}/>}
      </button>

      <div className="auth-card fade-in">
        <div style={s.brand}>
          <div style={s.brandIcon}>JC</div>
          <h1 style={s.brandName}>Job<em>Connect</em></h1>
        </div>
        <p style={s.sub}>Track every application. Miss nothing.</p>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={s.googleBtn}
        >
          {loading ? (
            <Loader size={16} className="spin"/>
          ) : (
            <>
              <GoogleIcon/>
              Sign in with Google
            </>
          )}
        </button>

        <p style={s.hint}>
          Only <strong>@{ALLOWED_DOMAIN}</strong> accounts are permitted.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-8 19.6-20 0-1.3-.1-2.7-.4-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.6 4.8C9.8 39.7 16.4 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
    </svg>
  )
}

const s = {
  themeBtn: { position:'fixed', top:16, right:16, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 10px', color:'var(--text2)', cursor:'pointer', display:'flex', alignItems:'center' },
  brand:     { display:'flex', alignItems:'center', gap:10, marginBottom:8 },
  brandIcon: { width:42, height:42, borderRadius:12, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'#fff' },
  brandName: { fontFamily:'var(--font-display)', fontSize:26, color:'var(--text)' },
  sub:       { color:'var(--text2)', fontSize:14, marginBottom:24 },
  googleBtn: { width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'11px 16px', borderRadius:10, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:14, fontWeight:600, cursor:'pointer' },
  hint:      { textAlign:'center', fontSize:12, color:'var(--text2)', marginTop:16 },
}