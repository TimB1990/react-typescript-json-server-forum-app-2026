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
      const response = await fetch('http://localhost:5001/register', {
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

  console.log(formData)

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
              <form onSubmit={handleSubmit}>
                {/* Success Banner */}
                {successMsg && (
                  <div className="form-field">
                    <div className="success-field">
                      {successMsg}
                    </div>
                  </div>
                )}

                {/* Global Error Banner */}
                {errors.global && (
                  <div className="form-field">
                    <div className="error-field global">
                      {errors.global}
                    </div>
                  </div>
                )}

                {/* Username field */}
                <div className="form-field">
                  <div className="field-info">
                    <label>Display Name</label>
                    {errors && errors['username'] ? (
                      <div className="error-field">
                        {errors['username']}
                      </div>
                    ) : ("")}
                  </div>
                  <input type="text" name="username" onChange={handleChange} value={formData.username} />
                </div>


                {/* Email field */}
                <div className="form-field">
                  <div className="field-info">
                    <label>Email</label>
                    {errors && errors['email'] ? (
                      <div className="error-field">
                        {errors['email']}
                      </div>
                    ) : ("")}
                  </div>
                  <input type="email" name="email" onChange={handleChange} value={formData.email} />
                </div>


                {/* Password field */}
                <div className="form-field">
                  <div className="field-info">
                    <label>Password</label>
                    {errors && errors['password'] ? (
                      <div className="error-field">
                        {errors['password']}
                      </div>
                    ) : ("")}
                  </div>
                  <input type="password" name="password" onChange={handleChange} value={formData.password} />
                </div>


                {/* Confirm pass field */}
                <div className="form-field">
                  <div className="field-info">
                    <label>Confirm password</label>
                    {errors && errors['passwordConfirm'] ? (
                      <div className="error-field">
                        {errors['passwordConfirm']}
                      </div>
                    ) : ("")}
                  </div>
                  <input type="password" name="passwordConfirm" onChange={handleChange} value={formData.passwordConfirm} />
                </div>


                {/* Receive updates checkbox */}
                <div className="form-field">
                  <input type="checkbox" name="recaptcha" />
                  <label>I am not a robot (recaptcha)</label>
                </div>


                {/* Receive spam field */}
                <div className="form-field">
                  <input type="checkbox" name="regAdminMails" onChange={handleChange} checked={formData.regAdminMails} />
                  <label>Receive news and updates</label>
                </div>


                {/* Agree to terms field */}
                <div className="form-field">
                  <input type="checkbox" name="regAgreedTerms" onChange={handleChange} checked={formData.regAgreedTerms} />
                  <label>I agree to the <u>Terms of Use</u> and <u>Privacy Policy</u></label>
                  {errors && errors['regAgreedTerms'] ? (
                    <div className="error-field">
                      {errors['regAgreedTerms']}
                    </div>
                  ) : ("")}
                </div>

                {/* Submit button */}
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
