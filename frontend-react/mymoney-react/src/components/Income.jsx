import React, { useContext, useState, useRef, useCallback, useEffect } from 'react';
import CurrencyInput from 'react-currency-input-field';
import { IncomeContext } from '../context/IncomeContext';
import { FilterContext } from '../context/FilterContext';
import { ModalContext } from '../context/ModalContext';
import { ExpensesContext } from '../context/ExpensesContext';
import '../styles/Income.scss';

export default function Income() {
    const incomeContext = useContext(IncomeContext);
    const filterContext = useContext(FilterContext);
    const modalContext = useContext(ModalContext);
    const expensesContext = useContext(ExpensesContext);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isFormExpanded, setIsFormExpanded] = useState(false);
    const inputRef = useRef(null);

    const handleAddIncome = () => {
        console.log('Attempting to add income:', incomeContext.newIncome);
        if (incomeContext.newIncome.name && incomeContext.newIncome.amount && incomeContext.newIncome.category) {
            incomeContext.addIncome();
        } else {
            alert('Please fill in name, amount and category');
        }
    };

    // Close editing on mouse click outside
    const closeEditing = useCallback(() => {
        incomeContext.setEditingIncomeField({ id: null, field: null });
    }, [incomeContext]);

    // Get display date for income (first day of selected period for recurring incomes)
    const getDisplayDate = (income) => {
        const isRecurring = income.is_recurring || (income.frequency && income.frequency === 'regular');
        
        if (isRecurring && filterContext.startDate) {
            // For recurring incomes, show same day of month as received_date but in current period
            const startDate = new Date(filterContext.startDate);
            const receivedDate = new Date(income.received_date);
            const dayOfMonth = receivedDate.getDate();
            
            // Create date with current period's month/year and original day
            return new Date(startDate.getFullYear(), startDate.getMonth(), dayOfMonth);
        } else {
            // For one-time incomes, show actual date
            return new Date(income.received_date);
        }
    };

    // Get effective amount for a recurring income based on current period
    const getEffectiveAmount = (income) => {
        if (!income.amount_changes || income.amount_changes.length === 0) {
            return income.amount;
        }
        
        const referenceDate = filterContext.startDate 
            ? new Date(filterContext.startDate) 
            : new Date();
        
        const applicableChange = income.amount_changes
            .filter(change => new Date(change.effective_date) <= referenceDate)
            .sort((a, b) => new Date(b.effective_date) - new Date(a.effective_date))[0];
        
        return applicableChange ? applicableChange.new_amount : income.amount;
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                closeEditing();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [closeEditing]);

    return (
        <div className="income-wrapper">
            <div className="income-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="header-left">
                    <h2>Income</h2>
                </div>
                <button className="toggle-btn" data-tooltip={isExpanded ? "Collapse" : "Expand"}>
                    <i className="material-icons">{isExpanded ? 'expand_less' : 'expand_more'}</i>
                </button>
            </div>

            {isExpanded && (
                <>
                    {/* Income list */}
                    <div className="income-list">
                        {incomeContext.incomes.length === 0 ? (
                            <div className="empty-state">
                                <i className="material-icons">account_balance_wallet</i>
                                <p>No income added yet</p>
                            </div>
                        ) : (
                            [...incomeContext.incomes]
                                .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
                                .map(income => {
                                const category = incomeContext.incomeCategories.find(cat => cat.id === income.category);
                                const categoryName = category?.display_name || category?.name || 'Unknown';
                                
                                return (
                                    <div key={income.id} className="income-card">
                                <div className="income-card-body">
                                    <div className="income-info">
                                        {/* Editable name */}
                                        {incomeContext.editingIncomeField.id === income.id && incomeContext.editingIncomeField.field === 'name' ? (
                                            <input
                                                type="text"
                                                className="edit-income-title"
                                                placeholder="Income name"
                                                ref={inputRef}
                                                value={incomeContext.editIncomeName || ''}
                                                onChange={e => incomeContext.setEditIncomeName(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        incomeContext.applyIncomeChanges(income.id, 'name');
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="income-title-container">
                                                <h3 
                                                    className="income-title editable"
                                                    onClick={() => {
                                                        incomeContext.setEditingIncomeField({ id: income.id, field: 'name' });
                                                        incomeContext.setEditIncomeName(income.name);
                                                    }}
                                                    data-tooltip="Edit name"
                                                >
                                                    {income.name}
                                                </h3>
                                                {(income.is_recurring || income.frequency === 'regular') && (
                                                    <span className="recurring-badge">
                                                        <i className="material-icons">repeat</i>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="income-meta">
                                            {/* Editable date */}
                                            {incomeContext.editingIncomeField.id === income.id && incomeContext.editingIncomeField.field === 'date' ? (
                                                <input
                                                    type="date"
                                                    className="edit-income-date"
                                                    ref={inputRef}
                                                    value={incomeContext.editIncomeDate || ''}
                                                    onChange={e => incomeContext.setEditIncomeDate(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            incomeContext.applyIncomeChanges(income.id, 'date');
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <span 
                                                    className="income-date editable"
                                                    onClick={() => {
                                                        incomeContext.setEditingIncomeField({ id: income.id, field: 'date' });
                                                        incomeContext.setEditIncomeDate(income.received_date);
                                                    }}
                                                    data-tooltip="Edit date"
                                                >
                                                    <i className="material-icons">event</i>
                                                    {getDisplayDate(income).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </span>
                                            )}
                                            
                                            {/* Editable source */}
                                            {incomeContext.editingIncomeField.id === income.id && incomeContext.editingIncomeField.field === 'source' ? (
                                                <input
                                                    type="text"
                                                    className="edit-income-source"
                                                    placeholder="Source"
                                                    ref={inputRef}
                                                    value={incomeContext.editIncomeSource || ''}
                                                    onChange={e => incomeContext.setEditIncomeSource(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            incomeContext.applyIncomeChanges(income.id, 'source');
                                                        }
                                                    }}
                                                />
                                            ) : income.source ? (
                                                <span 
                                                    className="income-source editable"
                                                    onClick={() => {
                                                        incomeContext.setEditingIncomeField({ id: income.id, field: 'source' });
                                                        incomeContext.setEditIncomeSource(income.source);
                                                    }}
                                                    data-tooltip="Edit source"
                                                >
                                                    <i className="material-icons">business</i>
                                                    {income.source}
                                                </span>
                                            ) : (
                                                <span 
                                                    className="income-source editable add-source"
                                                    onClick={() => {
                                                        incomeContext.setEditingIncomeField({ id: income.id, field: 'source' });
                                                        incomeContext.setEditIncomeSource('');
                                                    }}
                                                    data-tooltip="Add source"
                                                >
                                                    <i className="material-icons">add</i>
                                                    Add source
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="income-actions">
                                        <div className="income-amount-container">
                                            {/* Editable amount */}
                                            {incomeContext.editingIncomeField.id === income.id && incomeContext.editingIncomeField.field === 'amount' ? (
                                                <CurrencyInput
                                                    className="edit-income-amount"
                                                    placeholder="Amount"
                                                    decimalsLimit={2}
                                                    prefix="€ "
                                                    ref={inputRef}
                                                    value={incomeContext.editIncomeAmount || ''}
                                                    onValueChange={value => incomeContext.setEditIncomeAmount(value || '')}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            incomeContext.applyIncomeChanges(income.id, 'amount');
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div 
                                                    className="income-amount editable"
                                                    onClick={() => {
                                                        const isRecurring = income.is_recurring || (income.frequency && income.frequency === 'regular');
                                                        if (isRecurring) {
                                                            // For recurring incomes, open the price change modal
                                                            modalContext.setSelectedExpenseForPriceChange(income);
                                                            modalContext.setPriceChangeType('income');
                                                            modalContext.setIsModalPriceChangeOpen(true);
                                                        } else {
                                                            // For one-time incomes, use inline editing
                                                            incomeContext.setEditingIncomeField({ id: income.id, field: 'amount' });
                                                            incomeContext.setEditIncomeAmount(income.amount);
                                                        }
                                                    }}
                                                    data-tooltip="Edit amount"
                                                >
                                                    € {parseFloat(getEffectiveAmount(income)).toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <button
                                            className="delete-btn"
                                            onClick={() => incomeContext.deleteIncome(income.id)}
                                            data-tooltip="Delete income"
                                        >
                                            <i className="material-icons">delete</i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add new income form */}
            <div className="add-income-header" onClick={() => setIsFormExpanded(!isFormExpanded)}>
                <h3>Add Income</h3>
                <button className="toggle-btn" data-tooltip={isFormExpanded ? "Collapse" : "Expand"}>
                    <i className="material-icons">{isFormExpanded ? 'expand_less' : 'expand_more'}</i>
                </button>
            </div>
            
            {isFormExpanded && (
            <div className="add-income-form">
                <input
                    type="text"
                    placeholder="Income name"
                    value={incomeContext.newIncome.name || ''}
                    onChange={(e) => incomeContext.setNewIncome({ ...incomeContext.newIncome, name: e.target.value })}
                />
                <CurrencyInput
                    placeholder="Amount"
                    decimalsLimit={2}
                    prefix="€ "
                    value={incomeContext.newIncome.amount || ''}
                    onValueChange={(value) => incomeContext.setNewIncome({ ...incomeContext.newIncome, amount: value || '' })}
                />
                <input
                    type="date"
                    value={incomeContext.newIncome.received_date || ''}
                    onChange={(e) => incomeContext.setNewIncome({ ...incomeContext.newIncome, received_date: e.target.value })}
                />
                <select
                    value={incomeContext.newIncome.category || ''}
                    onChange={(e) => incomeContext.setNewIncome({ ...incomeContext.newIncome, category: e.target.value })}
                >
                    <option value="">Select category</option>
                    {incomeContext.incomeCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.display_name || cat.name}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Source (optional)"
                    value={incomeContext.newIncome.source || ''}
                    onChange={(e) => incomeContext.setNewIncome({ ...incomeContext.newIncome, source: e.target.value })}
                />
                <select
                    value={incomeContext.newIncome.frequency || 'once'}
                    onChange={(e) => incomeContext.setNewIncome({ 
                        ...incomeContext.newIncome, 
                        frequency: e.target.value,
                        is_recurring: e.target.value === 'regular'
                    })}
                >
                    <option value="once">One-time</option>
                    <option value="regular">Regular (Monthly)</option>
                </select>
                <button className="add-btn" onClick={handleAddIncome}>
                    <i className="material-icons">add</i> Add Income
                </button>
            </div>
            )}
                </>
            )}
        </div>
    );
}
