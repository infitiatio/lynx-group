import { GoogleOAuthProvider } from '@react-oauth/google'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './shared/auth/AuthContext'
import { appRouter } from './routes/appRouter'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

if (!googleClientId) {
  throw new Error(
    'Missing VITE_GOOGLE_CLIENT_ID. Copy frontend/.env.example to frontend/.env.local and set your Google OAuth web client id.',
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <RouterProvider router={appRouter} />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
