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
    const rowsPerPage = 5;  
    const totalRows = filterProviderValues.filteredRows.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

    const paginatedRows = filterProviderValues.filteredRows.slice(
        (expensesProviderValues.currentPage - 1) * rowsPerPage,
        expensesProviderValues.currentPage * rowsPerPage
    );


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


    //Auto-open custom date modal when custom interval is selected
    useEffect(() => {
        if (filterProviderValues.selectedInterval === 'custom') {
            modalProviderValues.setIsModalCustomDateOpen(true);
        }
    }, [filterProviderValues.selectedInterval]);


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
                            <span>{filterProviderValues.currentMonth}</span>
                        ) : filterProviderValues.selectedInterval === "year" ? (
                            <span>{filterProviderValues.currentYear}</span>
                        ) : filterProviderValues.selectedInterval === "today" ? (
                            <span>{filterProviderValues.today}</span>
                        ) : filterProviderValues.selectedInterval === "all" ? (
                            <span>All</span>
                        ) : filterProviderValues.selectedInterval === "custom" ? (
                            <div className="show-custom-interval">
                                <div className="show-custom">
                                    {filterProviderValues.formatDate(filterProviderValues.startDate)}
                                </div>/
                                <div className="show-custom">
                                    {filterProviderValues.formatDate(filterProviderValues.endDate)}
                                </div>
                            </div>             
                        ) : null 
                        }
                        <div className="interval-select-field">
                            <select 
                                value={filterProviderValues.selectedInterval}
                                onChange={e => filterProviderValues.setSelectedInterval(e.target.value)}
                            >
                                <option value="month">Select interval</option>
                                <option value="year">This year</option>
                                <option value="month">This month</option>                               
                                <option value="today">Today</option>
                                <option value="custom">Custom interval</option>
                                <option value="all">All</option>
                            </select>
                        </div>
                    </div>  
                    }

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
            
                <table className="expenses-table">                
                <thead>
                    {authProviderValues.isLoggedIn &&
                    <tr>                       
                        <th>CATEGORY</th>                      
                        <th>EXPENSE</th>                                           
                        <th>DATE</th>
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
                                paginatedRows.length > 0 
                                ? (
                                    paginatedRows.map((row, idx) => (
                                <tr key={row.id || idx}>
                                    <td>
                                        {
                                            expensesProviderValues.categories.find(
                                                cat => String(cat.id) === String(row.category))?.name 
                                            || 'Unknown'
                                        }                                   
                                    </td>

                                    <td>
                                        {/* Inputs "name", "date" and "price" are editable     */}
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
                                            <div className="tooltip-icon-container" onClick={() => {
                                                expensesProviderValues.setEditingField({id: row.id, field: 'name'});
                                                expensesProviderValues.setEditName(row.name);
                                                }}> {row.name } 
                                                    <i className="material-icons" id="edit-icon">edit</i>
                                                    <div className="tooltip-icon-text">Edit name</div>                                                                                 
                                            </div>                                                                                                                  
                                            )}
                                    </td>                
                                    
                                    <td>
                                    {expensesProviderValues.editingField.id === row.id && expensesProviderValues.editingField.field === 'date' ? (                                                              
                                        <input id="edit-date"
                                            type="date"
                                            ref={inputRef}
                                            value={expensesProviderValues.editDate || ""}
                                            onChange={e => expensesProviderValues.setEditDate(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    expensesProviderValues.applyChanges(row.id, 'date')
                                                }
                                            }}
                                        />
                                        ) : (
                                        <div className="tooltip-icon-container" onClick={() => {
                                            expensesProviderValues.setEditingField({id: row.id, field: 'date'});
                                            expensesProviderValues.setEditDate(row.date);
                                        }}> {row.payment_date} 
                                            <i className="material-icons" id="edit-icon">edit</i> 
                                            <div className="tooltip-icon-text">Edit date</div> 
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
                                            <div className="tooltip-icon-container" onClick={() => {
                                                expensesProviderValues.setEditingField({id: row.id, field: 'price'});
                                                expensesProviderValues.setEditPrice(row.price);
                                            }}>
                                                € {row.price} 
                                                <i className="material-icons" id="edit-icon">edit</i>
                                                <div className="tooltip-icon-text">Edit price</div>  
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
                                                >
                                                <i className="material-icons">edit</i>
                                                Add Description
                                            </button>
                                            <button className="delete-btn"
                                            onClick={() => expensesProviderValues.deleteExpense(row.id)}
                                        >
                                            <i className="material-icons">delete</i>
                                            Delete Expense
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
                                            >
                                                <i className="material-icons">
                                                    {expensesProviderValues.receipts[row.id] ? 'check_circle' : 'attach_file'}
                                                </i>
                                                {expensesProviderValues.receipts[row.id] ? 'Receipt Attached' : 'Attach Receipt'}
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
                            ) 
                                ))
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

                    {/* Add New Expense Row */}
                    {authProviderValues.isLoggedIn && (
                        <tr className="add-expense-row">
                            <td>
                                <select
                                    value={expensesProviderValues.selectedCategory}
                                    onChange={e => expensesProviderValues.setSelectedCategory(e.target.value)}
                                >
                                    <option value="all">Select Category</option>
                                    {Array.isArray(expensesProviderValues.categories) ? (
                                        expensesProviderValues.categories.map(cat => (
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
                                />
                            </td>
                            <td>
                                <CurrencyInput
                                    placeholder="0,00"
                                    decimalsLimit={2}
                                    decimalSeparator=","
                                    groupSeparator="."
                                    prefix="€ "
                                    value={expensesProviderValues.price}
                                    onValueChange={(value) => expensesProviderValues.setPrice(value || '')}
                                />
                            </td>
                            <td>
                                <button className="add-btn" onClick={expensesProviderValues.handleSave}>
                                    <i className="material-icons">add</i>
                                    Add Expense
                                </button>
                            </td>
                        </tr>
                    )}
                                                          
                </tbody>               
                </table>
            </div>
            
            {authProviderValues.isLoggedIn &&    
            <div className="pagination">
                <button className="pagination-btn"
                    onClick={() => expensesProviderValues.setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={expensesProviderValues.currentPage === 1}
                >
                    <i className="material-icons">chevron_left</i>
                    Prev 
                </button>
                <span className="page-info">Page <strong>{expensesProviderValues.currentPage}</strong> of <strong>{totalPages > 1 ? totalPages : 1}</strong></span>
                <button className="pagination-btn"
                    onClick={() => expensesProviderValues.setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={expensesProviderValues.currentPage === totalPages || totalPages === 1}
                >
                    Next
                    <i className="material-icons">chevron_right</i>
                </button>               
            </div>
            }           
                                        
        </div>
        </SortContext.Provider>
  
            </React.Fragment>
}
    
export {Expenses}