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
import { FilterContext } from "../context/FilterContext";


function Main() {


    const authProviderValues = useContext(AuthContext)
    const descriptionProviderValues = useContext(DescriptionContext)
    const filterProviderValues = useContext(FilterContext)
    const modalProviderValues = useContext(ModalContext)


    return  <main>
                <h1>Budget Tracker </h1>
                <FilterContext.Provider value={filterProviderValues}>
                    <Filter />
                    <ModalContext.Provider value={modalProviderValues}>
                        <Expenses />
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
                    </FilterContext.Provider>
                </ModalContext.Provider>
                       
            </main>
}

export {Main}