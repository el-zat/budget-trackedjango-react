import React, {useState, useEffect} from "react"
import  './Expenses.css'
import CurrencyInput from 'react-currency-input-field';
import ReactTooltip from 'react-tooltip';


const Expenses = () => {

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);
    const [selectedExpense, setSelectedExpense] = useState('all');
    const [expenses, setExpenses] = useState([]);
    const [date, setDate] = useState(getToday());
    const [price, setPrice] = useState('');
    const [rows, setRows] = useState([]);


    function getToday() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }


    const handleSave = async (e) => {
        e.preventDefault();
        
        if (
          selectedCategory === 'all' ||
          selectedExpense === 'all' ||
          !price ||
          !date
        ) {
          alert('Pless fill out all fields!');
          return;
        }

        //Send user data to Django server
        let cleanPrice = price;
        if (typeof cleanPrice === 'string') {
            cleanPrice = cleanPrice.replace(',', '.').replace(/[^\d.]/g, '');
        }

        const newJangoExpense = {
            category: categories.find(cat => String(cat.id) === String(selectedCategory))?.id || '',
            name: selectedExpense,
            price: cleanPrice,
            date: date,
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/myexpenses/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'X-CSRFToken': <token>, // if needed CSRF
            },
            body: JSON.stringify(newJangoExpense),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert('Error!: ' + JSON.stringify(errorData));
                return;
            }
        } catch (error) {
            alert(error.message);
        }

        // Save user data in the table as a string row
        setRows([
            ...rows,
            {
                category: categories.find(cat => String(cat.id) === String(selectedCategory))?.name || '',
                expense: selectedExpense,
                price,
                date,
            },
            ]);
            
        // Reset input fields
        setSelectedCategory('all');
        setSelectedExpense('all');
        setPrice('');
        setDate(getToday());

    };


    
    const handleAddDetails = () => {
    
    }
    const handleDeleteExpense = () => {
    
    }
    const handlEditExpense = () => {
    
    }
    const handleSaveExpense = () => {
    
    }

    // Get data from Django server
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
                    <tr key={idx}>
                        <td>{row.category}</td>
                        <td>{row.expense}
                            {/* <button class="add-details" onClick={handleAddDetails}>Add Details?</button> */}
                        </td> 
                        <td>{row.date}</td>
                        <td>€ {row.price}</td>               
                        <td>
                            <div class edit-delete>
                                <button class="edit-expense" onClick={handlEditExpense}>Edit</button>
                                <button class="delete-expense" onClick={handleDeleteExpense}>Delete</button>
                            </div>
                            
                        </td>
                    </tr>
                    ))}
                    <tr>
                        <td>
                            <div className="categories-input">                                 
                                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                                    <option value="all">Select Category</option>
                                        {categories.map(cat => (
                                            <option 
                                                key={cat.id} 
                                                value={cat.id}
                                                data-tip={cat.description}
                                                >
                                                {cat.name}
                                            </option>
                                        ))}
                                </select>    
                            </div>               
                        </td>
                        <td>
                            <div className="expenses-input">                                 
                                <select value={selectedExpense} onChange={e => setSelectedExpense(e.target.value)}>
                                    <option value="all">Select Expense </option>
                                        {expenses .filter(exp => selectedCategory === 'all' || 
                                            String(exp.category) === String(selectedCategory)).map(exp => (
                                            <option key={exp.id} value={exp.name}> {exp.name} </option>
                                        ))}
                                </select>    
                            </div>
                        </td>   
                        <td>
                            <div className="date-input">
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
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