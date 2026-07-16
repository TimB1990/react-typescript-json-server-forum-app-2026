import React, { useState, type ChangeEvent } from 'react'
import { Card } from '../../common/components/ui/cards/Card'
import { Link } from 'react-router-dom'
import { SsoButton } from '../../common/components/ui/buttons/SsoButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrosoft, faGoogle, faApple } from '@fortawesome/free-brands-svg-icons'
import type { FormErrors } from '../../common/types/register'

export const Register = () => {

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    regAdminMails: false,
    regAgreedTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Cast name to keyof FormErrors to dynamically check the keys safely
    const fieldKey = name as keyof FormErrors;
    if (errors[fieldKey]) {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[fieldKey]; // Cleanly remove the error key
        return nextErrors;
      });
    }
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrors({})
    setSuccessMsg('')

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json();

      if (!response.ok) {
        // If validation errors are sent by backend, save them to state
        if (data.errors) {
          setErrors(data.errors);
        } else {
          // Fallback global error
          setErrors({ global: data.message || 'An error occurred during registration.' });
        }
      } else {
        setSuccessMsg(data.message || 'Registration completed successfully!');
        // Reset form on success
        setFormData({
          username: '',
          email: '',
          password: '',
          passwordConfirm: '',
          regAdminMails: false,
          regAgreedTerms: false,
        });
      }
    }
    catch (err) {
      setErrors({ global: 'Could not connect to the server. Please try again later.' });
    }
  }

  // TODO implement errors display and handleSumit, handleChange
  return (
    <div className="layout">
      <div className="container half-width first">
        <Card
          header={<>
            <h2>Sign up</h2>
          </>}
          content={
            <>
              <form action="">
                <div className="form-field">
                  <label>Display Name</label>
                  <input type="email" name="username" />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input type="email" name="email" />
                </div>
                <div className="form-field">
                  <label>Password</label>
                  <input type="password" name="password" />
                </div>
                <div className="form-field">
                  <label>Confirm password</label>
                  <input type="password" name="passwordConfirm" />
                </div>
                <div className="form-field">
                  <input type="checkbox" name="recaptcha" />
                  <label>I am not a robot (recaptcha)</label>
                </div>
                <div className="form-field">
                  <input type="checkbox" name="regAdminMails" />
                  <label>Receive news and updates</label>
                </div>
                <div className="form-field">
                  <input type="checkbox" name="regAgreedTerms" />
                  <label>I agree to the <u>Terms of Use</u> and <u>Privacy Policy</u></label>
                </div>
                <div className="form-field">
                  <button className="register-login-link-btn primary" type="submit">Create my Account</button>
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
            <h2>Sign Up Faster</h2>
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
