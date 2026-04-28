import React, { useState, useContext, useEffect, useRef, useCallback} from "react"
import  '../styles/Expenses.scss'
import CurrencyInput from 'react-currency-input-field';
import { ExpensesContext } from "../context/ExpensesContext";
import { FilterContext } from "../context/FilterContext";
import { AuthContext } from "../context/AuthContext";
import { ModalContext } from "../context/ModalContext";
import { SortContext } from "../context/SortContext";
import { Sort } from "./Sort"


const Expenses = () => {

    
    const expensesProviderValues = useContext(ExpensesContext)
    const filterProviderValues = useContext(FilterContext)
    const authProviderValues = useContext(AuthContext)
    const modalProviderValues = useContext(ModalContext)

    //Sorting
    const [selectedSort, setSelectedSort] = useState([])
    
    // Collapse state for recurring expenses
    const [isRecurringCollapsed, setIsRecurringCollapsed] = useState(false)
    
    // Collapse state for one-time expenses
    const [isRegularCollapsed, setIsRegularCollapsed] = useState(false)

    // Mobile add expense form toggle
    const [isMobileAddOpen, setIsMobileAddOpen] = useState(false)

    // Check if screen is mobile/tablet
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Format date as DD-MM-YYYY
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Get display date for expense (first day of selected period for recurring expenses)
    const getDisplayDate = (expense) => {
        const isRecurring = (expense.frequency && expense.frequency !== 'once') || expense.is_recurring;
        
        if (isRecurring && filterProviderValues.startDate) {
            // For recurring expenses, show same day of month as payment_date but in current period
            const startDate = new Date(filterProviderValues.startDate);
            const paymentDate = new Date(expense.payment_date);
            const dayOfMonth = paymentDate.getDate();
            
            // Create date with current period's month/year and original day
            const displayDate = new Date(startDate.getFullYear(), startDate.getMonth(), dayOfMonth);
            return formatDate(displayDate.toISOString());
        } else {
            // For one-time expenses, show actual date
            return formatDate(expense.payment_date);
        }
    };

    console.log("Filtered and sorted rows:", filterProviderValues.filteredRows)

    const sortCategoriesAlphabetically = () => {
        const sorted = expensesProviderValues.rows.slice().sort((a, b) => {
          const aKey = expensesProviderValues.categoriesMap[a.category]?.name.toLowerCase() || "";
          const bKey = expensesProviderValues.categoriesMap[b.category]?.name.toLowerCase() || ""      
          const comparison = aKey.localeCompare(bKey, 'en', { sensitivity: 'base', numeric: true });
    
          return comparison;
        });
        filterProviderValues.setFilteredRows(sorted);
      };

    
    const handleSort = (selectedSort) => {
        switch (selectedSort) {
            case "date-dec":
            filterProviderValues.setFilteredRows(filterProviderValues.filteredRows.slice().sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date)));
            break;
            case "date-inc":
            filterProviderValues.setFilteredRows(filterProviderValues.filteredRows.slice().sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date)));
            break;
            case "category":
            sortCategoriesAlphabetically("category");
            break;
            case "price-inc":
            filterProviderValues.setFilteredRows(filterProviderValues.filteredRows.slice().sort((a, b) => a.price - b.price));
            break;
            case "price-dec":
            filterProviderValues.setFilteredRows(filterProviderValues.filteredRows.slice().sort((a, b) => b.price - a.price));
            break;
            default:
            filterProviderValues.setFilteredRows(filterProviderValues.filteredRows.slice().sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date)));
            break;
        }     
        setSelectedSort(selectedSort);
    };


    const onSortChange = (value) => {
        setSelectedSort(value);
        handleSort(value);  
    };


    //Pagination
    // Separate recurring and one-time expenses BEFORE pagination
    const allRecurringRows = filterProviderValues.filteredRows
        .filter(row => {
            // Check new frequency field OR old is_recurring field for backward compatibility
            const isRecurring = (row.frequency && row.frequency !== 'once') || row.is_recurring;
            console.log(`Row ${row.id}: ${row.name} - frequency: ${row.frequency}, is_recurring: ${row.is_recurring}, isRecurring: ${isRecurring}`);
            return isRecurring;
        })
        .sort((a, b) => {
            // Sort recurring expenses by price descending (highest first)
            const priceA = parseFloat(String(a.price).replace(',', '.')) || 0;
            const priceB = parseFloat(String(b.price).replace(',', '.')) || 0;
            return priceB - priceA;
        });
    
    const allRegularRows = filterProviderValues.filteredRows.filter(row => {
        // One-time expenses are those that are NOT recurring
        return !(row.frequency && row.frequency !== 'once') && !row.is_recurring;
    });

    console.log(`Recurring rows: ${allRecurringRows.length}, One-time rows: ${allRegularRows.length}`);

    // Show all rows (no pagination)
    const recurringRows = allRecurringRows;
    const regularRows = allRegularRows;


    //Reset sort on selecting another interval filter
    useEffect(() => {
        return () => {
            setSelectedSort([]);
        };
    }, [filterProviderValues.selectedInterval]);


    //Reset categories checkbox on selecting another interval filter

    const { selectedInterval, setCheckedCategories } = filterProviderValues;

    useEffect(() => {
        return () => {
            setCheckedCategories([]);
        };
    }, [selectedInterval, setCheckedCategories]);


    //Reset currentPage when changing the filter
    const { setCurrentPage } = expensesProviderValues;
    const { filteredRows } = filterProviderValues;

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredRows, setCurrentPage]);


    //Close input editing on mouse click

    const inputRef = useRef(null);
    
    const closeEditing = useCallback(() => {
        expensesProviderValues.setEditingField({ id: null, field: null });
        }, [expensesProviderValues]);

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



    const sortProviderValues = {
      selectedSort, 
      onSortChange,
    }



    return  <React.Fragment>
        <SortContext.Provider value={sortProviderValues}>
        <div className="expenses-wrapper">
            
            <div className="expenses-table-container">
                <div className="expenses-header">
                    {authProviderValues.isLoggedIn &&                
                    <div className="show-interval">
                        <i className="material-icons calendar-icon">event</i>
                        {
                        filterProviderValues.selectedInterval === "month" ? (
                            <span>{filterProviderValues.customLabel || filterProviderValues.currentMonth}</span>
                        ) : filterProviderValues.selectedInterval === "year" ? (
                            <span>{filterProviderValues.customLabel || filterProviderValues.currentYear}</span>
                        ) : filterProviderValues.selectedInterval === "today" ? (
                            <span>{filterProviderValues.today}</span>
                        ) : filterProviderValues.selectedInterval === "all" ? (
                            <span>All</span>
                        ) : filterProviderValues.selectedInterval === "custom" ? (
                            <div className="show-custom-interval">
                                <div className="show-custom">
                                    {filterProviderValues.formatDate(filterProviderValues.startDate)}
                                </div>-
                                <div className="show-custom">
                                    {filterProviderValues.formatDate(filterProviderValues.endDate)}
                                </div>
                            </div>             
                        ) : null 
                        }
                    </div>  
                    }

                    <h2 className="expenses-title">Expenses</h2>

                    <div className="header-actions">
                        {!modalProviderValues.isModalSortOpen  && authProviderValues.isLoggedIn &&                              
                            <button className="sort-btn" 
                                onClick={() => modalProviderValues.setIsModalSortOpen(true)}>
                                <i className="material-icons">swap_vert</i>
                                Sort                   
                            </button>                                         
                        }
                        <SortContext.Provider value={sortProviderValues}>
                            <Sort />
                        </SortContext.Provider>

                        {!filterProviderValues.isFilterOpen  && authProviderValues.isLoggedIn &&
                        <button className="filter-btn" 
                            onClick={() => filterProviderValues.setIsFilterOpen(true)}>
                            <i className="material-icons">filter_list</i>
                            Filter                   
                        </button> 
                        }
                    </div>
                </div>
            
                <div className="table-scroll-wrapper recurring">
                <table className="expenses-table">                
                <thead>
                    {authProviderValues.isLoggedIn && recurringRows.length > 0 && (
                        <tr className="section-header">
                            <th colSpan={6}>
                                <div className="section-title" onClick={() => setIsRecurringCollapsed(!isRecurringCollapsed)} style={{cursor: 'pointer'}}>
                                    <i className="material-icons">repeat</i>
                                    Recurring Expenses
                                    <i className="material-icons toggle-icon" style={{marginLeft: 'auto'}}>
                                        {isRecurringCollapsed ? 'expand_more' : 'expand_less'}
                                    </i>
                                </div>
                            </th>
                        </tr>
                    )}
                    {authProviderValues.isLoggedIn &&
                    <tr>                       
                        <th>CATEGORY</th>                      
                        <th>EXPENSE</th>                                           
                        <th>DATE</th>
                        <th>FREQUENCY</th>
                        <th>PRICE €</th>
                        <th>ACTIONS</th>
                    </tr>
                    }
                </thead>
                
                <tbody>
                    {/* Expenses Table Rendering */}

                    {
                        authProviderValues.isLoggedIn
                            ? (
                                (recurringRows.length > 0 || regularRows.length > 0)
                                ? (
                                    <>
                                        {/* Recurring Expenses Section */}
                                        
                                        {recurringRows.length > 0 && (
                                            <>
                                                {!isRecurringCollapsed && recurringRows.map((row, idx) => (
                                                <tr key={row.id || idx}>
                                                    <td>
                                                        {
                                                            expensesProviderValues.categories.find(
                                                                cat => String(cat.id) === String(row.category))?.name 
                                                            || 'Unknown'
                                                        }                                   
                                                    </td>
                                                    <td>                     
                                                        {expensesProviderValues.editingField.id === row.id && expensesProviderValues.editingField.field === 'name' ? (                                                                                            
                                                            <input id="edit-name"
                                                                type="text"
                                                                name="name"
                                                                placeholder="Fill out expense name"
                                                                ref={inputRef}
                                                                value={expensesProviderValues.editName || ""}
                                                                onChange={e => expensesProviderValues.setEditName(e.target.value)}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter') {
                                                                        expensesProviderValues.applyChanges(row.id, 'name')
                                                                    }
                                                                }}
                                                            />
                                                        ) : (                                        
                                                            <div className="tooltip-icon-container" 
                                                                onClick={() => {
                                                                    expensesProviderValues.setEditingField({id: row.id, field: 'name'});
                                                                    expensesProviderValues.setEditName(row.name);
                                                                }}
                                                                data-tooltip="Edit expense"
                                                            > 
                                                                {row.name}
                                                                {row.is_recurring && (
                                                                    <span className="recurring-badge">
                                                                        <i className="material-icons">repeat</i>
                                                                    </span>
                                                                )}
                                                            </div>                                                                                                                  
                                                            )}
                                                    </td>                
                                                    
                                                    <td>
                                                    {expensesProviderValues.editingField.id === row.id && expensesProviderValues.editingField.field === 'date' ? (                                                              
                                                        <input id="edit-date"
                                                            type="date"
                                                            ref={inputRef}
                                                            value={expensesProviderValues.editDate || ""}
                                                            onChange={e => {
                                                                const newDate = e.target.value;
                                                                expensesProviderValues.setEditDate(newDate);
                                                                console.log('Date changed (recurring) to:', newDate, 'Original:', row.payment_date);
                                                                // Auto-save after a short delay when date changes
                                                                if (newDate && newDate !== row.payment_date) {
                                                                    setTimeout(() => {
                                                                        console.log('Auto-saving recurring date change');
                                                                        expensesProviderValues.applyChanges(row.id, 'date');
                                                                    }, 300);
                                                                }
                                                            }}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') {
                                                                    expensesProviderValues.applyChanges(row.id, 'date')
                                                                }
                                                            }}
                                                        />
                                                        ) : (
                                                        <div className="tooltip-icon-container" 
                                                            onClick={() => {
                                                                expensesProviderValues.setEditingField({id: row.id, field: 'date'});
                                                                expensesProviderValues.setEditDate(row.date);
                                                            }}
                                                            data-tooltip="Edit date"
                                                        > 
                                                            {getDisplayDate(row)} 
                                                        </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                    {expensesProviderValues.editingField.id === row.id && expensesProviderValues.editingField.field === 'frequency' ? (                                                              
                                                        <select
                                                            className="frequency-select"
                                                            ref={inputRef}
                                                            value={expensesProviderValues.editFrequency || (() => {
                                                                // For old recurring expenses (is_recurring=true), default to monthly
                                                                return row.is_recurring && (!row.frequency || row.frequency === 'once') ? 'monthly' : (row.frequency || 'once');
                                                            })()}
                                                            onChange={(e) => {
                                                                const newFrequency = e.target.value;
                                                                console.log('Selected frequency in recurring:', newFrequency);
                                                                expensesProviderValues.setEditFrequency(newFrequency);
                                                                // Call applyChanges with value directly
                                                                expensesProviderValues.applyChanges(row.id, 'frequency', newFrequency);
                                                            }}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter' || e.key === 'Escape') {
                                                                    expensesProviderValues.setEditingField({ id: null, field: null });
                                                                }
                                                            }}
                                                        >
                                                            <option value="once">One-time</option>
                                                            <option value="monthly">Monthly</option>
                                                            <option value="quarterly">Quarterly</option>
                                                            <option value="yearly">Yearly</option>
                                                        </select>
                                                        ) : (
                                                        <div className="tooltip-icon-container" 
                                                            onClick={() => {
                                                                expensesProviderValues.setEditingField({id: row.id, field: 'frequency'});
                                                                // For old recurring expenses, default to monthly if no frequency set
                                                                const defaultFreq = row.is_recurring && (!row.frequency || row.frequency === 'once') ? 'monthly' : (row.frequency || 'once');
                                                                expensesProviderValues.setEditFrequency(defaultFreq);
                                                            }}
                                                            data-tooltip="Edit frequency"
                                                        > 
                                                            {(() => {
                                                                // For old recurring expenses, treat as monthly if no frequency set
                                                                const displayFreq = row.is_recurring && (!row.frequency || row.frequency === 'once') ? 'monthly' : row.frequency;
                                                                return displayFreq === 'monthly' ? 'Monthly' : 
                                                                    displayFreq === 'quarterly' ? 'Quarterly' : 
                                                                    displayFreq === 'yearly' ? 'Yearly' : 'One-time';
                                                            })()}
                                                        </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                    {expensesProviderValues.editingField.id === row.id && expensesProviderValues.editingField.field === 'price' ? (                           
                                                        <CurrencyInput id="edit-price"
                                                            prefix="€ "
                                                            decimalsLimit={2}
                                                            decimalSeparator=","
                                                            groupSeparator="."
                                                            placeholder="0,00"
                                                            ref={inputRef}
                                                            value={expensesProviderValues.editPrice}
                                                            onBlur={() => expensesProviderValues.setEditingField({ id: null, field: null })}
                                                            onValueChange={value => expensesProviderValues.setEditPrice(value || '')}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') {
                                                                    expensesProviderValues.applyChanges(row.id, 'price')
                                                                }
                                                            }}
                                                        />
                                                        ) : (
                                                            <div className="tooltip-icon-container" 
                                                                onClick={() => {
                                                                    expensesProviderValues.setEditingField({id: row.id, field: 'price'});
                                                                    const priceValue = String(row.price).replace(',', '.');
                                                                    expensesProviderValues.setEditPrice(priceValue);
                                                                }}
                                                                data-tooltip="Edit price"
                                                            >
                                                                € {row.price} 
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button className="edit-btn"
                                                                onClick={() => {
                                                                    expensesProviderValues.setIsDescriptionShown(true);
                                                                    expensesProviderValues.setCurrentDescriptionId(row.id);
                                                                }}
                                                                data-tooltip="Add description"
                                                                >
                                                                <i className="material-icons">edit</i>
                                                            </button>
                                                            <button 
                                                                className={`recurring-btn ${row.is_recurring ? 'active' : ''}`}
                                                                onClick={() => {
                                                                    if (!row.is_recurring) {
                                                                        modalProviderValues.setSelectedExpenseForRecurring(row.id);
                                                                        modalProviderValues.setIsModalRecurringOpen(true);
                                                                    }
                                                                }}
                                                                data-tooltip={row.is_recurring ? 'Already recurring' : 'Make recurring'}
                                                                disabled={row.is_recurring}
                                                            >
                                                                <i className="material-icons">repeat</i>
                                                            </button>
                                                            <button 
                                                                className="copy-btn"
                                                                onClick={() => expensesProviderValues.copyExpense(row.id)}
                                                                data-tooltip="Copy expense"
                                                            >
                                                                <i className="material-icons">content_copy</i>
                                                            </button>
                                                            <button className="delete-btn"
                                                            onClick={() => expensesProviderValues.deleteExpense(row.id)}
                                                            data-tooltip="Delete expense"
                                                        >
                                                            <i className="material-icons">delete</i>
                                                        </button>
                                                        <div className="receipt-actions">
                                                            <input
                                                                type="file"
                                                                id={`receipt-input-${row.id}`}
                                                                accept="image/*,.pdf"
                                                                style={{ display: 'none' }}
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        expensesProviderValues.attachReceipt(row.id, file);
                                                                    }
                                                                }}
                                                            />
                                                            <button 
                                                                className={`attach-btn ${expensesProviderValues.receipts[row.id] ? 'has-receipt' : ''}`}
                                                                onClick={() => {
                                                                    document.getElementById(`receipt-input-${row.id}`).click();
                                                                }}
                                                                data-tooltip={expensesProviderValues.receipts[row.id] ? 'Receipt attached' : 'Attach receipt'}
                                                            >
                                                                <i className="material-icons">
                                                                    {expensesProviderValues.receipts[row.id] ? 'check_circle' : 'attach_file'}
                                                                </i>
                                                            </button>
                                                            {expensesProviderValues.receipts[row.id] && (
                                                                <button
                                                                    className="remove-receipt-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        expensesProviderValues.removeReceipt(row.id);
                                                                    }}
                                                                    title="Remove receipt"
                                                                >
                                                                    <i className="material-icons">close</i>
                                                                </button>
                                                            )}
                                                        </div>
                                                        </div>
                                                    </td>                                
                                                </tr>
                                                ))}
                                                
                                            </>
                                        )}
                                    </>
                                )
                                :  (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", color: "#888" }}>
                                        {expensesProviderValues.rows.length > 0 
                                            ? "No data for specified filter" 
                                            : "No data. Please enter expenses"}
                                    </td>
                                </tr>
                            ))
                            :
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center", color: "#888" }}>
                                    No data. Please log in
                                </td>
                            </tr>
                  
                    }
                                                          
                </tbody>               
                </table>
                </div>
                
                {/* One-time Expenses Table */}
                {authProviderValues.isLoggedIn && regularRows.length > 0 && (
                    <div className="table-scroll-wrapper onetime">
                    <table className="expenses-table">
                        <thead>
                            <tr className="section-header">
                                <th colSpan={6}>
                                    <div className="section-title" onClick={() => setIsRegularCollapsed(!isRegularCollapsed)} style={{cursor: 'pointer'}}>
                                        <i className="material-icons">receipt</i>
                                        One-time Expenses
                                        <i className="material-icons toggle-icon" style={{marginLeft: 'auto'}}>
                                            {isRegularCollapsed ? 'expand_more' : 'expand_less'}
                                        </i>
                                    </div>
                                </th>
                            </tr>
                            <tr>                       
                                <th>CATEGORY</th>                      
                                <th>EXPENSE</th>                                           
                                <th>DATE</th>
                                <th>FREQUENCY</th>
                                <th>PRICE €</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!isRegularCollapsed && regularRows.map((row, idx) => (
                                <tr key={row.id || idx}>
                                    <td>
                                        {
                                            expensesProviderValues.categories.find(
                                                cat => String(cat.id) === String(row.category))?.name 
                                            || 'Unknown'
                                        }                                   
                                    </td>

                                    <td>
                                        {/* Inputs "name", "date", "frequency" and "price" are editable     */}
                                        {expensesProviderValues.editingField.id === row.id && expensesProviderValues.editingField.field === 'name' ? (                                                                                            
                                            <input id="edit-name"
                                                type="text"
                                                name="name"
                                                placeholder="Fill out expense name"
                                                ref={inputRef}
                                                value={expensesProviderValues.editName || ""}
                                                onChange={e => expensesProviderValues.setEditName(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        expensesProviderValues.applyChanges(row.id, 'name')
                                                    }
                                                }}
                                            />
                                        ) : (                                        
                                            <div className="tooltip-icon-container" 
                                                onClick={() => {
                                                    expensesProviderValues.setEditingField({id: row.id, field: 'name'});
                                                    expensesProviderValues.setEditName(row.name);
                                                }}
                                                data-tooltip="Edit expense"
                                            > 
                                                {row.name}
                                                {row.is_recurring && (
                                                    <span className="recurring-badge">
                                                        <i className="material-icons">repeat</i>
                                                    </span>
                                                )}
                                            </div>                                                                                                                  
                                            )}
                                    </td>                
                                    
                                    <td>
                                    {expensesProviderValues.editingField.id === row.id && expensesProviderValues.editingField.field === 'date' ? (                                                              
                                        <input id="edit-date"
                                            type="date"
                                            ref={inputRef}
                                            value={expensesProviderValues.editDate || ""}
                                            onChange={e => {
                                                const newDate = e.target.value;
                                                expensesProviderValues.setEditDate(newDate);
                                                console.log('Date changed (one-time) to:', newDate, 'Original:', row.payment_date);
                                                // Auto-save after a short delay when date changes
                                                if (newDate && newDate !== row.payment_date) {
                                                    setTimeout(() => {
                                                        console.log('Auto-saving one-time date change');
                                                        expensesProviderValues.applyChanges(row.id, 'date');
                                                    }, 300);
                                                }
                                            }}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    expensesProviderValues.applyChanges(row.id, 'date')
                                                }
                                            }}
                                        />
                                        ) : (
                                        <div className="tooltip-icon-container" 
                                            onClick={() => {
                                                expensesProviderValues.setEditingField({id: row.id, field: 'date'});
                                                expensesProviderValues.setEditDate(row.date);
                                            }}
                                            data-tooltip="Edit date"
                                        > 
                                            {getDisplayDate(row)} 
                                        </div>
                                        )}
                                    </td>
                                    <td>
                                    {expensesProviderValues.editingField.id === row.id && expensesProviderValues.editingField.field === 'frequency' ? (                                                              
                                        <select
                                            className="frequency-select"
                                            ref={inputRef}
                                            value={expensesProviderValues.editFrequency || (() => {
                                                // For old recurring expenses (is_recurring=true), default to monthly
                                                return row.is_recurring && (!row.frequency || row.frequency === 'once') ? 'monthly' : (row.frequency || 'once');
                                            })()}
                                            onChange={(e) => {
                                                const newFrequency = e.target.value;
                                                console.log('Selected frequency in one-time:', newFrequency);
                                                expensesProviderValues.setEditFrequency(newFrequency);
                                                // Call applyChanges with value directly
                                                expensesProviderValues.applyChanges(row.id, 'frequency', newFrequency);
                                            }}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' || e.key === 'Escape') {
                                                    expensesProviderValues.setEditingField({ id: null, field: null });
                                                }
                                            }}
                                        >
                                            <option value="once">One-time</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                        ) : (
                                        <div className="tooltip-icon-container" 
                                            onClick={() => {
                                                expensesProviderValues.setEditingField({id: row.id, field: 'frequency'});
                                                // For old recurring expenses, default to monthly if no frequency set
                                                const defaultFreq = row.is_recurring && (!row.frequency || row.frequency === 'once') ? 'monthly' : (row.frequency || 'once');
                                                expensesProviderValues.setEditFrequency(defaultFreq);
                                            }}
                                            data-tooltip="Edit frequency"
                                        > 
                                            {(() => {
                                                // For old recurring expenses, treat as monthly if no frequency set
                                                const displayFreq = row.is_recurring && (!row.frequency || row.frequency === 'once') ? 'monthly' : row.frequency;
                                                return displayFreq === 'monthly' ? 'Monthly' : 
                                                       displayFreq === 'quarterly' ? 'Quarterly' : 
                                                       displayFreq === 'yearly' ? 'Yearly' : 'One-time';
                                            })()}
                                        </div>
                                        )}
                                    </td>
                                    <td>
                                    {expensesProviderValues.editingField.id === row.id && expensesProviderValues.editingField.field === 'price' ? (                           
                                        <CurrencyInput id="edit-price"
                                            prefix="€ "
                                            decimalsLimit={2}
                                            decimalSeparator=","
                                            groupSeparator="."
                                            placeholder="0,00"
                                            ref={inputRef}
                                            value={expensesProviderValues.editPrice}
                                            onBlur={() => expensesProviderValues.setEditingField({ id: null, field: null })}
                                            onValueChange={value => expensesProviderValues.setEditPrice(value || '')}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    expensesProviderValues.applyChanges(row.id, 'price')
                                                }
                                            }}
                                        />
                                        ) : (
                                            <div className="tooltip-icon-container" 
                                                onClick={() => {
                                                    expensesProviderValues.setEditingField({id: row.id, field: 'price'});
                                                    const priceValue = String(row.price).replace(',', '.');
                                                    expensesProviderValues.setEditPrice(priceValue);
                                                }}
                                                data-tooltip="Edit price"
                                            >
                                                € {row.price} 
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="edit-btn"
                                                onClick={() => {
                                                    expensesProviderValues.setIsDescriptionShown(true);
                                                    expensesProviderValues.setCurrentDescriptionId(row.id);
                                                }}
                                                data-tooltip="Add description"
                                                >
                                                <i className="material-icons">edit</i>
                                            </button>
                                            <button 
                                                className={`recurring-btn ${row.is_recurring ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (!row.is_recurring) {
                                                        modalProviderValues.setSelectedExpenseForRecurring(row.id);
                                                        modalProviderValues.setIsModalRecurringOpen(true);
                                                    }
                                                }}
                                                data-tooltip={row.is_recurring ? 'Already recurring' : 'Make recurring'}
                                                disabled={row.is_recurring}
                                            >
                                                <i className="material-icons">repeat</i>
                                            </button>
                                            <button 
                                                className="copy-btn"
                                                onClick={() => expensesProviderValues.copyExpense(row.id)}
                                                data-tooltip="Copy expense"
                                            >
                                                <i className="material-icons">content_copy</i>
                                            </button>
                                            <button className="delete-btn"
                                            onClick={() => expensesProviderValues.deleteExpense(row.id)}
                                            data-tooltip="Delete expense"
                                        >
                                            <i className="material-icons">delete</i>
                                        </button>
                                        <div className="receipt-actions">
                                            <input
                                                type="file"
                                                id={`receipt-input-${row.id}`}
                                                accept="image/*,.pdf"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        expensesProviderValues.attachReceipt(row.id, file);
                                                    }
                                                }}
                                            />
                                            <button 
                                                className={`attach-btn ${expensesProviderValues.receipts[row.id] ? 'has-receipt' : ''}`}
                                                onClick={() => {
                                                    document.getElementById(`receipt-input-${row.id}`).click();
                                                }}
                                                data-tooltip={expensesProviderValues.receipts[row.id] ? 'Receipt attached' : 'Attach receipt'}
                                            >
                                                <i className="material-icons">
                                                    {expensesProviderValues.receipts[row.id] ? 'check_circle' : 'attach_file'}
                                                </i>
                                            </button>
                                            {expensesProviderValues.receipts[row.id] && (
                                                <button
                                                    className="remove-receipt-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        expensesProviderValues.removeReceipt(row.id);
                                                    }}
                                                    title="Remove receipt"
                                                >
                                                    <i className="material-icons">close</i>
                                                </button>
                                            )}
                                        </div>
                                        </div>
                                    </td>                                
                                </tr>
                            ))}
                            
                            {/* Mobile Add Expense Button - hidden, moved outside table */}

                            {/* Add New Expense Row */}
                            {!isMobile && (
                            <tr className="add-expense-row">
                                <td>
                                    <select
                                        value={expensesProviderValues.selectedCategory}
                                        onChange={e => expensesProviderValues.setSelectedCategory(e.target.value)}
                                    >
                                        <option value="all">Select Category</option>
                                        {Array.isArray(expensesProviderValues.categories) ? (
                                            expensesProviderValues.categories
                                                .sort((a, b) => a.name.localeCompare(b.name))
                                                .map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))
                                        ) : (
                                            <option>Loading...</option>
                                        )}
                                    </select>
                                </td>
                                <td>
                                    {expensesProviderValues.selectedCategoryObj?.name === "Miscellaneous" ? (
                                        <input
                                            type="text"
                                            placeholder="Enter expense name"
                                            value={expensesProviderValues.miscExpense}
                                            onChange={e => expensesProviderValues.setMiscExpense(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    expensesProviderValues.handleSave(e);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <select
                                            value={expensesProviderValues.selectedExpense}
                                            onChange={e => expensesProviderValues.setSelectedExpense(e.target.value)}
                                        >
                                            <option value="all">Select Expense</option>
                                            {(Array.isArray(expensesProviderValues.expenses) ? expensesProviderValues.expenses : [])
                                                .filter(exp =>
                                                    expensesProviderValues.selectedCategory === 'all' ||
                                                    String(exp.category) === String(expensesProviderValues.selectedCategory)
                                                )
                                                .sort((a, b) => a.name.localeCompare(b.name))
                                                .map(exp => (
                                                    <option key={exp.id} value={exp.name}>{exp.name}</option>
                                                ))
                                            }
                                        </select>
                                    )}
                                </td>
                                <td>
                                    <input
                                        type="date"
                                        value={expensesProviderValues.paymentDate}
                                        onChange={e => expensesProviderValues.setPaymentDate(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                expensesProviderValues.handleSave(e);
                                            }
                                        }}
                                    />
                                </td>
                                <td>
                                    <select
                                        value={expensesProviderValues.expenseFrequency || 'once'}
                                        onChange={(e) => {
                                            expensesProviderValues.setExpenseFrequency(e.target.value);
                                            expensesProviderValues.setIsExpenseRecurring(e.target.value !== 'once');
                                        }}
                                        className="frequency-select"
                                    >
                                        <option value="once">One-time</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </td>
                                <td>
                                    <CurrencyInput
                                        placeholder="0,00"
                                        decimalsLimit={2}
                                        decimalSeparator=","
                                        groupSeparator="."
                                        prefix="€ "
                                        allowDecimals={true}
                                        inputMode="decimal"
                                        value={expensesProviderValues.price}
                                        onValueChange={(value) => expensesProviderValues.setPrice(value || '')}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                expensesProviderValues.handleSave(e);
                                            }
                                        }}
                                    />
                                </td>
                                <td>
                                    <button className="add-btn" onClick={expensesProviderValues.handleSave}>
                                        <i className="material-icons">add</i>
                                        Add
                                    </button>
                                </td>
                            </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                )}
            </div>
            
            {/* Pagination removed - showing all expenses */}
            
            {/* Mobile Fixed Add Expense Button & Form */}
            {authProviderValues.isLoggedIn && (
                <>
                    {isMobileAddOpen && (
                        <div className="mobile-add-form-overlay" onClick={() => setIsMobileAddOpen(false)} />
                    )}
                    {isMobileAddOpen && (
                        <div className="mobile-add-form" onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                expensesProviderValues.handleSave(e);
                                setIsMobileAddOpen(false);
                            }
                        }}>
                            <div className="mobile-add-form-header">
                                <span>New Expense</span>
                                <button onClick={() => setIsMobileAddOpen(false)}>
                                    <i className="material-icons">close</i>
                                </button>
                            </div>
                            <div className="mobile-add-form-fields">
                                <div className="mobile-field">
                                    <label>Category</label>
                                    <select
                                        value={expensesProviderValues.selectedCategory}
                                        onChange={e => expensesProviderValues.setSelectedCategory(e.target.value)}
                                    >
                                        <option value="all">Select Category</option>
                                        {Array.isArray(expensesProviderValues.categories) ? (
                                            expensesProviderValues.categories
                                                .sort((a, b) => a.name.localeCompare(b.name))
                                                .map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))
                                        ) : (
                                            <option>Loading...</option>
                                        )}
                                    </select>
                                </div>
                                <div className="mobile-field">
                                    <label>Expense</label>
                                    {expensesProviderValues.selectedCategoryObj?.name === "Miscellaneous" ? (
                                        <input
                                            type="text"
                                            placeholder="Enter expense name"
                                            value={expensesProviderValues.miscExpense}
                                            onChange={e => expensesProviderValues.setMiscExpense(e.target.value)}
                                        />
                                    ) : (
                                        <select
                                            value={expensesProviderValues.selectedExpense}
                                            onChange={e => expensesProviderValues.setSelectedExpense(e.target.value)}
                                        >
                                            <option value="all">Select Expense</option>
                                            {(Array.isArray(expensesProviderValues.expenses) ? expensesProviderValues.expenses : [])
                                                .filter(exp =>
                                                    expensesProviderValues.selectedCategory === 'all' ||
                                                    String(exp.category) === String(expensesProviderValues.selectedCategory)
                                                )
                                                .sort((a, b) => a.name.localeCompare(b.name))
                                                .map(exp => (
                                                    <option key={exp.id} value={exp.name}>{exp.name}</option>
                                                ))
                                            }
                                        </select>
                                    )}
                                </div>
                                <div className="mobile-field">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={expensesProviderValues.paymentDate}
                                        onChange={e => expensesProviderValues.setPaymentDate(e.target.value)}
                                    />
                                </div>
                                <div className="mobile-field">
                                    <label>Frequency</label>
                                    <select
                                        value={expensesProviderValues.expenseFrequency || 'once'}
                                        onChange={(e) => {
                                            expensesProviderValues.setExpenseFrequency(e.target.value);
                                            expensesProviderValues.setIsExpenseRecurring(e.target.value !== 'once');
                                        }}
                                    >
                                        <option value="once">One-time</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                                <div className="mobile-field">
                                    <label>Price</label>
                                    <CurrencyInput
                                        placeholder="0,00"
                                        decimalsLimit={2}
                                        decimalSeparator=","
                                        groupSeparator="."
                                        prefix="€ "
                                        allowDecimals={true}
                                        inputMode="decimal"
                                        value={expensesProviderValues.price}
                                        onValueChange={(value) => expensesProviderValues.setPrice(value || '')}
                                    />
                                </div>
                                <button className="mobile-add-save-btn" onClick={(e) => {
                                    expensesProviderValues.handleSave(e);
                                    setIsMobileAddOpen(false);
                                }}>
                                    <i className="material-icons">add</i>
                                    Add Expense
                                </button>
                            </div>
                        </div>
                    )}
                    <button 
                        className="mobile-fixed-add-btn"
                        onClick={() => setIsMobileAddOpen(!isMobileAddOpen)}
                    >
                        <i className="material-icons">{isMobileAddOpen ? 'close' : 'add_circle'}</i>
                        {isMobileAddOpen ? 'Cancel' : 'Add New Expense'}
                    </button>
                </>
            )}
                                        
        </div>
        </SortContext.Provider>
  
            </React.Fragment>
}
    
export {Expenses}