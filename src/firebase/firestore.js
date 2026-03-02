import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, getDocs, query, where, serverTimestamp
} from 'firebase/firestore'
import { auth, db, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from './config'

// ── Auth ──────────────────────────────────────────────
export const register = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password)

export const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const logout = () => signOut(auth)

export const updateUserProfile = (name) =>
  updateProfile(auth.currentUser, { displayName: name })

export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email)

// ── Applications ──────────────────────────────────────
export const addApplication = (uid, data) =>
  addDoc(collection(db, 'applications'), {
    ...data,
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

export const updateApplication = (id, data) =>
  updateDoc(doc(db, 'applications', id), {
    ...data,
    updatedAt: serverTimestamp()
  })

export const deleteApplication = (id) =>
  deleteDoc(doc(db, 'applications', id))

export const getUserApplications = async (uid) => {
  const q = query(
    collection(db, 'applications'),
    where('uid', '==', uid)
  )
  const snap = await getDocs(q)
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  // Sort client-side to avoid needing a composite index
  return docs.sort((a, b) => {
    const aTime = a.createdAt?.seconds ?? 0
    const bTime = b.createdAt?.seconds ?? 0
    return bTime - aTime
  })
}

// ── Cloudinary Upload ─────────────────────────────────
export const uploadResume = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('resource_type', 'raw')

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
    { method: 'POST', body: formData }
  )
  if (!res.ok) throw new Error('Upload failed')
  const data = await res.json()
  return data.secure_url
}
