import React, { useState, useContext, useEffect } from 'react';
import { ModalContext } from '../context/ModalContext';
import { ExpensesContext } from '../context/ExpensesContext';
import CurrencyInput from 'react-currency-input-field';
import '../styles/PriceChangeModal.scss';

export default function PriceChangeModal() {
    const modalContext = useContext(ModalContext);
    const expensesContext = useContext(ExpensesContext);
    
    const [mode, setMode] = useState('from_date'); // 'all' or 'from_date'
    const [newPrice, setNewPrice] = useState('');
    const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const expense = modalContext.selectedExpenseForPriceChange;
    const isIncome = modalContext.priceChangeType === 'income';

    useEffect(() => {
        if (modalContext.isModalPriceChangeOpen && expense) {
            setMode('from_date');
            const currentPrice = isIncome ? expense.amount : expense.price;
            setNewPrice(String(currentPrice).replace(',', '.'));
            setEffectiveDate(new Date().toISOString().split('T')[0]);
            setNote('');
        }
    }, [modalContext.isModalPriceChangeOpen, expense, isIncome]);

    const handleSubmit = async () => {
        if (!expense) {
            alert('No expense selected!');
            return;
        }

        if (!newPrice || parseFloat(newPrice) <= 0) {
            alert('Please enter a valid price.');
            return;
        }

        setIsSubmitting(true);

        try {
            if (mode === 'all') {
                // Change the base price for all periods
                if (isIncome) {
                    await expensesContext.applyIncomeAmountDirect(expense.id, 'amount', newPrice);
                } else {
                    await expensesContext.applyChanges(expense.id, 'price', newPrice);
                }
            } else {
                // Create a price change from a specific date
                if (isIncome) {
                    await expensesContext.createIncomeAmountChange(expense.id, newPrice, effectiveDate, note);
                } else {
                    await expensesContext.createExpensePriceChange(expense.id, newPrice, effectiveDate, note);
                }
            }
            handleClose();
        } catch (error) {
            console.error('Error saving price change:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        modalContext.setIsModalPriceChangeOpen(false);
        modalContext.setSelectedExpenseForPriceChange(null);
        modalContext.setPriceChangeType(null);
    };

    if (!modalContext.isModalPriceChangeOpen || !expense) return null;

    const currentPrice = isIncome ? expense.amount : expense.price;
    const label = isIncome ? 'amount' : 'price';

    return (
        <div className="modal-overlay price-change-overlay" onClick={handleClose}>
            <div className="modal-content price-change-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <i className="material-icons">euro</i>
                        {isIncome ? 'Change Income Amount' : 'Change Expense Price'}
                    </h2>
                    <button className="close-btn" onClick={handleClose}>
                        <i className="material-icons">close</i>
                    </button>
                </div>
                
                <div className="modal-body">
                    <div className="current-info">
                        <span className="info-label">Current {label}:</span>
                        <span className="info-value">€ {currentPrice}</span>
                        <span className="info-name">{expense.name}</span>
                    </div>

                    <div className="mode-selector">
                        <button 
                            className={`mode-btn ${mode === 'all' ? 'active' : ''}`}
                            onClick={() => setMode('all')}
                        >
                            <i className="material-icons">swap_vert</i>
                            <div>
                                <span className="mode-title">Change for all</span>
                                <span className="mode-desc">Update the base {label}</span>
                            </div>
                        </button>
                        <button 
                            className={`mode-btn ${mode === 'from_date' ? 'active' : ''}`}
                            onClick={() => setMode('from_date')}
                        >
                            <i className="material-icons">event</i>
                            <div>
                                <span className="mode-title">Change from date</span>
                                <span className="mode-desc">New {label} starting from a specific date</span>
                            </div>
                        </button>
                    </div>

                    <div className="form-group">
                        <label>New {label}</label>
                        <CurrencyInput
                            className="price-input"
                            prefix="€ "
                            decimalsLimit={2}
                            decimalSeparator=","
                            groupSeparator="."
                            placeholder="0,00"
                            value={newPrice}
                            onValueChange={value => setNewPrice(value || '')}
                        />
                    </div>

                    {mode === 'from_date' && (
                        <>
                            <div className="form-group">
                                <label>Effective from</label>
                                <input 
                                    type="date" 
                                    className="date-input"
                                    value={effectiveDate}
                                    onChange={(e) => setEffectiveDate(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Note (optional)</label>
                                <input 
                                    type="text" 
                                    className="note-input"
                                    placeholder="e.g. Rent increase, salary raise..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {/* Show existing price changes */}
                    {expense.price_changes && expense.price_changes.length > 0 && (
                        <div className="existing-changes">
                            <h4>
                                <i className="material-icons">history</i>
                                Price History
                            </h4>
                            <ul>
                                {expense.price_changes.map((change) => (
                                    <li key={change.id}>
                                        <span className="change-price">€ {change.new_price}</span>
                                        <span className="change-date">from {change.effective_date}</span>
                                        {change.note && <span className="change-note">{change.note}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {expense.amount_changes && expense.amount_changes.length > 0 && (
                        <div className="existing-changes">
                            <h4>
                                <i className="material-icons">history</i>
                                Amount History
                            </h4>
                            <ul>
                                {expense.amount_changes.map((change) => (
                                    <li key={change.id}>
                                        <span className="change-price">€ {change.new_amount}</span>
                                        <span className="change-date">from {change.effective_date}</span>
                                        {change.note && <span className="change-note">{change.note}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={handleClose}>
                        Cancel
                    </button>
                    <button 
                        className="save-btn" 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !newPrice}
                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
