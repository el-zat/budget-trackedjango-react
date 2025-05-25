import React, { useContext, useState } from "react"
import './Registration.css' 
import Modal from './Modal';
import {ModalContext} from './ModalContext'


function Registration() {

  const [registrationUsername, setRegistrationUsername] = useState('');
  const [registrationPassword, setRegistrationPassword] = useState('');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [registrationName, setRegistrationName] = useState('');
  const [message, setMessage] = useState('');


  const modalProviderValues = useContext(ModalContext);

  const handleRegistration = async (e) => {
    e.preventDefault();
    console.log(modalProviderValues.isModalRegistrationOpen)
    // setModalRegistrationIsOpen(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/api/registration/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username : registrationUsername,
          password: registrationPassword,
          name: registrationName,
          email: registrationEmail,
        }),
      });

      if (response.ok) {
        setMessage('Account sussefully created! You can sing in.');
        setRegistrationUsername('');
        setRegistrationPassword('');
        setRegistrationName('');
        setRegistrationEmail('');
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
                 onClose={() => modalProviderValues.setModalRegistrationIsOpen(false)}>
          <form onSubmit={handleRegistration} style={{ maxWidth: 400, margin: '0 auto' }}>
              <h2>Registration</h2>
              <div>
                <label>Username:</label>
                <input
                  type="text"
                  value={registrationUsername}
                  onChange={e => setRegistrationUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Password:</label>
                <input
                  type="password"
                  value={registrationPassword}
                  onChange={e => setRegistrationPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Your name:</label>
                <input
                  type="text"
                  value={registrationName}
                  onChange={e => setRegistrationName(e.target.value)}
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
              <button type="submit">Create account</button>
              {message && <div style={{ marginTop: 10 }}>{message}</div>}
            </form>
          </Modal>

        </React.Fragment> 
}

export  {Registration}