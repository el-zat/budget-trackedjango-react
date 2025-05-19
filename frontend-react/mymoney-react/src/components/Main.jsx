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
    const [date, setDate] = useState(getToday());
    const [price, setPrice] = useState('');
    const [miscExpense, setMiscExpense] = useState('');
    const [rows, setRows] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editPrice, setEditPrice] = useState(price);

    const [filter, setFilter] = useState("month");
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
          case 'day':
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
            case 'day':
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
      
    const startDate = getStartDate(filter);
    const endDate = getEndDate(filter);


    function formatDate(dateString) {
        const [yyyy, mm, dd] = dateString.toString().split("-");
        return `${dd}.${mm}.${yyyy}`;
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
        
        if (
            selectedCategory === 'all' ||
            (selectedCategoryObj?.name === "Miscellaneous" ? !miscExpense : selectedExpense === 'all') ||
            !price ||
            !date
          ) {
            alert('Please fill out all fields!');
            return;
          }

        // Send a new object to Django server
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



    const handleCategolyFilter = () => {


    }

    const handleDateFilter = () => {

    }

    const filterProviderValues = {       
        filter: filter,
        dateFrom: dateFrom,
        dateTo: dateTo,       
        startDate: startDate,
        endDate: endDate,       
        categories: categories,
        handleCategolyFilter: handleCategolyFilter,
        handleDateFilter: handleDateFilter,
        formatDate: formatDate,
        getToday: getToday,
        getFirstDayOfMonth: getFirstDayOfMonth,
    }

    
    const expensesProviderValues = {       
        selectedCategory: selectedCategory,
        categories: categories,
        selectedExpense:selectedExpense,
        expenses: expenses,
        date:date,
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