import React, { useState } from 'react'
import { Registration } from './Registration'
import { Login } from './Login'
import {ModalContext} from '../../context/ModalContext'


function User() {

    const [isModalLoginOpen, setModalLoginIsOpen] = useState(false);
    const [isModalRegistrationOpen, setModalRegistrationIsOpen] = useState(false);
    const [registrationUsername, setRegistrationUsername] = useState('');

    const modalProviderValues = {
        isModalLoginOpen,     
        isModalRegistrationOpen,
        registrationUsername: registrationUsername,
        setModalLoginIsOpen,
        setModalRegistrationIsOpen,
        setRegistrationUsername: setRegistrationUsername,
      };


    return  <React.Fragment>
                <ModalContext.Provider value={modalProviderValues}>
                    <Login />
                    <Registration />
                </ModalContext.Provider>                            
            </React.Fragment>
}

export {User}
   
            