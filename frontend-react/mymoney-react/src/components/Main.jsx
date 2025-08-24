import React, {useState, useEffect, useMemo, useContext } from "react"
import  '../styles/Main.scss'
import { Filter } from "./Filter";
// import { User } from "./users/User";
import  Description  from "./description/Description";
import { Expenses } from "./Expenses";
import { Diagram } from "./Diagram";
// import {FilterContext} from '../context/FilterContext'
// import {ExpensesContext} from '../context/ExpensesContext'
import {AuthContext} from '../context/AuthContext'
import {DescriptionContext} from '../context/DescriptionContext'
import {ModalContext} from '../context/ModalContext'
import { Registration } from './users/Registration'
import { Login } from './users/Login'
import { FilterContext } from "../context/FilterContext";


function Main() {

    const [isModalLoginOpen, setModalLoginIsOpen] = useState(false);
    const [isModalRegistrationOpen, setModalRegistrationIsOpen] = useState(false);
    const [registrationUsername, setRegistrationUsername] = useState('');


    const modalProviderValues = {
        isModalLoginOpen,     
        isModalRegistrationOpen,
        registrationUsername,
        setModalLoginIsOpen,
        setModalRegistrationIsOpen,
        setRegistrationUsername,
      };


    const authProviderValues = useContext(AuthContext)
    const descriptionProviderValues = useContext(DescriptionContext)
    const filterProviderValues = useContext(FilterContext)


    return  <main>
                <h1>Budget Tracker </h1>
                <FilterContext value={filterProviderValues}>
                    <Filter />
                    <Expenses />
                </FilterContext>
                
                {authProviderValues.isLoggedIn && 
                    <Diagram />
                }

                {descriptionProviderValues.isDescriptionShown && descriptionProviderValues.currentDescriptionId &&
                    <Description id={descriptionProviderValues.currentDescriptionId}/>
                }

                <ModalContext value={modalProviderValues}>
                    <Login />
                    <Registration />
                </ModalContext>
                       
            </main>
}

export {Main}