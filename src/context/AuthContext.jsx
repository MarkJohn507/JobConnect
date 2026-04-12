import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      try {
        if (!user) {
          setCurrentUser(null)
          setLoading(false)
          return
        }

        // Check if this signed-in user is an admin
        const adminRef = doc(db, 'admins', user.uid)
        const adminSnap = await getDoc(adminRef)

        // If admin, do NOT create a users/{uid} profile
        if (adminSnap.exists()) {
          const adminData = adminSnap.data()
          setCurrentUser({
            ...user,
            ...adminData,
            role: 'admin',
          })
          return
        }

        // Normal user path
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          const profile = {
            uid: user.uid,
            name: user.displayName || '',
            email: user.email || '',
            contact: '',
            batchYear: '',
            role: 'user',
            photoURL: user.photoURL || '',
            disabled: false,
            createdAt: serverTimestamp(),
          }

          await setDoc(userRef, profile)
          setCurrentUser({ ...user, ...profile })
        } else {
          setCurrentUser({ ...user, ...userSnap.data() })
        }
      } catch (error) {
        console.error('Auth context error:', error)
        setCurrentUser(null)
      } finally {
        setLoading(false)
      }
    })

    return unsub
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}