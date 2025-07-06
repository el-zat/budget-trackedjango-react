import React, { useContext, useState, useEffect } from "react"
import '../../styles/Login.scss'
import Modal from '../Modal';
import {AuthContext} from '../../context/AuthContext'
import { ModalContext } from "../../context/ModalContext";
import { FaEye, FaEyeSlash } from 'react-icons/fa';


function Login() {

  const [loginUsername, setLoginUsername] = useState(localStorage.getItem('loginUsername') || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignupMessageShown, setSignupMessageShown] = useState(true);

  const authProviderValues = useContext(AuthContext)
  const modalProviderValues = useContext(ModalContext);


  const handleLogin = async (e) => {
      // console.log('handleLogin called', loginUsername, loginEmail, loginPassword);
      e.preventDefault();
      setMessage('');
      try {
          const response = await fetch('http://127.0.0.1:8000/api/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: loginEmail,
              password: loginPassword,
            }),
          });
    
        if (response.ok) {
          const data = await response.json(); // Get username from response
          setMessage('Login successful!');
          setSignupMessageShown(false);
          setLoginUsername(data.username);
          setTimeout(() => {
            authProviderValues.setIsLoggedIn(true);
            
            modalProviderValues.setModalLoginIsOpen(false);     
            localStorage.setItem('isLoggedIn', 'true');
            setMessage(''); 
          
          }, 1500); // wait 1.5 sec and thean close the modal
  
        } else { // User not found
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
                  }}
                >
                  Sign up?
                </span>
              </>
            );
          } else {
            setMessage('Login failed!');
          }
        }
      } catch (error) {
        setMessage('Server error: ' + error.message);
      }
  };

  useEffect(() => {
    console.log('isLoggedIn changed:', authProviderValues.isLoggedIn);
  }, [authProviderValues.isLoggedIn]);


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
  }, [authProviderValues]);


  return  <React.Fragment>
              <Modal isOpen={modalProviderValues.isModalLoginOpen} onClose={() => 
                      modalProviderValues.setModalLoginIsOpen(false)}>
                  <div className="container d-flex justify-content-center" >
                      <div className="login-container">
                          <h2 >Sign in</h2>
                          <form onSubmit={handleLogin}
                              >                               
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
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    value={loginPassword}
                                    id="password"
                                    name="password"
                                    placeholder="Input password" 
                                    required                                      
                                    onChange={e => setLoginPassword(e.target.value)}
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
                          {message && (
                            <div className="login-message"> 
                              {message}
                            </div>
                          )}
                          {isSignupMessageShown &&
                            <p className="mt-3 text-center" >
                              No account?  
                              <a href="#" style={{ color: '#000', marginLeft: '10px' }}
                                  onClick={e => {
                                      e.preventDefault();
                                      modalProviderValues.setModalLoginIsOpen(false); 
                                      modalProviderValues.setModalRegistrationIsOpen(true); 
                                  }}
                              > 
                              Sign up</a>
                            </p>
                          }
                          
                      </div>
                  </div>
              </Modal>
              
              {!authProviderValues.isLoggedIn && !authProviderValues.isLoginFormShow &&
                                
                <div className="loggedout">
                  <button className="login-btn"
                  onClick={() => {
                    setSignupMessageShown(true);
                    modalProviderValues.setModalLoginIsOpen(true);
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
                    <span>{loginUsername}</span>
                </div> 
                <button className="logout-btn"
                  onClick={() => {handleLogout()}}>
                    Logout
                </button>                                                         
              </div>                    
              }

          </React.Fragment>
       
}

export {Login}