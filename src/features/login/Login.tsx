import React from 'react'
import { Card } from '../../common/components/ui/cards/Card'
import { Link } from 'react-router-dom'
import { SsoButton } from '../../common/components/ui/buttons/SsoButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrosoft, faGoogle, faApple } from '@fortawesome/free-brands-svg-icons'

const login = (email: string, password: string): void => {
  console.log('do login...')
}

export const Login = () => {
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
              <form action="">
                <div className="form-field">
                  <label>Email</label>
                  <input type="email" name="email" />
                </div>
                <div className="form-field">
                  <label>Password</label>
                  <input type="password" name="password" />
                </div>
                <div className="form-field">
                  <input type="checkbox" name="remember-me" />
                  <label>Remember me</label>
                </div>
                <div className="form-field">
                  <button className="register-login-link-btn primary" type="submit">Login</button>
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
