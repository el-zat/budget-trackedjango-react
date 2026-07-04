import React, { useContext, useState, useEffect } from "react"
import '../../styles/Registration.scss' 
import Modal from '../Modal';
import {ModalContext} from '../../context/ModalContext'
import {AuthContext} from '../../context/AuthContext'


function Registration() {

  const [registrationPassword1, setRegistrationPassword1] = useState('');
  const [registrationPassword2, setRegistrationPassword2] = useState('');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [registrationFirstName, setRegistrationFirstName] = useState('');
  const [registrationLastName, setRegistrationLastName] = useState('');

  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState('');


  const modalProviderValues = useContext(ModalContext);
  const authProviderValues = useContext(AuthContext)

  // Clear all fields when the modal is opened
  useEffect(() => {
    if (modalProviderValues.isModalRegistrationOpen) {
      authProviderValues.setRegistrationUsername('');
      setRegistrationPassword1('');
      setRegistrationPassword2('');
      setRegistrationEmail('');
      setRegistrationFirstName('');
      setRegistrationLastName('');
      setMessage('');
      setIsSuccess(false);
      setResendMessage('');
    }
  }, [modalProviderValues.isModalRegistrationOpen]);


  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/registration/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: authProviderValues.registrationUsername,
          password1: registrationPassword1,
          password2: registrationPassword2,
          email: registrationEmail,
          first_name: registrationFirstName,
          last_name: registrationLastName,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setMessage('Account created! Please check your email to verify your account.');
        authProviderValues.setRegistrationUsername('');
        setRegistrationPassword1('');
        setRegistrationPassword2('');
        setRegistrationFirstName('');
        setRegistrationLastName('');
      } else {
        const data = await response.json();
        setIsSuccess(false);
        setMessage('Error: ' + (data.detail || JSON.stringify(data)));
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('Server error: ' + error.message);
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await fetch('/api/resend-verification/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registrationEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setResendMessage('Verification email sent! Check your inbox.');
      } else {
        setResendMessage(data.error || 'Failed to resend.');
      }
    } catch (error) {
      setResendMessage('Server error: ' + error.message);
    }
  };

  const handleClose = () => {
    modalProviderValues.setIsModalRegistrationOpen(false);
    setIsSuccess(false);
    setMessage('');
    setResendMessage('');
  };


  return  <React.Fragment>
          <Modal isOpen={modalProviderValues.isModalRegistrationOpen} 
                 onClose={handleClose}>
                  <div className="registration-container">
                    <h2>Registration</h2>
                    
                    {isSuccess ? (
                      <div className="verification-notice">
                        <div className="verification-icon">✉️</div>
                        <h3>Check your email!</h3>
                        <p>We sent a verification link to <strong>{registrationEmail}</strong>.</p>
                        <p>Click the link in the email to activate your account.</p>
                        <button className="resend-btn" type="button" onClick={handleResendVerification}>
                          Resend verification email
                        </button>
                        {resendMessage && <div className="resend-message">{resendMessage}</div>}
                        <button className="submit-registration" type="button" onClick={handleClose}>
                          Close
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleRegistration} style={{ maxWidth: 400, margin: '0 auto' }}>               
                        <div>
                          <label>Username:</label>
                          <input
                            type="text"
                            value={authProviderValues.registrationUsername}
                            onChange={e => authProviderValues.setRegistrationUsername(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label>Password:</label>
                          <input
                            type="password"
                            value={registrationPassword1}
                            onChange={e => setRegistrationPassword1(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label>Confirm password:</label>
                          <input
                            type="password"
                            value={registrationPassword2}
                            onChange={e => setRegistrationPassword2(e.target.value)}
                            required
                          />
                        </div>          
                        <div>
                          <label>Email:</label>
                          <input
                            type="email"
                            value={registrationEmail}
                            onChange={e => setRegistrationEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label>First name:</label>
                          <input
                            type="text"
                            value={registrationFirstName}
                            onChange={e => setRegistrationFirstName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label>Last name:</label>
                          <input
                            type="text"
                            value={registrationLastName}
                            onChange={e => setRegistrationLastName(e.target.value)}
                          />
                        </div>
                        <button className="submit-registration" type="submit">Create account</button>
                        {message && <div style={{ marginTop: 10, color: 'red' }}>{message}</div>}
                      </form>
                    )}

                  </div>
          
          </Modal>

        </React.Fragment> 
}

export  {Registration}