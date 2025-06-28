import React, {useState, useEffect, useMemo, useContext } from "react"
import  '../styles/Main.scss'
import { Filter } from "./Filter";
import { User } from "./users/User";
import  Description  from "./description/Description";
import { Expenses } from "./Expenses";
import { Diagram } from "./Diagram";
import {FilterContext} from '../context/FilterContext'
import {ExpensesContext} from '../context/ExpensesContext'
import {AuthContext} from '../context/AuthContext'
import {DescriptionContext} from '../context/DescriptionContext'


function Main() {
    const expensesProviderValues = useContext(ExpensesContext)
    const authProviderValues = useContext(AuthContext)
    const filterProviderValues = useContext(FilterContext)
    const descriptionProviderValues = useContext(DescriptionContext)

    return  <main>
            <h1>Budget Tracker </h1>
                <Filter />
                <Expenses />

                {authProviderValues.isLoggedIn && 
                    <Diagram />
                }

                {descriptionProviderValues.isDescriptionShown && descriptionProviderValues.currentDescriptionId &&
                    <Description id={descriptionProviderValues.currentDescriptionId}/>
                }
                <User />
            </main>
}

export {Main}