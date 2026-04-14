import React, {useState, useEffect, useMemo, useContext } from "react"
import  '../styles/Main.scss'
import { Filter } from "./Filter";
import  Description  from "./description/Description";
import { Expenses } from "./Expenses";
import  Income  from "./Income";
import { CategoriesPieChart } from "./CategoriesPieChart";
import { ExpensesPieChart } from "./ExpensesPieChart";
import {AuthContext} from '../context/AuthContext'
import {DescriptionContext} from '../context/DescriptionContext'
import {ModalContext} from '../context/ModalContext'
import { Registration } from './users/Registration'
import { Login } from './users/Login'
import { CustomDateModal } from './CustomDateModal'
import { FilterContext } from "../context/FilterContext";
import { ExpensesContext } from "../context/ExpensesContext";
import { IncomeContext } from "../context/IncomeContext";
import IntervalSelector from './IntervalSelector';
import incomeIcon from '../assets/icons/income-icon.svg';
import expensesIcon from '../assets/icons/expenses-icon.svg';
import balanceIcon from '../assets/icons/balance-icon.svg';


function Main() {


    const authProviderValues = useContext(AuthContext)
    const descriptionProviderValues = useContext(DescriptionContext)
    const filterProviderValues = useContext(FilterContext)
    const modalProviderValues = useContext(ModalContext)
    const expensesProviderValues = useContext(ExpensesContext)
    const incomeProviderValues = useContext(IncomeContext)

    // Calculate income for selected interval from real data
    const calculateIntervalIncome = () => {
        if (!authProviderValues.isLoggedIn || !incomeProviderValues.allIncomes || incomeProviderValues.allIncomes.length === 0) {
            return 0;
        }

        const startDate = new Date(filterProviderValues.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(filterProviderValues.endDate);
        endDate.setHours(23, 59, 59, 999);

        // Sum incomes: recurring incomes are always included, one-time incomes only if in date range
        const total = incomeProviderValues.allIncomes.reduce((sum, income) => {
            // Always include recurring incomes
            if (income.is_recurring || (income.frequency && income.frequency === 'regular')) {
                return sum + Number(income.amount);
            }
            
            // For one-time incomes, check if they fall within the date range
            const incomeDate = new Date(income.received_date);
            incomeDate.setHours(0, 0, 0, 0);
            const includeIncome = incomeDate >= startDate && incomeDate <= endDate;
            
            return includeIncome ? sum + Number(income.amount) : sum;
        }, 0);

        return total;
    };

    // Get period label based on selected interval
    const getPeriodLabel = () => {
        switch (filterProviderValues.selectedInterval) {
            case 'month':
                return filterProviderValues.customLabel || filterProviderValues.currentMonth;
            case 'year':
                return filterProviderValues.customLabel || filterProviderValues.currentYear;
            case 'today':
                return filterProviderValues.todayFormatted;
            case 'all':
                return 'All Time';
            case 'custom':
                return `${filterProviderValues.formatDate(filterProviderValues.startDate)} - ${filterProviderValues.formatDate(filterProviderValues.endDate)}`;
            default:
                return filterProviderValues.currentMonth;
        }
    };

    // Calculate stats for selected interval
    const intervalExpenses = expensesProviderValues.monthlyTotalPrice ? expensesProviderValues.monthlyTotalPrice() : 0;
    const intervalIncome = calculateIntervalIncome();
    const currentBalance = intervalIncome - intervalExpenses;
    const periodLabel = getPeriodLabel();

    return  <main>
                <div className="header-section">
                    <div className="header-left">
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
                        {authProviderValues.isLoggedIn && (
                            <IntervalSelector
                                selectedInterval={filterProviderValues.selectedInterval}
                                setSelectedInterval={filterProviderValues.setSelectedInterval}
                                currentMonth={filterProviderValues.currentMonth}
                                currentYear={filterProviderValues.currentYear}
                                customLabel={filterProviderValues.customLabel}
                                setCustomLabel={filterProviderValues.setCustomLabel}
                                setDateFrom={filterProviderValues.setDateFrom}
                                setDateTo={filterProviderValues.setDateTo}
                            />
                        )}
                    </div>
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
                                <div className="stat-value">€ {intervalIncome.toFixed(2)}</div>
                                <div className="stat-period">{periodLabel}</div>
                            </div>
                        </div>
                        
                        <div className="stat-card total-expenses">
                            <div className="stat-icon">
                                <img src={expensesIcon} alt="Expenses" />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Total Expenses</div>
                                <div className="stat-value">€ {intervalExpenses.toFixed(2)}</div>
                                <div className="stat-period">{periodLabel}</div>
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
                                <div className="stat-period">{periodLabel}</div>
                            </div>
                        </div>
                    </div>
                )}

                <FilterContext.Provider value={filterProviderValues}>
                    <Filter />
                    <ModalContext.Provider value={modalProviderValues}>
                        <div className="content-container">
                            <Income />
                            <Expenses />
                        </div>
                    </ModalContext.Provider>                                    
                </FilterContext.Provider>
                
                {authProviderValues.isLoggedIn && 
                    <div className="pie-charts-container">
                        <CategoriesPieChart />
                        <ExpensesPieChart />
                    </div>
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