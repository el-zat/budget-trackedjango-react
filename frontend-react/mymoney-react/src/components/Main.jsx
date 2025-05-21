import React, {useState, useEffect } from "react"
import { Filter } from "./Filter";
import { Expenses } from "./Expenses";
import { Diagram } from "./Diagram";
import {FilterContext} from './FilterContext'
import {ExpensesContext} from './ExpensesContext'


function Main() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);
    const [selectedExpense, setSelectedExpense] = useState('all');
    const [expenses, setExpenses] = useState([]);
    const [paymentDate, setPaymentDate] = useState(getToday());
    const [price, setPrice] = useState('');
    const [miscExpense, setMiscExpense] = useState('');
    const [rows, setRows] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editPrice, setEditPrice] = useState(price);

    const [selectedInterval, setSelectedInterval] = useState("month");
    const [dateFrom, setDateFrom] = useState(getToday());
    const [dateTo, setDateTo] = useState(getToday());


    function getToday() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function getFirstDayOfMonth() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        return `${yyyy}-${mm}-01`;
    }

    function getFirstDayOfYear() {
        const today = new Date();
        const yyyy = today.getFullYear();
        return `${yyyy}-01-01`;
    }

    const getStartDate = (value) => {
        switch(value) {
          case 'today':
            return getToday();
          case 'custom':
            return dateFrom;
          case 'month':
            return getFirstDayOfMonth();
          case 'year':
            return getFirstDayOfYear();
          default:
            return "";
        }
    };

    const getEndDate = (value) => {
        switch(value) {
            case 'today':
                return getToday();
            case 'custom':
                return dateTo; 
            case 'month':
                return getToday();
            case 'year':
                return getToday();
            default:
                return "";
        }
    };
      
    const startDate = getStartDate(selectedInterval);
    const endDate = getEndDate(selectedInterval);


    function formatDate(value) {
        const d = new Date(value);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }


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
        // console.log("data:", data)
        setRows(data);
    };

    useEffect(() => {
        fetchExpenses();
    }, []);
    

    const handleSave = async (e) => {
        e.preventDefault();

        const isMisc = selectedCategoryObj?.name === "Miscellaneous";
        const expenseName = isMisc ? miscExpense : selectedExpense;

        // Get value of payment date from input
        const paymentDate = document.querySelector('input[name="paymentDate"]')?.value;
        console.log('pyment date from input:', paymentDate)

        if (
            selectedCategory === 'all' ||
            (selectedCategoryObj?.name === "Miscellaneous" ? !miscExpense : selectedExpense === 'all') ||
            !price ||
            !paymentDate
          ) {
            alert('Please fill out all fields!');
            return;
          }

        // Send a new object to Django server
        const newJangoExpense = {
            category: categories.find(cat => String(cat.id) === String(selectedCategory))?.id || '',
            name: expenseName,
            price: getCleanPrice(price),
            payment_date: paymentDate ? paymentDate : getToday(),
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

            console.log("payment date:", paymentDate)

            // Reset input fields            
            setSelectedCategory('all');
            setSelectedExpense('all');
            setPrice('');
            setPaymentDate(getToday());
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


    const applyChanges = async (id) => {
        if (editingId === id) {
            // Save changes
            const expenseToUpdate = rows.find(row => row.id === id);
    
            // Send to server (PATCH)
            await fetch(`http://127.0.0.1:8000/api/myexpenses/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ price: editPrice })
            });
    
            // Update the local table
            setRows(rows.map(row =>
                row.id === id ? { ...row, price: editPrice } : row
            ));
    
            setEditingId(null);
            setEditPrice('');
        } else {
            // Edit price
            const expense = rows.find(row => row.id === id);
            setEditPrice(expense.price);
            setEditingId(id);
        }
    };

    const switchEditSaveExpense = (id) => {
        if (editingId !== id) {
            setEditingId(id);
            const expense = rows.find(row => row.id === id);
            setEditPrice(expense.price);
        } else {
            applyChanges(id);
        }
    };


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


    const handleCategoryFilter = (event) => {
        const value = event.target.value;
        setSelectedCategory(value)
        console.log('selected category:', value)
        const rows = expensesProviderValues.rows || []
        setRows(rows => rows.filter(row =>
            value === 'all' ||
            String(row.category) === String(value)
        ))
    }

    const handleDateFilter = (event) => {
        let filter;
        if (event && event.target && event.target.value) {
            filter = event.target.value;
            setSelectedInterval(filter);
        } else {           
            filter = selectedInterval;
        }
        console.log('selected interval:', filter);
        
        const rows = expensesProviderValues.rows || []

        setRows(rows.filter(row => {
            const rowDate = formatDate(row.payment_date);
            
            switch (filter) {
                case "today":
                    return rowDate === getToday()

                case "month":
                    return (
                        rowDate >= getFirstDayOfMonth() &&
                        rowDate <= getToday()
                    );

                case "year":
                    return (
                        rowDate >= getFirstDayOfYear() &&
                        rowDate <= getToday()
                    );

                case "custom":
                    if (!startDate || !endDate) return true;
                    return (
                        rowDate >= startDate &&
                        rowDate <= endDate
                    );

                default:
                    return true; // No filter, show all
            }
        }));
    }


    const sortAscending = () => {
        console.log('sort ascending')
        setRows(rows.slice().sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date))); 
    }

    const sortDescending = () => {
        console.log('sort descending')
        setRows(rows.slice().sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))); 
    }

    const filterProviderValues = {       
        selectedInterval: selectedInterval,
        dateFrom: dateFrom,
        dateTo: dateTo,       
        startDate: startDate,
        endDate: endDate,       
        categories: categories,
        setSelectedCategory: setSelectedCategory,
        handleCategoryFilter: handleCategoryFilter,
        handleDateFilter: handleDateFilter,
        formatDate: formatDate,
        getToday: getToday,
        getFirstDayOfMonth: getFirstDayOfMonth,
        setSelectedInterval: setSelectedInterval,
        setDateFrom: setDateFrom,
        setDateTo: setDateTo,
    }

    
    const expensesProviderValues = {       
        selectedCategory: selectedCategory,
        categories: categories,
        selectedExpense:selectedExpense,
        expenses: expenses,
        paymentDate: paymentDate,
        price: price,
        miscExpense: miscExpense,
        rows: rows,
        editingId: editingId,
        editPrice: editPrice,
        getToday: getToday,
        getFirstDayOfYear: getFirstDayOfYear,
        switchEditSaveExpense: switchEditSaveExpense,
        applyChanges: applyChanges,
        deleteExpense: deleteExpense,
        handleSave: handleSave,
        setSelectedCategory: setSelectedCategory,
        setSelectedExpense: setSelectedExpense,
        setPrice: setPrice,
        setEditPrice: setEditPrice,
        setSelectedInterval: setSelectedInterval,
        sortAscending: sortAscending,
        sortDescending: sortDescending,
        setPaymentDate: setPaymentDate,
    }


    return  <main>
                <FilterContext.Provider value={filterProviderValues}>
                    <ExpensesContext.Provider value={expensesProviderValues}>
                        <Filter />
                        <Expenses />
                    </ExpensesContext.Provider>
                </FilterContext.Provider>
                
                {/* {<Diagram /> } */}
            </main>
    
}

export {Main}