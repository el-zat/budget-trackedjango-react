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
import { ExpensesContext } from "../context/ExpensesContext";


function Main() {


    const authProviderValues = useContext(AuthContext)
    const descriptionProviderValues = useContext(DescriptionContext)
    const filterProviderValues = useContext(FilterContext)
    const modalProviderValues = useContext(ModalContext)
    const expensesProviderValues = useContext(ExpensesContext)

    // Calculate stats
    const totalExpenses = expensesProviderValues.totalPrice ? expensesProviderValues.totalPrice() : 0;
    const totalIncome = 5000.00; // Placeholder for income - should be fetched from backend
    const currentBalance = totalIncome - totalExpenses;

    return  <main>
                <div className="header-section">
                    <h1>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.52 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.48 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.49 11.8 10.9Z" fill="url(#gradientLogo)"/>
                            <defs>
                                <linearGradient id="gradientLogo" x1="11.5" y1="3" x2="11.5" y2="21" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#ffd43b"/>
                                    <stop offset="1" stopColor="#fab005"/>
                                </linearGradient>
                            </defs>
                        </svg>
                        Budget Tracker
                    </h1>
                    <div className="user-actions">
                        <Login />
                    </div>
                </div>

                {authProviderValues.isLoggedIn && (
                    <div className="stats-grid">
                        <div className="stat-card income">
                            <div className="stat-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" fill="url(#gradient2)"/>
                                    <defs>
                                        <linearGradient id="gradient2" x1="12" y1="6" x2="12" y2="18" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#51cf66"/>
                                            <stop offset="1" stopColor="#37b24d"/>
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Total Income</div>
                                <div className="stat-value">€ {totalIncome.toFixed(2)}</div>
                                <div className="stat-period">{filterProviderValues.selectedInterval === "month" ? filterProviderValues.currentMonth : filterProviderValues.currentYear}</div>
                            </div>
                        </div>
                        
                        <div className="stat-card total-expenses">
                            <div className="stat-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="url(#gradient1)"/>
                                    <defs>
                                        <linearGradient id="gradient1" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#9c4fff"/>
                                            <stop offset="1" stopColor="#6c5ce7"/>
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Total Expenses</div>
                                <div className="stat-value">€ {totalExpenses.toFixed(2)}</div>
                                <div className="stat-period">{filterProviderValues.selectedInterval === "month" ? filterProviderValues.currentMonth : filterProviderValues.currentYear}</div>
                            </div>
                        </div>
                        
                        <div className="stat-card balance">
                            <div className="stat-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.52 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.48 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.49 11.8 10.9Z" fill="url(#gradient3)"/>
                                    <defs>
                                        <linearGradient id="gradient3" x1="11.5" y1="3" x2="11.5" y2="21" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#ffd43b"/>
                                            <stop offset="1" stopColor="#fab005"/>
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Current Balance</div>
                                <div className={`stat-value ${currentBalance >= 0 ? 'positive' : 'negative'}`}>
                                    € {currentBalance.toFixed(2)}
                                </div>
                                <div className="stat-period">Income - Expenses</div>
                            </div>
                        </div>
                    </div>
                )}

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
                            <Registration />
                        </AuthContext.Provider>                        
                    </FilterContext.Provider>
                </ModalContext.Provider>
                       
            </main>
}

export {Main}