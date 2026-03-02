import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCsnFtnBI-dVHF3QxThkwA7h3Q7N7M3mIk",
  authDomain: "jobconnect-a4d0c.firebaseapp.com",
  projectId: "jobconnect-a4d0c",
  storageBucket: "jobconnect-a4d0c.firebasestorage.app",
  messagingSenderId: "23543026616",
  appId: "1:23543026616:web:e14cc456c531b03704754d",
  measurementId: "G-RE840K95D0"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Cloudinary config
export const CLOUDINARY_CLOUD_NAME = 'dkpvuzjut'
export const CLOUDINARY_UPLOAD_PRESET = 'job_connect_uploads'
