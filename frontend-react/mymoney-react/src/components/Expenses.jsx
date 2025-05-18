import React, {useState, useEffect} from "react"
import  './Expenses.css'
import CurrencyInput from 'react-currency-input-field';


const Expenses = () => {

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);
    const [selectedExpense, setSelectedExpense] = useState('all');
    const [expenses, setExpenses] = useState([]);
    const [date, setDate] = useState(getToday());
    const [price, setPrice] = useState('');
    const [miscExpense, setMiscExpense] = useState('');
    const [rows, setRows] = useState([]);
    const [isEditing, setIsEditing] = useState(false);


    const selectedCategoryObj = categories.find(
        cat => String(cat.id) === String(selectedCategory)
      );


    function getToday() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    const getCleanPrice = (price) => {
        let cleanPrice = price;
        if (typeof cleanPrice === 'string') {
            cleanPrice = cleanPrice.replace(',', '.').replace(/[^\d.]/g, '');
        }
        return cleanPrice;
    }
    

    // Fetch expenses from django server
    const fetchExpenses = async () => {
        const response = await fetch('http://127.0.0.1:8000/api/myexpenses/');
        const data = await response.json();
        console.log("data:", data)
        setRows(data);
    };

    useEffect(() => {
        fetchExpenses();
    }, []);
    

    const handleSave = async (e) => {
        e.preventDefault();

        const selectedCategoryObj = categories.find(cat => String(cat.id) === String(selectedCategory));
        const isMisc = selectedCategoryObj?.name === "Miscellaneous";
        const expenseName = isMisc ? miscExpense : selectedExpense;
        
        if (
            selectedCategory === 'all' ||
            (selectedCategoryObj?.name === "Miscellaneous" ? !miscExpense : selectedExpense === 'all') ||
            !price ||
            !date
          ) {
            alert('Please fill out all fields!');
            return;
          }

        //Send new object to Django server
        const expenseDate = date || getToday();
        const newJangoExpense = {
            category: categories.find(cat => String(cat.id) === String(selectedCategory))?.id || '',
            name: expenseName,
            price: getCleanPrice(price),
            date: expenseDate,
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/myexpenses/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(newJangoExpense),
            });
        
            if (!response.ok) {
              const errorData = await response.json();
              alert('Error!: ' + JSON.stringify(errorData));
              return;
            }

            // After post object, update the table from django server
            await fetchExpenses();

            console.log("date:", date)

            // Reset input fields            
            setSelectedCategory('all');
            setSelectedExpense('all');
            setPrice('');
            setDate(getToday());
        } 
        catch (error) {
            alert(error.message);
        }
    };


    const deleteExpense = async (id) => {
        if (!id) {
          alert('Error: id undefined!');
          return;
        }
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/myexpenses/${id}/`, {
            method: 'DELETE',
          });
      
          if (!response.ok) {
            const errorText = await response.text();
            alert(`Delete error on server! Status: ${response.status}, Message: ${errorText}`);
            return;
          }      
          setRows(rows => rows.filter(row => row.id !== id));
        } 
        catch (error) {
          alert('Error: ' + error.message);
        }

        // Update the table from django server
        await fetchExpenses();
    };


    const handlEditExpense = () => {
        setIsEditing(!isEditing)
    }

    const handleAddDetails = () => {  
    }


    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/categories/')
          .then(res => res.json())
          .then(data => {
            setCategories(data);
          })
          .catch(error => {
            console.error('Fetch error:', error);
          });
      }, []);


    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/expenses/')
          .then(res => res.json())
          .then(data => {
            setExpenses(data);
          })
          .catch(error => {
            console.error('Fetch error:', error);
          });
      }, []);


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
                    {rows.map((row, idx) => (
                        <tr key={row.id || idx}>
                            <td>
                                {
                                    categories.find(cat => String(cat.id) === String(row.category))?.name 
                                    || 'Unknown'
                                }
                            </td>
                            <td>{row.name}</td>
                            <td>{row.payment_date}</td>
                            <td>€ {row.price}</td>
                            <td>
                                <div className="edit-delete">
                                    <button className="edit-expense" onClick={handlEditExpense}>
                                        {isEditing ? "Save" : "Edit"}
                                    </button> 
                                    <button
                                        className="delete-expense"
                                        onClick={() => deleteExpense(row.id)}
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
                                    value={selectedCategory}
                                    defaultValue=''
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    required
                                    >
                                    <option value="all">Select Expense</option>  
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                    </option>
                                    ))}                                 
                                </select>
                            </div>               
                        </td>
                        <td>
                        {selectedCategoryObj?.name === "Miscellaneous" ? (
                            <div className="expenses-input">
                                <input
                                    type="text"
                                    name="miscellaneous-expense"
                                    placeholder="Enter expense"
                                    value={miscExpense}
                                    onChange={e => setMiscExpense(e.target.value)}
                                />
                            </div>
                            ) : (
                            <div className="expenses-select">
                                <select value={selectedExpense} onChange={e => setSelectedExpense(e.target.value)}>
                                <option value="all">Select Expense</option>
                                {expenses
                                    .filter(exp =>
                                    selectedCategory === 'all' ||
                                    String(exp.category) === String(selectedCategory)
                                    )
                                    .map(exp => (
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
                                value={date} 
                                onChange={e => setDate(e.target.value)} 
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
                                    value={price}
                                    onValueChange={(value) => setPrice(value)} 
                                    />
                            </div>                           
                        </td>            
                        
                        <td>
                            <div className="save-btn">
                                <button class="save-btn" onClick={handleSave}>Save</button>
                            </div>                            
                        </td>                               
                    </tr>
                    
                </tbody>
            </table>
   
            <div className="category-summary">
                <h2>Monthly Category Summary</h2>
                <div className="category-row">
                    <div className="cat-header">
                        <span><i className="fas fa-home icon housing"></i> Housing</span>
                        <span className="percent">60%</span>
                    </div>
                    <div className="bar-container">
                        <div className="bar" style={{ width: '60%', background: '#4e89ff' }}></div>
                    </div>
                </div>
                <div className="category-row">
                    <div className="cat-header">
                        <span><i className="fas fa-shopping-basket icon groceries"></i> Groceries</span>
                        <span className="percent">12.5%</span>
                    </div>
                    <div className="bar-container">
                        <div className="bar" style={{ width: '12.5%', background: '#43e97b' }}></div>
                    </div>
                </div>
                <div className="category-row">
                    <div className="cat-header">
                        <span><i className="fas fa-receipt icon taxes"></i> Taxes</span>
                        <span className="percent">15%</span>
                    </div>
                    <div className="bar-container">
                        <div className="bar" style={{ width: '15%', background: '#ffb347' }}></div>
                    </div>
                </div>
            </div>


        </div>
        
   
   
                
            </React.Fragment>

                    


}
    
export {Expenses}