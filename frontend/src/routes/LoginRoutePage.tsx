import { GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../shared/auth/useAuth'

export function LoginRoutePage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  async function handleSuccess(credential: string) {
    setError(null)
    try {
      await login(credential)
      void navigate('/groups', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed. Please try again.'
      setError(message)
    }
  }

  return (
    <section aria-labelledby="login-title">
      <h2 id="login-title">Sign in</h2>
      <GoogleLogin
        onSuccess={(response) => {
          if (response.credential) {
            void handleSuccess(response.credential)
          } else {
            setError('No credential received from Google. Please try again.')
          }
        }}
        onError={() => {
          setError('Google sign-in failed. Please try again.')
        }}
      />
      {error && (
        <p role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </section>
  )
}
