import React, { useContext, useState, useEffect } from "react"
import '../../styles/Login.scss'
import Modal from '../Modal';
import {AuthContext} from '../../context/AuthContext'
import { ModalContext } from "../../context/ModalContext";
import { FilterContext } from "../../context/FilterContext";
import { FaEye, FaEyeSlash } from 'react-icons/fa';


function Login() {

  const [showPassword, setShowPassword] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const authProviderValues = useContext(AuthContext)
  const modalProviderValues = useContext(ModalContext);
  const filterProviderValues = useContext(FilterContext);


  const emptyTable = () => {
    filterProviderValues.setFilteredRows([]); 
}

  const handleLogout = () => {
    filterProviderValues.setIsFilterOpen(false);
    emptyTable();
    authProviderValues.setIsLoggedIn(false);
    localStorage.setItem('isLoggedIn', 'false');
  };


  return  <React.Fragment>
              <Modal isOpen={modalProviderValues.isModalLoginOpen} onClose={() => 
                      modalProviderValues.setIsModalLoginOpen(false)}>
                      <div className="login-container">
                          <h2 >Sign in</h2>
                          <form onSubmit={authProviderValues.handleLogin} >                               
                              <div className="form-group"> 
                              <label htmlFor="username">Username/e-mail:</label>
                              <input 
                                type="text"
                                value={authProviderValues.loginValue}
                                onChange={e => authProviderValues.setLoginValue(e.target.value)}
                                required
                              />
                              </div>
                              <div className="form-group">
                                  <label htmlFor="password">Password:</label>
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    value={authProviderValues.loginPassword}
                                    id="password"
                                    name="password"
                                    placeholder="Input password" 
                                    required                                      
                                    onChange={e => authProviderValues.setLoginPassword(e.target.value)}
                                  />
                                  <button
                                    type="button"
                                    className="show-password-btn"
                                    onClick={() => setShowPassword(s => !s)}
                                    tabIndex={-1}
                                  >
                                    {showPassword ? <FaEyeSlash color="#fff"/> : <FaEye color="#fff"/>}
                                  </button>
                              </div>                               
                              <div>
                                  <button
                                      type="submit"
                                      className="submit-login"                                      
                                  >
                                      Login
                                  </button>
                              </div>
                              
                          </form>
                          {authProviderValues.message && (
                            <div className={`login-message ${authProviderValues.loginSuccess ? 'login-message--success' : ''}`}> 
                              {authProviderValues.message}
                            </div>
                          )}
                          {authProviderValues.unverifiedEmail && (
                            <div className="resend-verification-block">
                              <button 
                                type="button" 
                                className="resend-verification-btn"
                                onClick={async () => {
                                  setResendMessage('');
                                  try {
                                    const resp = await fetch('/api/resend-verification/', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ email: authProviderValues.unverifiedEmail }),
                                    });
                                    const data = await resp.json();
                                    if (resp.ok) {
                                      setResendMessage('Verification email sent! Check your inbox.');
                                    } else {
                                      setResendMessage(data.error || 'Failed to resend.');
                                    }
                                  } catch (err) {
                                    setResendMessage('Server error.');
                                  }
                                }}
                              >
                                Resend verification email
                              </button>
                              {resendMessage && <p className="resend-msg">{resendMessage}</p>}
                            </div>
                          )}
                          <p className="forgot-password-link">
                              <a href="#" onClick={e => {
                                  e.preventDefault();
                                  modalProviderValues.setIsModalLoginOpen(false);
                                  modalProviderValues.setIsModalForgotPasswordOpen(true);
                              }}>
                                Forgot password?
                              </a>
                          </p>
                          {/* {authProviderValues.isSignupMessageShown && */}
                            <p className="mt-3 text-center" >
                              No account?  
                              <a href="#" style={{ color: '#5865f2', marginLeft: '10px' }}
                                  onClick={e => {
                                      e.preventDefault();
                                      modalProviderValues.setIsModalLoginOpen(false); 
                                      modalProviderValues.setIsModalRegistrationOpen(true); 
                                  }}
                              > 
                              Sign up</a>
                            </p>
                          {/* } */}
                          
                      </div>
              </Modal>
              
              {!authProviderValues.isLoggedIn && !authProviderValues.isLoginFormShow &&
                                
                <div className="loggedout">
                  <button className="login-btn"
                  onClick={() => {                    
                    modalProviderValues.setIsModalLoginOpen(true);
                    authProviderValues.setIsSignupMessageShown(true);
                  }}
                  >
                    Login
                  </button> 
                </div>         
              }
              {authProviderValues.isLoggedIn && 
              <div className="loggedin">                
                <div className="greeting">
                    <i className="material-icons">perm_identity</i>               
                    <span>{authProviderValues.loginUsername}</span>
                </div> 
                <button className="logout-btn"
                  onClick={() => {handleLogout()}}>
                    <i className="material-icons">logout</i>
                    <span>Logout</span>
                </button>                                                         
              </div>                    
              }

          </React.Fragment>
       
}

export {Login}