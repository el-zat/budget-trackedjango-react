import React, { useState, useContext, useEffect, useRef} from "react"
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
    useEffect(() => {
        return () => {
            filterProviderValues.setCheckedCategories([]);;
        };
    }, [filterProviderValues.selectedInterval]);


    //Close input editing on mouse click

    const inputRef = useRef(null);
    
    const closeEditing = () => {
        expensesProviderValues.setEditingField({ id: null, field: null });
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
    }, []);


    const sortProviderValues = {
      selectedSort, 
      onSortChange,
    }



    return  <React.Fragment>
        <SortContext.Provider value={sortProviderValues}>
        <div className="expenses-wrapper">
            <div className="expenses-header">
                {authProviderValues.isLoggedIn &&                
                <div className="show-interval">
                    {
                    filterProviderValues.selectedInterval === "month" ? (
                        <p>{filterProviderValues.currentMonth}</p>
                    ) : filterProviderValues.selectedInterval === "year" ? (
                        <p>{filterProviderValues.currentYear}</p>
                    ) : filterProviderValues.selectedInterval === "today" ? (
                        <p>{filterProviderValues.today}</p>
                    ) : filterProviderValues.selectedInterval === "custom" ? (
                        <div className="show-custom-interval">
                            <div className="show-custom">
                                <p>From: </p> {filterProviderValues.formatDate(filterProviderValues.startDate)}
                            </div>
                            <div className="show-custom">
                                <p>To: </p> {filterProviderValues.formatDate(filterProviderValues.endDate)}
                            </div>
                        </div>             
                    ) : null 
                    }
                </div>  
                }

                {!modalProviderValues.isModalSortOpen  && authProviderValues.isLoggedIn &&                              
                    <div className="sort">
                        <button className="sort-btn" 
                            onClick={() => modalProviderValues.setIsModalSortOpen(true)}>
                            <i className="material-icons">sort</i>
                            Sort                   
                        </button> 
                    </div>                                         
                }
                <SortContext.Provider value={sortProviderValues}>
                    <Sort />
                </SortContext.Provider>

                {!filterProviderValues.isFilterOpen  && authProviderValues.isLoggedIn &&
                <button className="filter-btn" 
                    onClick={() => filterProviderValues.setIsFilterOpen(true)}>
                    <i className="material-icons">tune</i>
                    Filter                   
                </button> 
                }
            </div>        
            
            <table className="expenses-table">                
                <thead>
                    {authProviderValues.isLoggedIn &&
                    <tr>                       
                        <th> Category </th>                      
                        <th> Expense </th>                                           
                        <th> Date </th>
                        <th> Price, € </th>
                        <th></th>
                    </tr>
                    }
                </thead>
                
                <tbody>
                    {/* Expenses Table Rendering */}

                    { 
                        !authProviderValues.isLoggedIn ?
                        (
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center", color: "#888" }}>
                                    No data. Please log in
                                </td>
                            </tr>
                        )
                        : (
                            paginatedRows.length ? (                    
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
                                            intlConfig={{ locale: 'de-DE', currency: 'EUR' }} 
                                            placeholder="Enter new price"
                                            ref={inputRef}
                                            value={expensesProviderValues.editPrice}
                                            onBlur={() => expensesProviderValues.setEditingField({ id: null, field: null })}  //No editing on blur
                                            onValueChange={value => expensesProviderValues.setEditPrice(value)}
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
                                        <button className="add-show-description-btn"
                                            onClick={() => {
                                                expensesProviderValues.setIsDescriptionShown(true);
                                                expensesProviderValues.setCurrentDescriptionId(row.id);
                                            }}
                                            >
                                            {expensesProviderValues.descriptionMap[row.id]? "Show description" : "Add description"}
                                        </button>
                                        <button className="delete-expense-btn"
                                        onClick={() => expensesProviderValues.deleteExpense(row.id)}
                                    >
                                        Delete
                                    </button>
                                    
                                    </td>                                
                                </tr>
                            ) 
                            ))
                            : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center", color: "#888" }}>
                                    No data. Please enter expenses  
                                </td>
                            </tr>
                            )
                        )
                    }
                       

                    {/* Input expenses  */}
                    {authProviderValues.isLoggedIn &&
                    <tr>                       
                        <td>                           
                            <div className="categories-input">
                                <select
                                    value={expensesProviderValues.selectedCategory}
                                    onChange={e => expensesProviderValues.setSelectedCategory(e.target.value)}
                                    required
                                    >
                                    <option value="all">Select Category</option>
                                    {Array.isArray(expensesProviderValues.categories) ? (
                                        expensesProviderValues.categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                            </option>
                                        ))
                                        ) : (
                                        <option>Loading...</option> 
                                        )}
                                 
                                </select>
                            </div>               
                        </td>
                      
                        <td>
                        {expensesProviderValues.selectedCategoryObj?.name === "Miscellaneous" ? (
                            <div className="expenses-input">
                                <input
                                    type="text"
                                    name="miscellaneous-expense"
                                    placeholder="Enter expense"
                                    value={expensesProviderValues.miscExpense}
                                    onChange={e => expensesProviderValues.setMiscExpense(e.target.value)}
                                />
                            </div>
                        ) : (
                            <div className="expenses-select">
                                <select 
                                    value={expensesProviderValues.selectedExpense} 
                                    onChange={e => expensesProviderValues.setSelectedExpense(e.target.value)}>
                                    <option value="all">Select Expense</option>
                                    {(Array.isArray(expensesProviderValues.expenses) ? expensesProviderValues.expenses : []).filter(
                                        exp => expensesProviderValues.selectedCategory === 'all' ||
                                            String(exp.category) === String(expensesProviderValues.selectedCategory)
                                        ).map(exp => (
                                        <option key={exp.id} value={exp.name}>{exp.name}</option>
                                    ))}

                                </select>
                            </div>
                            )}
                        </td>   
                        <td>
                            <div className="date-input">
                                <input 
                                    type="date" 
                                    name="paymentDate"
                                    value={expensesProviderValues.paymentDate} 
                                    onChange={e => {expensesProviderValues.setPaymentDate(e.target.value)}} 
                                />
                            </div>                           
                        </td>                                     
                        <td>
                            <div className="euro-input">
                                <CurrencyInput id="euro-input"
                                    name="euro-input"
                                    placeholder="Input Price in Euro"
                                    decimalsLimit={2} 
                                    intlConfig={{ locale: 'de-DE', currency: 'EUR' }} 
                                    prefix="€ "
                                    value={expensesProviderValues.price}
                                    onValueChange={(value) => expensesProviderValues.setPrice(value)} 
                                    />
                            </div>                           
                        </td>                                    
                        <td>
                            <button className="save-btn"
                                onClick={expensesProviderValues.handleSave}>Save
                            </button>                         
                        </td>                             
                    </tr> 
                    }                                                          
                </tbody>               
            </table>
            
            {authProviderValues.isLoggedIn &&    
            <div className="pagination">
                <button
                    onClick={() => expensesProviderValues.setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={expensesProviderValues.currentPage === 1}
                >
                    Prev 
                </button>
                <span> Page {expensesProviderValues.currentPage} of {totalPages > 1 ? totalPages : 1} </span>
                <button
                    onClick={() => expensesProviderValues.setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={expensesProviderValues.currentPage === totalPages || totalPages === 1}
                >
                    Next
                </button>               
            </div>
            }
              
            {authProviderValues.isLoggedIn &&    
            <div className="expenses-total">                               
                <div className="total">Total: € {expensesProviderValues.totalPrice()} </div>
            </div>
            }           
                                        
        </div>
        </SortContext.Provider>
  
            </React.Fragment>
}
    
export {Expenses}