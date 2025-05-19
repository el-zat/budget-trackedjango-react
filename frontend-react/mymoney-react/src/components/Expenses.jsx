import React, {useContext} from "react"
import  './Expenses.css'
import CurrencyInput from 'react-currency-input-field';
import { ExpensesContext } from "./ExpensesContext";


const Expenses = () => {

    const expensesProviderValues = useContext(ExpensesContext)


    return  <React.Fragment>
        <div className="expenses-wrapper">
            <h2>Expenses</h2>
            <table className="expenses-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Expense</th>                    
                        <th>Date
                            <button className="sort-btn" title="Sort ascending"><i className="fas fa-arrow-up"></i></button>
                            <button className="sort-btn" title="Sort descending"><i className="fas fa-arrow-down"></i></button>
                        </th>
                        <th>Price, €</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    
                    {expensesProviderValues.rows.map((row, idx) => (                       
                        <tr key={row.id || idx}>
                            <td>
                                {
                                    expensesProviderValues.categories.find(
                                        cat => String(cat.id) === String(row.category))?.name 
                                    || 'Unknown'
                                }
                                
                            </td>
                            <td>{row.name}</td>
                            <td>{row.payment_date}</td>
                            <td>
                            {expensesProviderValues.editingId === row.id ? (                           
                                <CurrencyInput id="edit-price"
                                    prefix="€ "
                                    decimalsLimit={2} 
                                    intlConfig={{ locale: 'de-DE', currency: 'EUR' }} 
                                    placeholder="Enter new price"
                                    value={expensesProviderValues.editPrice}
                                    onValueChange={value => expensesProviderValues.setEditPrice(value)}
                                />
                            ) : (
                                <>€ {row.price}</>
                            )}
                            </td>
                            <td>
                                <div className="edit-delete">
                                    <button className="edit-expense"                                    
                                        onClick={() => expensesProviderValues.switchEditSaveExpense(row.id)}>
                                        {expensesProviderValues.editingId === row.id ? "Apply" : "Edit"}
                                    </button> 
                                    <button
                                        className="delete-expense"
                                        onClick={() => expensesProviderValues.deleteExpense(row.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td>
                            <div className="categories-input">
                                <select
                                    value={expensesProviderValues.selectedCategory}
                                    onChange={e => expensesProviderValues.setSelectedCategory(e.target.value)}
                                    required
                                    >
                                    <option value="all">Select Expense</option>
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
                                value={expensesProviderValues.date} 
                                onChange={e => expensesProviderValues.setDate(e.target.value)} 
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
                            <div className="save-btn">
                                <button className="save-btn" 
                                        onClick={expensesProviderValues.handleSave}>Save</button>
                            </div>                            
                        </td>                               
                    </tr>                    
                </tbody>
            </table>
   
            
        </div>
  
            </React.Fragment>
}
    
export {Expenses}