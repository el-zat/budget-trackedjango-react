import React, { useContext, useState, useEffect } from "react"
import './Login.css'
import Modal from './Modal';
import {AuthContext} from './AuthContext'
import { ModalContext } from "./ModalContext";


function Login() {

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [message, setMessage] = useState('');

  const authProviderValues = useContext(AuthContext)
  const modalProviderValues = useContext(ModalContext);


  const handleLogin = async (e) => {
      console.log('handleLogin called', loginUsername, loginEmail, loginPassword);
      e.preventDefault();
      setMessage('');
      try {
          const response = await fetch('http://127.0.0.1:8000/api/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: loginUsername,
              email: loginEmail,
              password: loginPassword,
            }),
          });
    
        if (response.ok) {

          setMessage('Login successful!');
          authProviderValues.setIsLoggedIn(true);
          modalProviderValues.setModalLoginIsOpen(false);     
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('loginUsername', loginUsername)
  
        } else {
          alert('User not found')
          const data = await response.json();
          if (
            data.detail &&
            (data.detail.includes('not found') || data.detail.includes('User not found'))
          ) {
            setMessage(
              <>
                User not found.{' '}
                <span
                  style={{ color: 'blue', cursor: 'pointer' }}
                  onClick={() => {
                    modalProviderValues.setModalLoginIsOpen(false);
                    modalProviderValues.setModalRegistrationIsOpen(true);
                    modalProviderValues.setRegistrationUsername(loginUsername); 
                  }}
                >
                  Sign up?
                </span>
              </>
            );
          } else {
            setMessage('Login failed: ' + (data.detail || JSON.stringify(data)));
          }
        }
      } catch (error) {
        setMessage('Server error: ' + error.message);
      }
  };


  const handleLogout = () => {
      authProviderValues.setIsLoggedIn(false);
      authProviderValues.emptyTable(); 
      localStorage.setItem('isLoggedIn', 'false');
  }

  // Restore the state when loading the page
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    const storedUsername = localStorage.getItem('loginUsername'); // Get username from localStorage
    if (loggedIn === 'true' && storedUsername) {
        authProviderValues.setIsLoggedIn(true);
        setLoginUsername(storedUsername); // Set username from localStorage
    } else {
        authProviderValues.setIsLoggedIn(false);
        setLoginUsername('');
    }
  }, []);


  return  <React.Fragment>
              <Modal isOpen={modalProviderValues.isModalLoginOpen} onClose={() => 
                      modalProviderValues.setModalLoginIsOpen(false)}>
                  <div className="container d-flex justify-content-center" >
                      <div className="login-container">
                          <h2 style = {{color: 'black', textAlign : 'center'}}>Sign in</h2>
                          <form onSubmit={handleLogin}
                                  style={{ display: 'flex', flexDirection: 'column', gap:'15px' }}
                              >                               
                              <div>
                                  <label>Username:</label>
                                  <input
                                      type="text"
                                      value={loginUsername}
                                      onChange={e => setLoginUsername(e.target.value)}
                                      required
                                  />
                              </div>
                              <div>
                                  <label>Email:</label>
                                  <input
                                      type="email"
                                      value={loginEmail}
                                      onChange={e => setLoginEmail(e.target.value)}
                                      required
                                  />
                              </div>
                              <div className="form-group">
                                  <label htmlFor="password">Password</label>
                                  <input
                                      type="password"
                                      className="form-control"
                                      id="password"
                                      name="password"
                                      placeholder="Input password" required
                                      value={loginPassword}
                                      onChange={e => setLoginPassword(e.target.value)}
                                  />
                              </div>                               
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop:'30px' }}>
                                  <button
                                      type="submit"
                                      className="btn btn-primary btn-block"
                                      style={{ fontSize: '15px', padding: '5px 15px' }}
                                  >
                                      Login
                                  </button>
                              </div>
                              
                          </form>
                          <p className="mt-3 text-center" style={{ color: '#000' }}>
                              No account? 
                              <a href="#"
                                  onClick={e => {
                                      e.preventDefault();
                                      modalProviderValues.setModalLoginIsOpen(false); 
                                      modalProviderValues.setModalRegistrationIsOpen(true); 
                                  }}
                              > 
                              Sign up</a>
                          </p>
                      </div>
                  </div>
              </Modal>
              
              {!authProviderValues.isLoggedIn && !authProviderValues.isLoginFormShow &&
                  <div className="login">               
                      <button onClick={() => modalProviderValues.setModalLoginIsOpen(true)}>Login</button>
                  </div>
              }
              {authProviderValues.isLoggedIn && 
              <div className="loggedin">
                  <div className="greeting">
                      <i className="material-icons">perm_identity</i>               
                      <span>{loginUsername}</span>
                  </div>
                  <div className="logout">               
                      <button onClick={() => {handleLogout()}}>
                          Logout
                      </button>
                  </div>
              </div>                    
              }

          </React.Fragment>
       
}

export {Login}