import React, { useState, useContext, useEffect } from 'react';
import { ModalContext } from '../context/ModalContext';
import { ExpensesContext } from '../context/ExpensesContext';
import '../styles/RecurringExpenseModal.scss';

export default function RecurringExpenseModal() {
    const modalContext = useContext(ModalContext);
    const expensesContext = useContext(ExpensesContext);
    
    const [frequency, setFrequency] = useState('monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (modalContext.isModalRecurringOpen) {
            setFrequency('monthly');
            setStartDate(new Date().toISOString().split('T')[0]);
        }
    }, [modalContext.isModalRecurringOpen]);

    const handleSubmit = async () => {
        if (!modalContext.selectedExpenseForRecurring) {
            alert('No expense selected!');
            return;
        }

        await expensesContext.createRecurringExpense(
            modalContext.selectedExpenseForRecurring,
            frequency,
            startDate
        );

        modalContext.setIsModalRecurringOpen(false);
        modalContext.setSelectedExpenseForRecurring(null);
    };

    const handleClose = () => {
        modalContext.setIsModalRecurringOpen(false);
        modalContext.setSelectedExpenseForRecurring(null);
    };

    if (!modalContext.isModalRecurringOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content recurring-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Make Expense Recurring</h2>
                    <button className="close-btn" onClick={handleClose}>
                        <i className="material-icons">close</i>
                    </button>
                </div>
                
                <div className="modal-body">
                    <div className="form-group">
                        <label>Frequency</label>
                        <select 
                            value={frequency} 
                            onChange={(e) => setFrequency(e.target.value)}
                            className="frequency-select"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Start Date</label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="date-input"
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={handleClose}>
                        Cancel
                    </button>
                    <button className="save-btn" onClick={handleSubmit}>
                        Create Recurring
                    </button>
                </div>
            </div>
        </div>
    );
}
