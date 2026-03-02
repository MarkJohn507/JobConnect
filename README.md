# Job Connect

A web-based internship and job application tracker built with React + Firebase + Cloudinary.

## Tech Stack
- **Frontend**: React 18 + Vite
- **Auth**: Firebase Authentication
- **Database**: Firestore
- **File Storage**: Cloudinary (free tier)
- **Hosting**: Firebase Hosting

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
```bash
npm run dev
```
Open http://localhost:5173

### 3. Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Set public directory to: dist
# Configure as single-page app: Yes
npm run build
firebase deploy
```

### 4. Apply Firestore Security Rules
In Firebase Console → Firestore → Rules, paste the contents of `firestore.rules`.

## Features
- Register / Login / Forgot Password
- Add, edit, delete job applications
- Track status: Applied, Interview, Offered, Rejected, Withdrawn
- Upload resume via Cloudinary
- Dashboard with stats, status breakdown, upcoming deadlines
- Profile management
