import React, { useContext, useState } from "react"
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


  const modalProviderValues = useContext(ModalContext);
  const authProviderValues = useContext(AuthContext)


  const handleRegistration = async (e) => {
    e.preventDefault();


    try {
      const response = await fetch('/api/registration/', {
        method: 'POST',
        headers: authProviderValues.getAuthHeaders(),
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
        setMessage('Account successfully created! You can sign in.');
        authProviderValues.setRegistrationUsername('');
        setRegistrationPassword1('');
        setRegistrationPassword2('');
        setRegistrationEmail('');
        setRegistrationFirstName('');
        setRegistrationLastName('');
        modalProviderValues.setIsModalRegistrationOpen(false);
      } else {
        const data = await response.json();
        setMessage('Error: ' + (data.detail || JSON.stringify(data)));
      }
    } catch (error) {
      setMessage('Server error: ' + error.message);
    }
  };


  return  <React.Fragment>
          <Modal isOpen={modalProviderValues.isModalRegistrationOpen} 
                 onClose={() => modalProviderValues.setIsModalRegistrationOpen(false)}>
                  <div className="registration-container">
                    <h2>Registration</h2>
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
                      {message && <div style={{ marginTop: 10 }}>{message}</div>}
                    </form>

                  </div>
          
          </Modal>

        </React.Fragment> 
}

export  {Registration}