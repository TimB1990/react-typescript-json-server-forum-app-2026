import React, { useState } from 'react'
import { Card } from '../../common/components/ui/cards/Card'
import { Link, useNavigate } from 'react-router-dom'
import { SsoButton } from '../../common/components/ui/buttons/SsoButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrosoft, faGoogle, faApple } from '@fortawesome/free-brands-svg-icons'
import { useAuth } from '../../context/AuthContext'

export const Login = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const { setUser } = useAuth()

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe })
      })

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login Failed')
      }

      setUser(data.user)

      navigate('/')

    } catch (error: any) {
      setError(error.message || 'Unexpected error occurred')
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="layout">
      <div className="container half-width first">
        <Card
          header={<>
            <h2>Login</h2>
            <p>No account yet? <Link to="/register">Sign Up</Link></p>
          </>}
          content={
            <>
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="error-field global">
                    {error}
                  </div>
                )}

                <div className="form-field">
                  <div className="field-info">
                    <label htmlFor="email">Email</label>
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <div className="field-info">
                    <label htmlFor="password">Password</label>
                  </div>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>
                    <input
                      type="checkbox"
                      name="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Remember me
                  </label>
                </div>

                <div className="form-field">
                  <button className="register-login-link-btn primary" type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>

            </>
          }
          options={{ divided: { top: false, bottom: false } }}
        />
      </div>
      <div className="container half-width second">
        <Card
          header={<>
            <h2>Sign In Faster</h2>
            <p>Connect via one of these sites.</p>
          </>
          }
          content={<>
            <div className="sso-container">
              <SsoButton
                icon={<FontAwesomeIcon icon={faMicrosoft} />}
                text="Sign in with microsoft"
                brandColor='#008a00'
              />
              <SsoButton
                icon={<FontAwesomeIcon icon={faGoogle} />}
                text="Sign in with Google"
                brandColor='#4285F4'
              />
              <SsoButton
                icon={<FontAwesomeIcon icon={faApple} />}
                text="Sign in with Apple"
                brandColor='hsl(0 0% 100% / 0.1)'
              />
            </div>
          </>}
          options={{ divided: { top: false, bottom: false } }}
        />
      </div>
    </div>
  )
}
