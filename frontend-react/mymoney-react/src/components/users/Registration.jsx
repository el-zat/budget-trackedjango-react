import React, { useContext, useState } from "react"
import './Registration.css' 
import Modal from './Modal';
import {ModalContext} from './ModalContext'


function Registration() {

  const [registrationPassword1, setRegistrationPassword1] = useState('');
  const [registrationPassword2, setRegistrationPassword2] = useState('');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [registrationFirstName, setRegistrationFirstName] = useState('');
  const [registrationLastName, setRegistrationLastName] = useState('');

  const [message, setMessage] = useState('');


  const modalProviderValues = useContext(ModalContext);

  const handleRegistration = async (e) => {
    e.preventDefault();
    console.log(modalProviderValues.isModalRegistrationOpen)
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/registration/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username : modalProviderValues.registrationUsername,
          password1: registrationPassword1,
          password2: registrationPassword2,
          email: registrationEmail,
          first_name: registrationFirstName,
          last_name: registrationLastName,
          
        }),
      });

      if (response.ok) {
        setMessage('Account sussefully created! You can sing in.');
        modalProviderValues.setRegistrationUsername('');
        setRegistrationPassword1('');
        setRegistrationPassword2('');
        setRegistrationEmail('');
        setRegistrationFirstName('');
        setRegistrationLastName('');
        modalProviderValues.setModalRegistrationIsOpen(false) // Close modal window after susessful registration
        
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
                  value={modalProviderValues.registrationUsername}
                  onChange={e => modalProviderValues.setRegistrationUsername(e.target.value)}
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
              <button type="submit">Create account</button>
              {message && <div style={{ marginTop: 10 }}>{message}</div>}
            </form>
          </Modal>

        </React.Fragment> 
}

export  {Registration}