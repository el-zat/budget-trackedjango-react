import React, {useState, useEffect, useMemo, useContext } from "react"
import  '../styles/Main.scss'
import { Filter } from "./Filter";
import  Description  from "./description/Description";
import { Expenses } from "./Expenses";
import { Diagram } from "./Diagram";
import {AuthContext} from '../context/AuthContext'
import {DescriptionContext} from '../context/DescriptionContext'
import {ModalContext} from '../context/ModalContext'
import { Registration } from './users/Registration'
import { Login } from './users/Login'
import { Sort } from "./Sort"
import { FilterContext } from "../context/FilterContext";
import { SortContext } from "../context/SortContext";


function Main() {

    const [isModalLoginOpen, setModalLoginIsOpen] = useState(false);
    const [isModalRegistrationOpen, setModalRegistrationIsOpen] = useState(false);
    const [registrationUsername, setRegistrationUsername] = useState('');
    const [isModalSortOpen, setIsModalSortOpen] = useState(false); 


    const modalProviderValues = {
        isModalLoginOpen,     
        isModalRegistrationOpen,
        registrationUsername,
        isModalSortOpen, 
        setIsModalSortOpen,
        setModalLoginIsOpen,
        setModalRegistrationIsOpen,
        setRegistrationUsername,
      };


    const authProviderValues = useContext(AuthContext)
    const descriptionProviderValues = useContext(DescriptionContext)
    const filterProviderValues = useContext(FilterContext)
    const sortProviderValues = useContext(SortContext)


    return  <main>
                <h1>Budget Tracker </h1>
                <FilterContext.Provider value={filterProviderValues}>
                    <Filter />
                    <ModalContext.Provider value={modalProviderValues}>
                        <SortContext.Provider value={sortProviderValues}>
                            <Expenses />
                        </SortContext.Provider>  
                    </ModalContext.Provider>                                    
                </FilterContext.Provider>
                
                {authProviderValues.isLoggedIn && 
                    <Diagram />
                }

                {descriptionProviderValues.isDescriptionShown && descriptionProviderValues.currentDescriptionId &&
                    <Description id={descriptionProviderValues.currentDescriptionId}/>
                }

                <ModalContext.Provider value={modalProviderValues}>
                    <FilterContext.Provider value={filterProviderValues}>
                        <AuthContext.Provider value={authProviderValues}>
                            <Login />
                            <Registration />
                        </AuthContext.Provider>                        
                        <Sort />
                    </FilterContext.Provider>
                </ModalContext.Provider>
                       
            </main>
}

export {Main}