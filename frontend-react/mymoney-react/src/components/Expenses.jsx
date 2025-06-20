import React, { useState, useContext, useEffect} from "react"
import  './Expenses.css'
import CurrencyInput from 'react-currency-input-field';
import { ExpensesContext } from "./ExpensesContext";
import {AuthContext} from './users/AuthContext'


const Expenses = () => {

    const expensesProviderValues = useContext(ExpensesContext)

    const [descriptionMap, setDescriptionMap] = useState(() => {
        const saved = localStorage.getItem('descriptionMap');
        return saved ? JSON.parse(saved) : {};
      });

    useEffect(() => {
        localStorage.setItem('descriptionMap', JSON.stringify(expensesProviderValues.descriptionMap));
      }, [expensesProviderValues.descriptionMap]);

    return  <React.Fragment>
        <div className="expenses-wrapper">
            <div className="expenses-header">
                <h2>Expenses</h2>            
                <div className="total">Total: € {expensesProviderValues.totalPrice()} </div>
            </div>
            
            <table className="expenses-table">                
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Expense</th>                    
                        <th>Date
                            <button 
                                className="sort-btn" 
                                title="Sort ascending"
                                onClick={expensesProviderValues.sortAscending}
                                >
                                    <i className="fas fa-arrow-up"></i>
                            </button>
                            <button 
                                className="sort-btn" 
                                title="Sort descending"
                                onClick={expensesProviderValues.sortDescending}
                                >
                                    <i className="fas fa-arrow-down"></i>
                            </button>
                        </th>
                        <th>Price, €</th>
                        <th></th>
                    </tr>
                </thead>
                
                <tbody>
                    {/* Render Expenses table */}

                    { expensesProviderValues.rows.length ? (                    
                        expensesProviderValues.rows.map((row, idx) => (                                              
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
                                    value={expensesProviderValues.editName || ""}
                                    onChange={e => expensesProviderValues.setEditName(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            expensesProviderValues.applyChanges(row.id, 'name')
                                        }
                                    }}
                                />
                                ) : (
                                <span onClick={() => {
                                    expensesProviderValues.setEditingField({id: row.id, field: 'name'});
                                    expensesProviderValues.setEditName(row.name);
                                }}> {row.name}
                                </span>
                                )}
                            </td>
                            <td>
                            {expensesProviderValues.editingField.id === row.id && expensesProviderValues.editingField.field === 'date' ? (                           
                                <input id="edit-date"
                                    type="date"
                                    value={expensesProviderValues.editDate || ""}
                                    onChange={e => expensesProviderValues.setEditDate(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            expensesProviderValues.applyChanges(row.id, 'date')
                                        }
                                    }}
                                />
                                ) : (
                                <span onClick={() => {
                                    expensesProviderValues.setEditingField({id: row.id, field: 'date'});
                                    expensesProviderValues.setEditDate(row.date);
                                }}> {row.payment_date}
                                </span>
                                )}
                            </td>
                            <td>
                            {expensesProviderValues.editingField.id === row.id && expensesProviderValues.editingField.field === 'price' ? (                           
                                <CurrencyInput id="edit-price"
                                    prefix="€ "
                                    decimalsLimit={2} 
                                    intlConfig={{ locale: 'de-DE', currency: 'EUR' }} 
                                    placeholder="Enter new price"
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
                                    <span onClick={() => {
                                        expensesProviderValues.setEditingField({id: row.id, field: 'price'});
                                        expensesProviderValues.setEditPrice(row.price);
                                    }}>
                                        € {row.price}
                                    </span>
                                )}
                            </td>
                            <td>        
                                <button className="add-show-description"
                                     onClick={() => {
                                        expensesProviderValues.setIsDescriptionShown(true);
                                        expensesProviderValues.setCurrentDescriptionId(row.id);
                                      }}
                                    >
                                    {expensesProviderValues.descriptionMap[row.id]? "Show description" : "Add description"}
                                </button>
                                <button
                                className="delete-expense"
                                onClick={() => expensesProviderValues.deleteExpense(row.id)}
                            >
                                Delete
                            </button>
                            
                            </td>
                        </tr>
                        ) 
                    ))
                    : 
                    <tr>
                        <td colSpan={5} style={{ textAlign: "center", color: "#888" }}>
                            No data. Please log in
                        </td>
                    </tr>
                    }                

                    {/* Input expenses  */}
                    <tr>                           
                        <td>                           
                            <div className="categories-input">
                                <select
                                    value={expensesProviderValues.selectedCategory}
                                    onChange={e => expensesProviderValues.setSelectedCategory(e.target.value)}
                                    required
                                    >
                                    <option value="all">Select Category</option>
                                    console.log('row:', row)  
                                    {expensesProviderValues.categories.map(cat => (
                                        <option 
                                            key={cat.id} 
                                            value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}                                 
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
                                    {expensesProviderValues.expenses.filter(
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
                                     
                </tbody>               
            </table>
                                        
        </div>
  
            </React.Fragment>
}
    
export {Expenses}