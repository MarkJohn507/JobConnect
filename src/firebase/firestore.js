import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail
} from 'firebase/auth'
import {
  collection, addDoc, updateDoc, deleteDoc, setDoc,
  doc, getDocs, query, where, serverTimestamp, getDoc
} from 'firebase/firestore'
import { auth, db, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from './config'

// ── Helpers ───────────────────────────────────────────
// Check if a UID belongs to an admin
export const isAdminUID = async (uid) => {
  const snap = await getDoc(doc(db, 'admins', uid))
  return snap.exists()
}

// Check if an email is already registered as an admin
export const isAdminEmail = async (email) => {
  const snap = await getDocs(
    query(collection(db, 'admins'), where('email', '==', email.toLowerCase()))
  )
  return !snap.empty
}

// ── Auth ──────────────────────────────────────────────
export const register = async (email, password) => {
  // Block registration if email is already used by an admin account
  const adminEmail = await isAdminEmail(email)
  if (adminEmail) {
    const err = new Error('This email is reserved and cannot be used for registration.')
    err.code = 'auth/admin-email-reserved'
    throw err
  }

  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await setDoc(doc(db, 'users', cred.user.uid), {
    email: email.toLowerCase(),
    displayName: '',
    disabled: false,
    createdAt: serverTimestamp(),
  })
  return cred
}

export const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const logout = () => signOut(auth)

export const updateUserProfile = async (name) => {
  await updateProfile(auth.currentUser, { displayName: name })
  await updateDoc(doc(db, 'users', auth.currentUser.uid), { displayName: name })
}

export const resetPassword = async (email) => {
  const methods = await fetchSignInMethodsForEmail(auth, email)
  if (methods.length === 0) {
    const err = new Error('No account found with that email address.')
    err.code = 'auth/user-not-found'
    throw err
  }
  return sendPasswordResetEmail(auth, email)
}

// ── Applications ──────────────────────────────────────
export const addApplication = (uid, data) =>
  addDoc(collection(db, 'applications'), {
    ...data, uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

export const updateApplication = (id, data) =>
  updateDoc(doc(db, 'applications', id), {
    ...data, updatedAt: serverTimestamp()
  })

export const deleteApplication = (id) =>
  deleteDoc(doc(db, 'applications', id))

export const getUserApplications = async (uid) => {
  const q = query(collection(db, 'applications'), where('uid', '==', uid))
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
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
