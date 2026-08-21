import React, { useState, useContext, useEffect } from "react";
import '../../styles/ForgotPassword.scss';
import Modal from '../Modal';
import { ModalContext } from '../../context/ModalContext';


function ForgotPassword() {
  const modalProviderValues = useContext(ModalContext);

  // Steps: 'request' -> 'email-sent' -> 'reset-form' -> 'success'
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [username, setUsername] = useState('');

  // Check if opened from a reset link (URL contains /reset-password/)
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/reset-password\/([^/]+)\/([^/]+)/);
    if (match) {
      const urlEmail = decodeURIComponent(match[1]);
      const urlCode = match[2];
      setEmail(urlEmail);
      setCode(urlCode);
      validateToken(urlEmail, urlCode);
    }
  }, []);

  const validateToken = async (tokenEmail, tokenCode) => {
    try {
      const response = await fetch('/api/password-reset/validate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tokenEmail, code: tokenCode }),
      });
      const data = await response.json();
      if (data.valid) {
        setUsername(data.username);
        setStep('reset-form');
        modalProviderValues.setIsModalForgotPasswordOpen(true);
      } else {
        setMessage(data.error || 'Invalid or expired link.');
        setIsError(true);
        setStep('request');
        modalProviderValues.setIsModalForgotPasswordOpen(true);
      }
      // Clear the URL
      window.history.replaceState({}, '', '/');
    } catch (error) {
      setMessage('Server error. Please try again.');
      setIsError(true);
      setStep('request');
      modalProviderValues.setIsModalForgotPasswordOpen(true);
      window.history.replaceState({}, '', '/');
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (modalProviderValues.isModalForgotPasswordOpen && !code) {
      setStep('request');
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('');
      setIsError(false);
    }
  }, [modalProviderValues.isModalForgotPasswordOpen]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('/api/password-reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setStep('email-sent');
      } else {
        setMessage(data.error || 'Something went wrong.');
        setIsError(true);
      }
    } catch (error) {
      setMessage('Server error. Please try again.');
      setIsError(true);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsError(true);
      return;
    }

    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters.');
      setIsError(true);
      return;
    }

    try {
      const response = await fetch('/api/password-reset/confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setStep('success');
      } else {
        setMessage(data.error || 'Failed to reset password.');
        setIsError(true);
      }
    } catch (error) {
      setMessage('Server error. Please try again.');
      setIsError(true);
    }
  };

  const handleClose = () => {
    modalProviderValues.setIsModalForgotPasswordOpen(false);
    setStep('request');
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
    setIsError(false);
  };

  const goToLogin = () => {
    handleClose();
    modalProviderValues.setIsModalLoginOpen(true);
  };

  return (
    <Modal isOpen={modalProviderValues.isModalForgotPasswordOpen} onClose={handleClose}>
      <div className="forgot-password-container">
        
        {step === 'request' && (
          <>
            <h2>Forgot Password?</h2>
            <p className="forgot-description">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleRequestReset}>
              <div className="form-group">
                <label htmlFor="reset-email">Email:</label>
                <input
                  type="email"
                  id="reset-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <button className="submit-btn" type="submit">
                Send Reset Link
              </button>
            </form>
            {message && (
              <div className={`reset-message ${isError ? '' : 'reset-message--success'}`}>
                {message}
              </div>
            )}
            <p className="back-to-login">
              <a href="#" onClick={(e) => { e.preventDefault(); goToLogin(); }}>
                Back to Login
              </a>
            </p>
          </>
        )}

        {step === 'email-sent' && (
          <div className="email-sent-notice">
            <div className="email-icon">✉️</div>
            <h3>Check your email!</h3>
            <p>
              If an account exists for <strong>{email}</strong>, we've sent a password reset link.
            </p>
            <p className="email-hint">The link will expire in 1 hour.</p>
            <button className="submit-btn" type="button" onClick={handleClose}>
              Close
            </button>
          </div>
        )}

        {step === 'reset-form' && (
          <>
            <h2>Set New Password</h2>
            {username && <p className="forgot-description">Resetting password for <strong>{username}</strong></p>}
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="new-password">New Password:</label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-new-password">Confirm Password:</label>
                <input
                  type="password"
                  id="confirm-new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  minLength={8}
                />
              </div>
              <button className="submit-btn" type="submit">
                Reset Password
              </button>
            </form>
            {message && (
              <div className={`reset-message ${isError ? '' : 'reset-message--success'}`}>
                {message}
              </div>
            )}
          </>
        )}

        {step === 'success' && (
          <div className="success-notice">
            <div className="success-icon">✓</div>
            <h3>Password Reset!</h3>
            <p>Your password has been successfully updated.</p>
            <button className="submit-btn" type="button" onClick={goToLogin}>
              Go to Login
            </button>
          </div>
        )}

      </div>
    </Modal>
  );
}

export { ForgotPassword };
