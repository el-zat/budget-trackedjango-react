import './App.css';
import {Main} from "./components/Main"
import React, {useState, useEffect, useMemo, useCallback  } from "react"
import  './styles/Main.scss'
import {FilterContext} from './context/FilterContext'
import {ExpensesContext} from './context/ExpensesContext'
import {IncomeContext} from './context/IncomeContext'
import {AuthContext} from './context/AuthContext'
import {DescriptionContext} from './context/DescriptionContext'
import { ModalContext } from './context/ModalContext';
import RecurringExpenseModal from './components/RecurringExpenseModal';


function App() {

  //Setting expenses
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState('all');
  const [expenses, setExpenses] = useState([]);
  const [paymentDate, setPaymentDate] = useState(getToday());
  const [price, setPrice] = useState('');
  const [name, setName] = useState('');
  const [miscExpense, setMiscExpense] = useState('');
  const [isExpenseRecurring, setIsExpenseRecurring] = useState(false);
  const [expenseFrequency, setExpenseFrequency] = useState('once');
  const [rows, setRows] = useState([]);
  const [newExpense, setNewExpense] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [receipts, setReceipts] = useState(() => {
    const saved = localStorage.getItem('receipts');
    return saved ? JSON.parse(saved) : {};
  }); // { [expenseId]: { fileName, fileUrl, ... } }
  

  //Description
  const [currentDescriptionId, setCurrentDescriptionId] = useState(null);
  const [isDescriptionShown, setIsDescriptionShown] = useState(false);
  const [descriptionMap, setDescriptionMap] = useState(() => {
      const saved = localStorage.getItem('descriptionMap');
      return saved ? JSON.parse(saved) : {};
    }); // { [id]: true/false }

  
  //Editing
  const [editingField, setEditingField] = useState({ id: null, field: null });
  const [editPrice, setEditPrice] = useState(price);
  const [editDate, setEditDate] = useState(paymentDate);
  const [editName, setEditName] = useState(name);
  const [editFrequency, setEditFrequency] = useState('once');

  //Income
  const [incomes, setIncomes] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [newIncome, setNewIncome] = useState({
    name: '',
    amount: '',
    received_date: getToday(),
    category: '',
    source: '',
    frequency: 'once',
    is_recurring: false
  });
  
  //Income Editing
  const [editingIncomeField, setEditingIncomeField] = useState({ id: null, field: null });
  const [editIncomeName, setEditIncomeName] = useState('');
  const [editIncomeAmount, setEditIncomeAmount] = useState('');
  const [editIncomeDate, setEditIncomeDate] = useState('');
  const [editIncomeCategory, setEditIncomeCategory] = useState('');
  const [editIncomeSource, setEditIncomeSource] = useState('');
  const [editIncomeFrequency, setEditIncomeFrequency] = useState('');
  const [editIncomeRecurring, setEditIncomeRecurring] = useState(false);
  
  //Authorization
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loginUsername, setLoginUsername] = useState(localStorage.getItem('loginUsername') || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginValue, setLoginValue] = useState('');
  const [isSignupMessageShown, setIsSignupMessageShown] = useState(true);
  const [registrationUsername, setRegistrationUsername] = useState('');

  //Filtering
  const [isFilterOpen, setIsFilterOpen] = useState(() => {
      const saved = localStorage.getItem('isFilterOpen');
      return saved !== null ? JSON.parse(saved) : false;
    });

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [checkedCategories, setCheckedCategories] = useState([]);
  const [checkedExpenses, setCheckedExpenses] = useState([]);
  const [selectedInterval, setSelectedInterval] = useState('month')
  const [customLabel, setCustomLabel] = useState('');
  const [searchWord, setSearchWord] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceError, setPriceError] = useState('');
  const [filteredRowsByDate, setFilteredRowsByDate] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);


  //Modal
  const [isModalSortOpen, setIsModalSortOpen] = useState(false);
  const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);
  const [isModalRegistrationOpen, setIsModalRegistrationOpen] = useState(false);
  const [isModalCustomDateOpen, setIsModalCustomDateOpen] = useState(false);
  const [isModalRecurringOpen, setIsModalRecurringOpen] = useState(false);
  const [selectedExpenseForRecurring, setSelectedExpenseForRecurring] = useState(null);

  // Get token
  function getAuthHeaders() {
    const token = localStorage.getItem('token');
    console.log("Current auth token:", token);
    if (!token || token === 'undefined') {
      return { 'Content-Type': 'application/json' };
    }
    return {
      'Authorization': 'Token ' + token,
      'Content-Type': 'application/json',
    };
  }
  

  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem('token');
      console.log("Token for auth:", token);
  
      if (token) {
        fetch('/api/categories/', {
          headers: getAuthHeaders(),
        })
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(console.error);
      } else {
        console.warn("No token - skipping fetch categories");
      }
    }
  }, [isLoggedIn]);

  //Fetch expenses from django server
  const fetchExpenses = async () => {
    try {
      // Fetch regular expenses
      const myExpensesResponse = await fetch('/api/myexpenses/', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const myExpensesData = await myExpensesResponse.json();
      const myExpenses = Array.isArray(myExpensesData) ? myExpensesData : [];

      // Fetch recurring expenses
      const recurringExpensesResponse = await fetch('/api/recurringexpenses/', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const recurringExpensesData = await recurringExpensesResponse.json();
      const recurringExpenses = Array.isArray(recurringExpensesData) ? recurringExpensesData : [];

      // Transform recurring expenses to match the expected format
      const transformedRecurring = recurringExpenses.map(expense => ({
        ...expense,
        payment_date: expense.start_date, // Use start_date as payment_date for display
        is_recurring: true,
        __isRecurringExpense: true // Flag to identify this is from RecurringExpense table
      }));

      // Combine both arrays
      const allExpenses = [...myExpenses, ...transformedRecurring];
      setRows(allExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setRows([]);
    }
  };

  //Fetch incomes from django server
  const fetchIncomes = async () => {
    try {
      const response = await fetch('/api/incomes/', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setIncomes(data);
      }
    } catch (error) {
      console.error('Error fetching incomes:', error);
    }
  };

  const fetchIncomeCategories = async () => {
    try {
      const response = await fetch('/api/incomecategories/', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setIncomeCategories(data);
      }
    } catch (error) {
      console.error('Error fetching income categories:', error);
    }
  };

  const addIncome = async () => {
    try {
      console.log('Sending income data:', newIncome);
      const incomeData = {
        ...newIncome,
        amount: getCleanPrice(newIncome.amount)
      };
      const response = await fetch('/api/incomes/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(incomeData)
      });
      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (response.ok) {
        await fetchIncomes();
        setNewIncome({
          name: '',
          amount: '',
          received_date: getToday(),
          category: '',
          source: '',
          frequency: 'once',
          is_recurring: false
        });
      } else {
        console.error('Failed to add income:', responseData);
        alert('Failed to add income: ' + JSON.stringify(responseData));
      }
    } catch (error) {
      console.error('Error adding income:', error);
      alert('Error adding income: ' + error.message);
    }
  };

  const deleteIncome = async (id) => {
    try {
      const response = await fetch(`/api/incomes/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        await fetchIncomes();
      }
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const applyIncomeChanges = async (id, field) => {
    if (editingIncomeField.id === id) {
      let bodyData = {};
      if (field === 'name') {
        bodyData = { name: editIncomeName };
      } else if (field === 'amount') {
        const amountValue = getCleanPrice(editIncomeAmount);
        if (isNaN(amountValue) || amountValue === 0) {
          alert('Invalid amount');
          return;
        }
        bodyData = { amount: amountValue };
      } else if (field === 'date') {
        bodyData = { received_date: editIncomeDate };
      } else if (field === 'category') {
        bodyData = { category: editIncomeCategory };
      } else if (field === 'source') {
        bodyData = { source: editIncomeSource };
      } else if (field === 'frequency') {
        bodyData = { frequency: editIncomeFrequency };
      } else if (field === 'is_recurring') {
        bodyData = { is_recurring: editIncomeRecurring };
      }

      try {
        const response = await fetch(`/api/incomes/${id}/`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(bodyData)
        });
        const result = await response.json().catch(() => ({}));
        console.log('Income update response:', response.status, result);

        if (response.ok) {
          // Update local state
          setIncomes(incomes.map(income =>
            income.id === id ? { ...income, ...bodyData } : income
          ));
          setEditingIncomeField({ id: null, field: null });
          setEditIncomeName('');
          setEditIncomeAmount('');
          setEditIncomeDate('');
          setEditIncomeCategory('');
          setEditIncomeSource('');
          setEditIncomeFrequency('');
          setEditIncomeRecurring(false);
        }
      } catch (error) {
        console.error('Error updating income:', error);
      }
    }
  };
  

  //Inintial state (logged out)
  useEffect(() => {
      if (isLoggedIn) {
          fetchExpenses();
          fetchIncomes();
          fetchIncomeCategories();
      } else {
          setRows([]); // Empty table when logged out
          setIncomes([]);
      }
      }, [isLoggedIn]);

    
    
  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/expenses/', {
          headers: getAuthHeaders(),
      })
          .then(res => res.json())
          .then(data => {
              setExpenses(data);
          })
          .catch(error => {
              console.error('Fetch error:', error);
          });
      }
  }, [isLoggedIn]);

 
  useEffect(() => {
      localStorage.setItem('isFilterOpen', JSON.stringify(isFilterOpen));
  }, [isFilterOpen]);


  useEffect(() => {
      const savedIsOpen = JSON.parse(localStorage.getItem('isFilterOpen'));
      if (savedIsOpen !== null) {
          setIsFilterOpen(savedIsOpen);
      } else {
          setIsFilterOpen(false);
      }
    }, []);



  useEffect(() => {
      if (isLoggedIn) {
          setSelectedInterval('month');          
      }
    }, [isLoggedIn]);


  useEffect(() => {
      const savedInterval = localStorage.getItem('selectedInterval') || "month";
      setSelectedInterval(savedInterval);
  }, []);
  

  useEffect(() => {
      localStorage.setItem('selectedInterval', selectedInterval);
  }, [selectedInterval]);

  useEffect(() => {
      localStorage.setItem('receipts', JSON.stringify(receipts));
  }, [receipts]);

  // Reset selectedExpense when category changes
  useEffect(() => {
      setSelectedExpense('all');
  }, [selectedCategory]);


  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }
   

  const totalPrice = () => {      
      if (isLoggedIn && Array.isArray(filteredRows)) {
          return filteredRows.reduce((prevTotal, row) => {
              const price = Number(row.price) || 0;
              return prevTotal + price;
          }, 0)
      } 
      else { return ''}
  }

  const allRowsTotalPrice = () => {      
      if (isLoggedIn && Array.isArray(rows)) {
          return rows.reduce((prevTotal, row) => {
              const price = Number(row.price) || 0;
              return prevTotal + price;
          }, 0)
      } 
      else { return 0}
  }

  const monthlyTotalPrice = () => {      
      if (isLoggedIn && Array.isArray(rows)) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          return rows.reduce((prevTotal, row) => {
              const rowDate = new Date(row.payment_date);
              if (rowDate >= start && rowDate <= end) {
                  const price = Number(row.price) || 0;
                  return prevTotal + price;
              }
              return prevTotal;
          }, 0)
      } 
      else { return 0 }
  }


  function getCurrentMonth() {
    const today = new Date();
    const month = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();
    return `${month} ${year}`;
  }

  function getCurrentYear() {
    const today = new Date();
    const year = today.getFullYear();
    return `${year}`;
  }

  function getToday() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function getTodayFormatted() {
    const today = new Date();
    const day = today.getDate();
    const year = today.getFullYear();
    const month = today.toLocaleString('en-US', { month: 'long' });
    return `${day} ${month} ${year}`;
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
          // If dateFrom is set (from calendar), use it
          return dateFrom || getFirstDayOfMonth();
        case 'year':
          // If dateFrom is set (from calendar), use it
          return dateFrom || getFirstDayOfYear();
        case 'all':
          return "";
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
              // If dateTo is set (from calendar), use it
              return dateTo || getToday();
          case 'year':
              // If dateTo is set (from calendar), use it
              return dateTo || getToday();
          case 'all':
              return "";
          default:
              return "";
      }
  };
    
  const startDate = getStartDate(selectedInterval);
  const endDate = getEndDate(selectedInterval);
  const today = getToday(selectedInterval);
  const todayFormatted = getTodayFormatted();
  const currentMonth = getCurrentMonth(selectedInterval);
  const currentYear = getCurrentYear(selectedInterval);


  function formatDate(value) {
      if (!value) return "";
      const d = new Date(value);
      const day = d.getDate();
      const year = d.getFullYear();
      const month = d.toLocaleDateString('en-US', { month: 'long' });
      return `${day} ${month} ${year}`;
  }


  const selectedCategoryObj = Array.isArray(categories) 
    ? categories.find(cat => String(cat.id) === String(selectedCategory))
    : null;


  const getCleanPrice = (price) => {
      if (!price || price === '' || price === null || price === undefined) {
          return 0;
      }
      let cleanPrice = String(price).trim();
      
      // CurrencyInput returns clean format, but handle all cases
      if (typeof cleanPrice === 'string') {
          // Count occurrences of comma and dot
          const lastComma = cleanPrice.lastIndexOf(',');
          const lastDot = cleanPrice.lastIndexOf('.');
          
          // Both comma and dot present - determine which is decimal separator
          if (lastComma !== -1 && lastDot !== -1) {
              if (lastComma > lastDot) {
                  // European format: "1.234,56" -> remove dots, replace comma with dot
                  cleanPrice = cleanPrice.replace(/\./g, '').replace(',', '.');
              } else {
                  // American format: "1,234.56" -> remove commas
                  cleanPrice = cleanPrice.replace(/,/g, '');
              }
          } 
          // Only comma present - treat as decimal separator
          else if (lastComma !== -1) {
              cleanPrice = cleanPrice.replace(',', '.');
          }
          // Only dot present or neither - leave as is
      }
      
      const parsed = Number(cleanPrice);
      return isNaN(parsed) ? 0 : parsed;
  }


  //Login, authorization

  const handleLogin = async (e) => {
      e.preventDefault();

      setMessage('');

      const loginPayload = {
        login: loginValue,
        password: loginPassword,
      };

      console.log("login value: ",loginValue)
              
      try {
          const response = await fetch('/api/login/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json', 
            },  
            credentials: 'include',
            body: JSON.stringify(loginPayload),
          });
    
        if (response.ok) {
          const data = await response.json(); //Get username from response
          console.log("Login response data:", data);
          localStorage.setItem('token', data.token);  //Save token in local storage
          setMessage('Login successful!');
          setIsSignupMessageShown(false);
          setLoginEmail(data.email);            
          setLoginUsername(data.username);
          console.log("username from response:", data.username)
          localStorage.setItem('loginUsername', data.username);
          localStorage.setItem('loginEmail', data.email);
          filterProviderValues.setSelectedInterval('month')
          filterProviderValues.setIsFilterOpen(false);
          
          setTimeout(() => {
            setIsLoggedIn(true);             
            setIsModalSortOpen(false);     
            localStorage.setItem('isLoggedIn', 'true');
            setMessage(''); 
            setIsModalLoginOpen(false)
          
          }, 1000); // wait 1.5 sec and thean close the modal
  
        } else {
          const data = await response.json();
          console.log("No response");
          console.log("Full response data:", data); 
          if (data.error) {
            setMessage(data.error);
            console.log("Error:", data.error);
          } else if (
            data.detail &&
            (data.detail.includes('not found') || data.detail.includes('User not found'))
          ) {
            setMessage(
              <>
                User not found.{' '}
                <span
                  style={{ color: 'blue', cursor: 'pointer' }}
                  onClick={() => {
                    setIsModalLoginOpen(false);
                    setIsModalRegistrationOpen(true);
                  }}
                >
                  Sign up?
                </span>
              </>
            );
          } else {
            setMessage('Login failed!');
          }
        }
      } catch (error) {
        setMessage('Server error: ' + error.message);
      }
  };


  //Restore the state when loading the page
  useEffect(() => {
      const loggedIn = localStorage.getItem('isLoggedIn');
      const storedUsername = localStorage.getItem('loginUsername'); // Get username from localStorage
      if (loggedIn === 'true' && storedUsername) {
          setIsLoggedIn(true);
          setLoginUsername(storedUsername); // Set username from localStorage
      } else {
          setIsLoggedIn(false);
          setLoginUsername('');
      }
  }, []);
  
  
  useEffect(() => {
    console.log('isLoggedIn changed:', isLoggedIn);
  }, [isLoggedIn]);

  
  useEffect(() => {
    console.log("loginUsername updated:", loginUsername);
  }, [loginUsername]);


  useEffect(() => {
    const storedEmail = localStorage.getItem('loginEmail');
    console.log("login email", loginEmail)
    if (storedEmail) {
      setLoginEmail(storedEmail);
    }
  }, []);
  

  const handleSave = async (e) => {
    console.log(isLoggedIn)
    await fetchExpenses();
    if (!isLoggedIn) {
        alert('Your entries will not be saved! Please log in');
        return;
    }

    //Validation and creation of newJangoExpense    
    const selectedCategoryObj = categories.find(
        cat => String(cat.id) === String(selectedCategory)
    );

    const isMisc = selectedCategoryObj?.name === "Miscellaneous";
    const expenseName = isMisc ? miscExpense : selectedExpense;

    if (
        selectedCategory === 'all' ||
        (selectedCategoryObj?.name === "Miscellaneous" ? !miscExpense : selectedExpense === 'all') ||
        !price ||
        !paymentDate
    ) {
        alert('Please fill out all fields!');
        return;
    }

    if (isLoggedIn) {
      try {
        let response, data, newRecord;
        
        // If frequency is not 'once', create a RecurringExpense
        if (expenseFrequency !== 'once') {
          const recurringExpenseData = {
            category: selectedCategoryObj?.id || '',
            name: expenseName,
            price: getCleanPrice(price),
            frequency: expenseFrequency,
            start_date: paymentDate ? paymentDate : getToday(),
            next_occurrence: paymentDate ? paymentDate : getToday(),
            is_active: true
          };

          response = await fetch('/api/recurringexpenses/', {
            method: 'POST',
            credentials: 'include',
            headers: getAuthHeaders(),
            body: JSON.stringify(recurringExpenseData),
          });
        } else {
          // Otherwise, create a regular MyExpense
          const newJangoExpense = {
            user_email: loginEmail,
            category: selectedCategoryObj?.id || '',
            name: expenseName,
            price: getCleanPrice(price),
            payment_date: paymentDate ? paymentDate : getToday(),
            frequency: expenseFrequency
          };

          response = await fetch('/api/myexpenses/', {
            method: 'POST',
            credentials: 'include',
            headers: getAuthHeaders(),
            body: JSON.stringify(newJangoExpense),
          });
        }

        data = await response.json();

        if (!response.ok) {
            alert('Error!: ' + JSON.stringify(data));
            return;
        }

        newRecord = data;
        console.log('Created expense:', newRecord);
        console.log('Expense frequency:', newRecord.frequency);

        await fetchExpenses();

        // After updating the list, searching for the index of the added entry
        const newRecordIndex = filterProviderValues.filteredRows.findIndex(row => row.id === newRecord.id);

        if (newRecordIndex !== -1) {
        const rowsPerPage = 5;
        const newPage = Math.floor(newRecordIndex / rowsPerPage) + 1;
        setCurrentPage(newPage);
        }               

      } 
      catch (error) {
          alert(error.message);
      }
    }

    // Clear form
    setSelectedCategory('all');
    setSelectedExpense('all');
    setName('');
    setPrice('');
    setPaymentDate(getToday());
    setIsExpenseRecurring(false);
    setExpenseFrequency('once');
  }

  useEffect(() => {
      if (newExpense && filteredRows.length > 0) {
        const index = filteredRows.findIndex(row => row.id === newExpense.id);
        if (index !== -1) {
          const rowsPerPage = 5;
          const page = Math.floor(index / rowsPerPage) + 1;
          setCurrentPage(page);
          setNewExpense(null); 
        }
      }
    }, [filteredRows, newExpense]);
      

  const deleteExpense = async (id) => { 
    if (!id) {
      alert('Error: id undefined!');
      return;
    }
    try {
      // Find the expense to determine which endpoint to use
      const expense = rows.find(row => row.id === id);
      if (!expense) {
        alert('Error: expense not found!');
        return;
      }

      // Determine the correct endpoint based on whether it's a recurring expense
      const endpoint = expense.__isRecurringExpense 
        ? `/api/recurringexpenses/${id}/` 
        : `/api/myexpenses/${id}/`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        alert(`Delete error on server! Status: ${response.status}, Message: ${errorText}`);
        return;
      }      
      
      // Update the table from django server
      await fetchExpenses();
    } 
    catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const copyExpense = async (id) => {
    if (!id) {
      alert('Error: id undefined!');
      return;
    }
    
    // Find the expense to copy
    const expenseToCopy = rows.find(row => row.id === id);
    if (!expenseToCopy) {
      alert('Expense not found!');
      return;
    }

    // Create a new expense with the same data but current date
    const newExpenseData = {
      user_email: loginEmail,
      category: expenseToCopy.category,
      name: expenseToCopy.name,
      price: expenseToCopy.price,
      payment_date: getToday(),
      frequency: 'once' // Don't copy recurring frequency
    };

    try {
      const response = await fetch('/api/myexpenses/', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(newExpenseData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert('Error copying expense: ' + JSON.stringify(data));
        return;
      }

      // Refresh expenses list
      await fetchExpenses();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const createRecurringExpense = async (expenseId, frequency, startDate) => {
    const expense = rows.find(row => row.id === expenseId);
    if (!expense) {
      alert('Expense not found!');
      return;
    }

    try {
      const bodyData = {
        name: expense.name,
        description: expense.description || '',
        price: expense.price,
        quantity: expense.quantity,
        category: expense.category,
        frequency: frequency,
        start_date: startDate,
        next_occurrence: startDate,
        is_active: true
      };

      const response = await fetch('/api/recurringexpenses/', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert(`Error creating recurring expense! Status: ${response.status}, Message: ${errorText}`);
        return;
      }

      const result = await response.json();
      console.log('Recurring expense created:', result);
      
      // Update the original expense frequency (is_recurring will be calculated automatically)
      await fetch(`/api/myexpenses/${expenseId}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ frequency: frequency })
      });

      // Fetch updated data to ensure is_recurring is synced
      const updatedResponse = await fetch(`/api/myexpenses/${expenseId}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const updatedExpense = await updatedResponse.json();

      // Update local state with the server response
      setRows(rows.map(row =>
        row.id === expenseId ? updatedExpense : row
      ));

      alert('Recurring expense created successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  //Update editDate after paymentDate was updated
  useEffect(() => {
      setEditDate(paymentDate);
    }, [paymentDate]);


  const applyChanges = async (id, field, value = null) => {
    // Find the expense to determine which endpoint to use
    const expense = rows.find(row => row.id === id);
    if (!expense) {
      alert('Error: expense not found!');
      return;
    }

    const isRecurringExpense = expense.__isRecurringExpense;
    
    // Edit name, price, date or frequency     
    let bodyData = {};
    if (field === 'price') {
        const priceValue = getCleanPrice(value !== null ? value : editPrice);
        bodyData = { price: priceValue };
    } 
    else if (field === 'date') {
        // For recurring expenses, use start_date; for regular expenses, use payment_date
        const dateField = isRecurringExpense ? 'start_date' : 'payment_date';
        bodyData = { [dateField]: value !== null ? value : editDate };
    }
    else if (field === 'name') {
        bodyData = { name: value !== null ? value : editName};
    }
    else if (field === 'frequency') {
        const newFrequency = value !== null ? value : editFrequency;
        console.log('Updating frequency to:', newFrequency, 'for expense:', id);
        
        // Check if we need to move between tables
        const needsToBeRecurring = newFrequency !== 'once';
        const isCurrentlyRecurring = isRecurringExpense;
        
        if (needsToBeRecurring && !isCurrentlyRecurring) {
          // Moving from MyExpense to RecurringExpense
          console.log('Moving expense from MyExpense to RecurringExpense');
          
          const recurringData = {
            name: expense.name,
            description: expense.description || '',
            price: expense.price,
            quantity: expense.quantity || 0,
            category: expense.category,
            frequency: newFrequency,
            start_date: expense.payment_date,
            next_occurrence: expense.payment_date,
            is_active: true
          };
          
          // Create in RecurringExpense
          const createResponse = await fetch('/api/recurringexpenses/', {
            method: 'POST',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(recurringData)
          });
          
          if (!createResponse.ok) {
            alert('Error moving expense to recurring!');
            return;
          }
          
          // Delete from MyExpense
          await fetch(`/api/myexpenses/${id}/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: getAuthHeaders(),
          });
          
          // Refresh data
          await fetchExpenses();
          setEditingField({id: null, field: null});
          setEditPrice('');
          setEditDate('');
          setEditFrequency('once');
          return;
          
        } else if (!needsToBeRecurring && isCurrentlyRecurring) {
          // Moving from RecurringExpense to MyExpense
          console.log('Moving expense from RecurringExpense to MyExpense');
          
          const myExpenseData = {
            name: expense.name,
            description: expense.description || '',
            price: expense.price,
            quantity: expense.quantity || 0,
            category: expense.category,
            payment_date: expense.payment_date || expense.start_date,
            frequency: 'once'
          };
          
          // Create in MyExpense
          const createResponse = await fetch('/api/myexpenses/', {
            method: 'POST',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(myExpenseData)
          });
          
          if (!createResponse.ok) {
            alert('Error moving expense to one-time!');
            return;
          }
          
          // Delete from RecurringExpense
          await fetch(`/api/recurringexpenses/${id}/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: getAuthHeaders(),
          });
          
          // Refresh data
          await fetchExpenses();
          setEditingField({id: null, field: null});
          setEditPrice('');
          setEditDate('');
          setEditFrequency('once');
          return;
          
        } else {
          // Just update frequency in the same table
          bodyData = { frequency: newFrequency };
        }
    }
      
      // Determine the correct endpoint based on whether it's a recurring expense
      const endpoint = isRecurringExpense 
        ? `/api/recurringexpenses/${id}/` 
        : `/api/myexpenses/${id}/`;

      // Send to server (PATCH)
      const response = await fetch(endpoint, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(bodyData)
      });
      const result = await response.json().catch(() => ({}));
      console.log('Server response:', response.status, result);

      // Update the local table with server response (to ensure we have the actual saved data)
      if (response.ok && result) {
          // For recurring expenses, also set payment_date from start_date for display
          const updatedData = isRecurringExpense && result.start_date 
            ? { ...result, payment_date: result.start_date, __isRecurringExpense: true }
            : result;
            
          setRows(rows.map(row =>
              row.id === id ? { ...row, ...updatedData } : row
          ));
      } else {
          // Fallback to bodyData if no result
          setRows(rows.map(row =>
              row.id === id ? { ...row, ...bodyData } : row
          ));
      }

      setEditingField({id: null, field: null});
      setEditPrice('');
      setEditDate('');
      setEditFrequency('once');
  };


  //Description 

  const handleAddDescription = () => {          
      setIsDescriptionShown(true)
  }

  const closeDescription = () => {
      setIsDescriptionShown(false)
  }

  const attachReceipt = (expenseId, file) => {
    if (!file) return;
    
    // Create a URL for preview (in real app, you'd upload to server)
    const fileUrl = URL.createObjectURL(file);
    
    setReceipts(prev => ({
      ...prev,
      [expenseId]: {
        fileName: file.name,
        fileUrl: fileUrl,
        fileType: file.type,
        fileSize: file.size,
        attachedAt: new Date().toISOString()
      }
    }));
  };

  const removeReceipt = (expenseId) => {
    setReceipts(prev => {
      const updated = { ...prev };
      if (updated[expenseId]?.fileUrl) {
        URL.revokeObjectURL(updated[expenseId].fileUrl);
      }
      delete updated[expenseId];
      return updated;
    });
  };

  const setHasDescription = (id, value) => {
      console.log('setHasDescription called with:', id, typeof id);
      setDescriptionMap(prev => ({ ...prev, [id]: value }));
  };


  //Filtering

  const allRows = useMemo(() => {
      return rows || [];
    }, [rows]);


  const categoriesMap = Array.isArray(categories)
    ? categories.reduce((acc, category) => {
        acc[category.id] = category;
        return acc;
      }, {})
    : {};
  


  const filterRowsByDate = (rows, selectedInterval, startDate, endDate) => {
    if (!rows.length) return [];
    
    return rows.filter(row => {
        const rowDate = new Date(row.payment_date);
        const today = new Date();
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1); // 1.January
        const lastDayOfYear = new Date(today.getFullYear(), 11, 31)
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        // Check if expense is recurring (support both new frequency field and old is_recurring field)
        const frequency = row.frequency;
        const isRecurring = (frequency && frequency !== 'once') || row.is_recurring;
        
        // For recurring expenses, check if they should appear in current period
        if (isRecurring) {
            // For "all" interval, show all recurring expenses (no filtering by month)
            if (selectedInterval === 'all') {
                return true;
            }
            
            // For old is_recurring without frequency, show in all months (monthly by default)
            if (row.is_recurring && !frequency) {
                return true;
            }
            
            const paymentDate = new Date(row.payment_date);
            const paymentMonth = paymentDate.getMonth(); // 0-11
            
            // Determine the current viewing period
            let currentPeriodDate;
            if (startDate) {
                currentPeriodDate = new Date(startDate);
            } else {
                currentPeriodDate = today;
            }
            const currentMonth = currentPeriodDate.getMonth(); // 0-11
            
            if (frequency === 'monthly') {
                // Show every month
                return true;
            } else if (frequency === 'quarterly') {
                // Show only in months that are in the same quarter cycle
                // If payment was in January (0), show in Jan(0), Apr(3), Jul(6), Oct(9)
                const monthDiff = (currentMonth - paymentMonth + 12) % 12;
                return monthDiff % 3 === 0;
            } else if (frequency === 'yearly') {
                // Show only in the same month as original payment
                return currentMonth === paymentMonth;
            }
            
            // If frequency is not recognized, don't show
            return false;
        }
        
        // For one-time expenses, filter by date
        switch (selectedInterval) {
            case "today":
                return (
                rowDate.getFullYear() === today.getFullYear() &&
                rowDate.getMonth() === today.getMonth() &&
                rowDate.getDate() === today.getDate()
                );
            case "year":
                // If startDate and endDate are set (from calendar), use them
                if (startDate && endDate) {
                    return new Date(rowDate) >= new Date(startDate) && new Date(rowDate) <= new Date(endDate);
                }
                return rowDate >= firstDayOfYear && rowDate <= lastDayOfYear;
            case "month":
                // If startDate and endDate are set (from calendar), use them
                if (startDate && endDate) {
                    return new Date(rowDate) >= new Date(startDate) && new Date(rowDate) <= new Date(endDate);
                }
                return rowDate >= firstDayOfMonth && rowDate <= lastDayOfMonth;
            case "custom":
                if (!startDate || !endDate) return true;
                return new Date(rowDate) >= new Date(startDate) && new Date(rowDate) <= new Date(endDate);
            case "all":
                return true;
            default:
                return rowDate >= firstDayOfMonth && rowDate <= today;
        }
    });    
  };
      

  const handleDateFilter = (selectedInterval) => {
      const filtered = filterRowsByDate(allRows, selectedInterval, startDate, endDate);
      setFilteredRowsByDate(filtered);
  };


  useEffect(() => {
      if (selectedInterval && allRows.length) {
          handleDateFilter(selectedInterval)
      }
    }, [selectedInterval, allRows, startDate, endDate]);

  // Filter incomes by date
  useEffect(() => {
      if (incomes.length === 0) {
          setFilteredIncomes([]);
          return;
      }

      const filtered = incomes.filter(income => {
          // Always show recurring incomes
          if (income.is_recurring || (income.frequency && income.frequency !== 'once')) {
              return true;
          }

          const incomeDate = new Date(income.received_date);
          const today = new Date();
          const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
          const lastDayOfYear = new Date(today.getFullYear(), 11, 31);
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

          switch (selectedInterval) {
              case "today":
                  return (
                      incomeDate.getFullYear() === today.getFullYear() &&
                      incomeDate.getMonth() === today.getMonth() &&
                      incomeDate.getDate() === today.getDate()
                  );
              case "year":
                  // If startDate and endDate are set (from calendar), use them
                  if (startDate && endDate) {
                      return new Date(incomeDate) >= new Date(startDate) && new Date(incomeDate) <= new Date(endDate);
                  }
                  return incomeDate >= firstDayOfYear && incomeDate <= lastDayOfYear;
              case "month":
                  // If startDate and endDate are set (from calendar), use them
                  if (startDate && endDate) {
                      return new Date(incomeDate) >= new Date(startDate) && new Date(incomeDate) <= new Date(endDate);
                  }
                  return incomeDate >= firstDayOfMonth && incomeDate <= lastDayOfMonth;
              case "custom":
                  if (!startDate || !endDate) return true;
                  return new Date(incomeDate) >= new Date(startDate) && new Date(incomeDate) <= new Date(endDate);
              case "all":
                  return true;
              default:
                  return incomeDate >= firstDayOfMonth && incomeDate <= today;
          }
      });

      setFilteredIncomes(filtered);
  }, [selectedInterval, incomes, startDate, endDate]);

  
  //filteredRows must depend on filteredRowsByDate:
  useEffect(() => {
      setFilteredRows(filteredRowsByDate);
  }, [filteredRowsByDate]);


  const handleCategoryCheckbox = (checkedID) => {
      console.log("filteredRowsByDate:", filteredRowsByDate)
      console.log("filteredRows:", filteredRows)
      if (!checkedID) {
          console.warn("checkedCategory.id is undefined", checkedID);
          return;
        }
      let newChecked = [];
      if (checkedCategories.includes(checkedID)) {
          newChecked = checkedCategories.filter(id => id !== checkedID);
      } else {
          newChecked = [...checkedCategories, checkedID];
      }
      setCheckedCategories(newChecked);
      console.log("new checked: ", newChecked)

      const rowsToFilter = filteredRowsByDate.length ? filteredRowsByDate : expensesProviderValues.rows || [];

      const filtered = rowsToFilter.filter(row => {
          const categoryMatch = newChecked.length === 0 || newChecked.map(String).includes(String(row.category));
          const expenseMatch = checkedExpenses.length === 0 || checkedExpenses.includes(row.name);
          const priceMatch = filterByPrice(row);
          return categoryMatch && expenseMatch && priceMatch;
      });
      setFilteredRows(filtered);

      console.log("rows:", filteredRows)
  };


  const handleAllCategories = () => {
      setCheckedCategories([]);
      
      // Apply filters immediately with empty categories array
      const rowsToFilter = filteredRowsByDate.length ? filteredRowsByDate : rows || [];
      
      const filtered = rowsToFilter.filter(row => {
          const categoryMatch = true; // Empty array means all categories
          const expenseMatch = checkedExpenses.length === 0 || checkedExpenses.includes(row.name);
          const priceMatch = filterByPrice(row);
          return categoryMatch && expenseMatch && priceMatch;
      });
      
      setFilteredRows(filtered);
  };

  const handleExpenseCheckbox = (checkedExpenseName) => {
      if (!checkedExpenseName) {
          console.warn("checkedExpenseName is undefined", checkedExpenseName);
          return;
        }
      let newChecked = [];
      if (checkedExpenses.includes(checkedExpenseName)) {
          newChecked = checkedExpenses.filter(name => name !== checkedExpenseName);
      } else {
          newChecked = [...checkedExpenses, checkedExpenseName];
      }
      setCheckedExpenses(newChecked);
      console.log("new checked expenses: ", newChecked)

      const rowsToFilter = filteredRowsByDate.length ? filteredRowsByDate : expensesProviderValues.rows || [];

      const filtered = rowsToFilter.filter(row => {
          const categoryMatch = checkedCategories.length === 0 || checkedCategories.map(String).includes(String(row.category));
          const expenseMatch = newChecked.length === 0 || newChecked.includes(row.name);
          const priceMatch = filterByPrice(row);
          return categoryMatch && expenseMatch && priceMatch;
      });
      setFilteredRows(filtered);
  };

  const handleAllExpenses = () => {
      setCheckedExpenses([]);
      
      // Apply filters immediately with empty expenses array
      const rowsToFilter = filteredRowsByDate.length ? filteredRowsByDate : rows || [];
      
      const filtered = rowsToFilter.filter(row => {
          const categoryMatch = checkedCategories.length === 0 || checkedCategories.map(String).includes(String(row.category));
          const expenseMatch = true; // Empty array means all expenses
          const priceMatch = filterByPrice(row);
          return categoryMatch && expenseMatch && priceMatch;
      });
      
      setFilteredRows(filtered);
  };

  // Helper function to convert price string to number (accepts both . and , as decimal separator)
  const parsePrice = (priceStr) => {
      if (!priceStr || priceStr === '') return null;
      // Replace comma with dot for parsing
      const normalized = String(priceStr).replace(',', '.');
      const num = Number(normalized);
      return isNaN(num) ? null : num;
  };

  // Filter by price range
  const filterByPrice = (row) => {
      const rowPrice = Number(row.price) || 0;
      
      const minNum = parsePrice(minPrice);
      const maxNum = parsePrice(maxPrice);
      
      // Check if both prices are set and min > max (invalid range)
      if (minNum !== null && maxNum !== null && minNum > maxNum) {
          console.warn("Min Price should be less than Max Price");
          return true; // Don't filter if invalid range
      }
      
      // Check if minPrice is set
      if (minNum !== null && rowPrice < minNum) {
          return false;
      }
      
      // Check if maxPrice is set
      if (maxNum !== null && rowPrice > maxNum) {
          return false;
      }
      
      return true;
  };

  // Apply all filters together
  const applyAllFilters = () => {
      const rowsToFilter = filteredRowsByDate.length ? filteredRowsByDate : rows || [];
      
      const filtered = rowsToFilter.filter(row => {
          const categoryMatch = checkedCategories.length === 0 || checkedCategories.map(String).includes(String(row.category));
          const expenseMatch = checkedExpenses.length === 0 || checkedExpenses.includes(row.name);
          const priceMatch = filterByPrice(row);
          return categoryMatch && expenseMatch && priceMatch;
      });
      
      setFilteredRows(filtered);
  };

  // Validate price range
  useEffect(() => {
      const minNum = parsePrice(minPrice);
      const maxNum = parsePrice(maxPrice);
      
      if (minNum !== null && maxNum !== null) {
          if (minNum > maxNum) {
              setPriceError('Min Price must be less than Max Price');
          } else {
              setPriceError('');
          }
      } else {
          setPriceError('');
      }
  }, [minPrice, maxPrice]);

  // Apply price filter when minPrice or maxPrice changes
  useEffect(() => {
      if (isLoggedIn && rows.length > 0) {
          applyAllFilters();
      }
  }, [minPrice, maxPrice]);


  useEffect(() => {
    console.log("filteredRows (after update):", filteredRows);
  }, [filteredRows]);


  // Search expense by search word in all categories
  const filterBySearchWord = (searchWord) => {
    console.log("search word:", searchWord);
    const cleanedWord = String(searchWord).trim().toLowerCase();
    setSearchWord(searchWord)
    
    const rows = expensesProviderValues.rows || [];
    console.log("search word:", searchWord);
    const filteredRows = rows.filter(row => {
        return (
          typeof row.name === 'string' &&
          row.name.toLowerCase().includes(cleanedWord)
        );
      });
    
    setRows(filteredRows);
  }

  const closeFilter = () => {
      setIsFilterOpen(false)
  }

  const resetAllFilters = () => {
      setCheckedCategories([]);
      setCheckedExpenses([]);
      setMinPrice('');
      setMaxPrice('');
      setPriceError('');
      setSearchWord('');
      setSelectedInterval('month');
      setDateFrom('');
      setDateTo('');
      setFilteredRows(rows || []);
  }

  const filterProviderValues = useMemo(() => ({       
      selectedInterval: selectedInterval,
      dateFrom: dateFrom,
      dateTo: dateTo,       
      startDate: startDate,
      endDate: endDate,       
      categories: categories,
      expenses: expenses,
      checkedCategories, 
      checkedExpenses,
      isFilterOpen, 
      searchWord,
      minPrice,
      maxPrice,
      priceError,
      today,
      todayFormatted,
      currentMonth,
      currentYear,
      customLabel,
      setCustomLabel,
      filteredRowsByDate,
      filteredRows,
      setFilteredRows,
      closeFilter,
      resetAllFilters,
      applyAllFilters,
      filterBySearchWord,
      setSearchWord,
      setMinPrice,
      setMaxPrice,
      setIsFilterOpen,
      setCheckedCategories,
      setCheckedExpenses,
      handleCategoryCheckbox,
      handleExpenseCheckbox,
      handleAllCategories,
      handleAllExpenses,
      setSelectedCategory: setSelectedCategory,
      handleDateFilter: handleDateFilter,
      formatDate: formatDate,
      getToday: getToday,
      getFirstDayOfMonth: getFirstDayOfMonth,
      setSelectedInterval: setSelectedInterval,
      setCustomLabel: setCustomLabel,
      setDateFrom: setDateFrom,
      setDateTo: setDateTo,
  }), [
      selectedInterval, dateFrom, dateTo, startDate, endDate,
      categories, expenses, checkedCategories, checkedExpenses,
      isFilterOpen, searchWord, minPrice, maxPrice, priceError,
      today, todayFormatted, currentMonth, currentYear, customLabel, filteredRowsByDate, filteredRows,
      closeFilter, resetAllFilters, applyAllFilters, filterBySearchWord,
      handleCategoryCheckbox, handleExpenseCheckbox, handleAllCategories, handleAllExpenses,
      handleDateFilter, formatDate, getToday, getFirstDayOfMonth
  ])

  const expensesProviderValues = useMemo(() =>  ({       
      selectedCategory: selectedCategory,
      selectedCategoryObj: selectedCategoryObj,
      categories: categories,
      selectedExpense:selectedExpense,
      expenses: expenses,
      paymentDate: paymentDate,
      price: price,
      miscExpense: miscExpense,
      rows: rows,
      editingField: editingField,
      editPrice: editPrice,
      editDate: editDate,
      editName: editName,
      editFrequency: editFrequency,
      descriptionMap: descriptionMap,     
      currentPage, 
      categoriesMap,
      isExpenseRecurring,
      setIsExpenseRecurring,
      expenseFrequency,
      setExpenseFrequency,
      setCurrentPage,
      totalPrice: totalPrice,
      monthlyTotalPrice: monthlyTotalPrice,
      allRowsTotalPrice: allRowsTotalPrice,
      setEditDate: setEditDate,       
      getToday: getToday,
      getFirstDayOfYear: getFirstDayOfYear,
      applyChanges: applyChanges,
      deleteExpense: deleteExpense,
      copyExpense: copyExpense,
      createRecurringExpense: createRecurringExpense,
      handleSave: handleSave,
      setSelectedCategory: setSelectedCategory,
      setSelectedExpense: setSelectedExpense,
      setPrice: setPrice,
      setEditPrice: setEditPrice,
      setEditName: setEditName,
      setEditFrequency: setEditFrequency,
      setSelectedInterval: setSelectedInterval,

      setPaymentDate: setPaymentDate,
      formatDate: formatDate,
      setMiscExpense: setMiscExpense,
      setEditingField: setEditingField,
      handleAddDescription: handleAddDescription,
      setIsDescriptionShown : setIsDescriptionShown ,
      setCurrentDescriptionId: setCurrentDescriptionId,
      closeDescription: closeDescription,
      setHasDescription: setHasDescription,
      receipts: receipts,
      attachReceipt: attachReceipt,
      removeReceipt: removeReceipt,
  }), [descriptionMap, setHasDescription, receipts, rows, startDate, endDate])


  const authProviderValues = {
      isLoggedIn,
      loginEmail, 
      loginUsername,
      loginPassword, 
      loginValue,
      registrationUsername,
      getAuthHeaders,
      getCookie,
      setIsSignupMessageShown,
      setRegistrationUsername,
      setLoginUsername,
      handleLogin,
      setLoginPassword,
      setLoginValue,
      setLoginEmail,
      setIsLoggedIn,      
  }

  const descriptionProviderValues = {
      closeDescription: closeDescription,      
      isDescriptionShown: isDescriptionShown,
      currentDescriptionId: currentDescriptionId,
  }

  const modalProviderValues = {
      isModalLoginOpen,     
      isModalRegistrationOpen,     
      isModalSortOpen,
      isModalCustomDateOpen,
      isModalRecurringOpen,
      selectedExpenseForRecurring,
      setIsModalSortOpen,
      setIsModalLoginOpen,
      setIsModalRegistrationOpen,
      setIsModalCustomDateOpen,
      setIsModalRecurringOpen,
      setSelectedExpenseForRecurring,
    };

  const incomeProviderValues = {
      incomes: filteredIncomes,
      allIncomes: incomes,
      incomeCategories,
      newIncome,
      setNewIncome,
      addIncome,
      deleteIncome,
      editingIncomeField,
      setEditingIncomeField,
      editIncomeName,
      setEditIncomeName,
      editIncomeAmount,
      setEditIncomeAmount,
      editIncomeDate,
      setEditIncomeDate,
      editIncomeCategory,
      setEditIncomeCategory,
      editIncomeSource,
      setEditIncomeSource,
      editIncomeFrequency,
      setEditIncomeFrequency,
      editIncomeRecurring,
      setEditIncomeRecurring,
      applyIncomeChanges,
    };


  return (
    <> 
      <AuthContext.Provider value={authProviderValues}>
        <ModalContext.Provider value={modalProviderValues}>
          <FilterContext.Provider value={filterProviderValues}>
            <ExpensesContext.Provider value={expensesProviderValues}>
              <IncomeContext.Provider value={incomeProviderValues}>
                <DescriptionContext.Provider value={descriptionProviderValues}>
                  <Main />
                  <RecurringExpenseModal />
                </DescriptionContext.Provider>
              </IncomeContext.Provider>
            </ExpensesContext.Provider>
          </FilterContext.Provider>
        </ModalContext.Provider>
      </AuthContext.Provider>  
    </>
  );
}

export  {App};
