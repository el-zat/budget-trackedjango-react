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
import { CustomDateModal } from './CustomDateModal'
import { FilterContext } from "../context/FilterContext";
import { ExpensesContext } from "../context/ExpensesContext";
import incomeIcon from '../assets/icons/income-icon.svg';
import expensesIcon from '../assets/icons/expenses-icon.svg';
import balanceIcon from '../assets/icons/balance-icon.svg';


function Main() {


    const authProviderValues = useContext(AuthContext)
    const descriptionProviderValues = useContext(DescriptionContext)
    const filterProviderValues = useContext(FilterContext)
    const modalProviderValues = useContext(ModalContext)
    const expensesProviderValues = useContext(ExpensesContext)

    // Income data - will be fetched from backend in the future
    const [incomeData, setIncomeData] = useState([]);
    // Example: [{ amount: 5000, date: '2026-01-15' }, { amount: 3000, date: '2026-02-10' }]

    // Future: Fetch income data from backend when user logs in
    // useEffect(() => {
    //     if (authProviderValues.isLoggedIn) {
    //         fetch('/api/income/', {
    //             headers: getAuthHeaders(),
    //         })
    //         .then(res => res.json())
    //         .then(data => setIncomeData(data))
    //         .catch(console.error);
    //     } else {
    //         setIncomeData([]);
    //     }
    // }, [authProviderValues.isLoggedIn]);

    // Calculate income for current month only (for stat cards)
    const calculateMonthlyIncome = () => {
        if (!authProviderValues.isLoggedIn || incomeData.length === 0) {
            return 0;
        }

        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        return incomeData.reduce((total, income) => {
            const incomeDate = new Date(income.date);
            const includeIncome = incomeDate >= firstDayOfMonth && incomeDate <= today;
            return includeIncome ? total + Number(income.amount) : total;
        }, 0);
    };

    // Calculate stats for current month only
    const monthlyExpenses = expensesProviderValues.monthlyTotalPrice ? expensesProviderValues.monthlyTotalPrice() : 0;
    const monthlyIncome = calculateMonthlyIncome();
    const currentBalance = monthlyIncome - monthlyExpenses;

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
                                <img src={incomeIcon} alt="Income" />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Total Income</div>
                                <div className="stat-value">€ {monthlyIncome.toFixed(2)}</div>
                                <div className="stat-period">{filterProviderValues.currentMonth}</div>
                            </div>
                        </div>
                        
                        <div className="stat-card total-expenses">
                            <div className="stat-icon">
                                <img src={expensesIcon} alt="Expenses" />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Total Expenses</div>
                                <div className="stat-value">€ {monthlyExpenses.toFixed(2)}</div>
                                <div className="stat-period">{filterProviderValues.currentMonth}</div>
                            </div>
                        </div>
                        
                        <div className="stat-card balance">
                            <div className="stat-icon">
                                <img src={balanceIcon} alt="Balance" />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Current Balance</div>
                                <div className={`stat-value ${currentBalance >= 0 ? 'positive' : 'negative'}`}>
                                    € {currentBalance.toFixed(2)}
                                </div>
                                <div className="stat-period">{filterProviderValues.currentMonth}</div>
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

                <ModalContext.Provider value={modalProviderValues}>
                    <FilterContext.Provider value={filterProviderValues}>
                        <CustomDateModal />
                    </FilterContext.Provider>
                </ModalContext.Provider>
                       
            </main>
}

export {Main}