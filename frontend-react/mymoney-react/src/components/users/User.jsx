import React, { useState } from 'react'
import { Registration } from './Registration'
import { Login } from './Login'
import {ModalContext} from './ModalContext'


function User() {

    const [isModalLoginOpen, setModalLoginIsOpen] = useState(false);

    const [isModalRegistrationOpen, setModalRegistrationIsOpen] = useState(false);

    const modalProviderValues = {
        isModalLoginOpen,
        setModalLoginIsOpen,
        isModalRegistrationOpen,
        setModalRegistrationIsOpen,
      };


    return  <React.Fragment>
                <ModalContext.Provider value={modalProviderValues}>
                    <Login />
                    <Registration />
                </ModalContext.Provider>                            
            </React.Fragment>
}

export {User}
   
            