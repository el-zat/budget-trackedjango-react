import React, { useContext, useState, useEffect } from "react"
import './Login.css'
import { LoginContext } from "../LoginContext";
import Modal from './Modal';
import {AuthContext} from './AuthContext'


function Login() {

    const loginProviderValues = useContext(LoginContext)

    const authProviderValues = useContext(AuthContext);


    const [yourName, setYourName] = useState(() => localStorage.getItem('yourName') || '');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isModalOpen, setModalIsOpen] = useState(false);


    const handleSubmit = (e) => {
        e.preventDefault();
        loginProviderValues.handleLoginAccount(email, password, yourName);
      };
   
    
    const handleLogin = () => {
        authProviderValues.setIsLoggedIn(true);
        setModalIsOpen(false);     
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('yourName', yourName);
    }

    const handleLogout = () => {
        authProviderValues.setIsLoggedIn(false);
        authProviderValues.emptyTable(); 
        localStorage.setItem('isLoggedIn', 'false');
    }

    // Restore the state when loading the page
    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn');
        if (loggedIn === 'true') {
            authProviderValues.setIsLoggedIn(true);
            setYourName(yourName);
        }
        else  {
            authProviderValues.setIsLoggedIn(false);
        }
    }, []);
    

    return  <React.Fragment>
                {!loginProviderValues.isLoggedIn && !loginProviderValues.isLoginFormShow &&
                    <div className="login">               
                        <button onClick={() => setModalIsOpen(true)}>Login</button>
                    </div>
                }
                {loginProviderValues.isLoggedIn && 
                <div className="loggedin">
                    <div className="greeting">
                        <i className="material-icons">perm_identity</i>               
                        <span>{yourName}</span>
                    </div>
                    <div className="logout">               
                        <button onClick={() => {handleLogout()}}>
                            Logout
                        </button>
                    </div>
                </div>                    
                }

                <Modal isOpen={isModalOpen} onClose={() => setModalIsOpen(false)}>
                    <div className="container d-flex justify-content-center" >
                        <div className="login-container">
                            <h2 style = {{color: 'black', textAlign : 'center'}}>Sign in</h2>
                            <form onSubmit={handleSubmit} 
                                    style={{ display: 'flex', flexDirection: 'column', gap:'15px' }}
                            >                                   
                                <div className="form-group">
                                    <label htmlFor="email">E-mail</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        placeholder="Input e-mail" required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
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
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="your_name">What is your name?</label>
                                    <input
                                        type="text"
                                        id="your_name"
                                        name="your_name"
                                        placeholder="Input your name" required
                                        className="form-control"
                                        value={yourName}
                                        onChange={e => {
                                            setYourName(e.target.value);
                                            localStorage.setItem('yourName', e.target.value);
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop:'30px' }}>
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-block"
                                        style={{ fontSize: '15px', padding: '5px 15px' }}
                                        onClick={() => {handleLogin()}}
                                    >
                                        Login
                                    </button>
                                </div>
                                
                            </form>
                            <p className="mt-3 text-center" style={{ color: '#000' }}>
                                No account? <a href="register.html"> Sign up</a>
                            </p>
                        </div>
                    </div>
                </Modal>

            </React.Fragment>
       
}

export {Login}