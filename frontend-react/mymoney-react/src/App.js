import './App.css';
import {Main} from "./components/Main"
import React, {useState, useEffect, useMemo, useCallback  } from "react"
import  './styles/Main.scss'
import {FilterContext} from './context/FilterContext'
import {ExpensesContext} from './context/ExpensesContext'
import {AuthContext} from './context/AuthContext'
import {DescriptionContext} from './context/DescriptionContext'
import { ModalContext } from './context/ModalContext';


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

  useEffect(() => {
    if (isLoggedIn && rows.length > 0) {
      setFilteredRows(rows);
    }
  }, [isLoggedIn, rows]);
  
  
  //Fetch expenses from django server
  const fetchExpenses = async () => {
    const response = await fetch('/api/myexpenses/', {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const data = await response.json();
    setRows(data);
  };
  

  //Inintial state (logged out)
  useEffect(() => {
      if (isLoggedIn) {
          fetchExpenses();
      } else {
          setRows([]); // Empty table when logged out
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
      if (isLoggedIn) {
          return filteredRows.reduce((prevTotal, row) => {
              const price = Number(row.price) || 0;
              return prevTotal + price;
          }, 0)
      } 
      else { return ''}
  }

  const allRowsTotalPrice = () => {      
      if (isLoggedIn) {
          return rows.reduce((prevTotal, row) => {
              const price = Number(row.price) || 0;
              return prevTotal + price;
          }, 0)
      } 
      else { return 0}
  }

  const monthlyTotalPrice = () => {      
      if (isLoggedIn) {
          const today = new Date();
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          
          return rows.reduce((prevTotal, row) => {
              const rowDate = new Date(row.payment_date);
              if (rowDate >= firstDayOfMonth && rowDate <= today) {
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
              return getToday();
          case 'year':
              return getToday();
          case 'all':
              return "";
          default:
              return "";
      }
  };
    
  const startDate = getStartDate(selectedInterval);
  const endDate = getEndDate(selectedInterval);
  const today = getToday(selectedInterval);
  const currentMonth = getCurrentMonth(selectedInterval);
  const currentYear = getCurrentYear(selectedInterval);


  function formatDate(value) {
      if (!value) return "";
      const d = new Date(value);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
  }


  const selectedCategoryObj = Array.isArray(categories) 
    ? categories.find(cat => String(cat.id) === String(selectedCategory))
    : null;


  const getCleanPrice = (price) => {
      if (!price || price === '' || price === null || price === undefined) {
          return 0;
      }
      let cleanPrice = price;
      if (typeof cleanPrice === 'string') {
          cleanPrice = cleanPrice.replace(',', '.').replace(/[^\d.]/g, '');
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

    const newJangoExpense = {
        user_email: loginEmail,
        category: selectedCategoryObj?.id || '',
        name: expenseName,
        price: getCleanPrice(price),
        payment_date: paymentDate ? paymentDate : getToday(),
    };

    if (isLoggedIn) {
      try {
        const response = await fetch('/api/myexpenses/', {
            method: 'POST',
            credentials: 'include',
            headers: getAuthHeaders(),
            body: JSON.stringify(newJangoExpense),
        });

        const data = await response.json();

        if (!response.ok) {
            alert('Error!: ' + JSON.stringify(data));
            return;
        }

        const newRecord = data;

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
      const response = await fetch(`/api/myexpenses/${id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
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

  //Update editDate after paymentDate was updated
  useEffect(() => {
      setEditDate(paymentDate);
    }, [paymentDate]);


  const applyChanges = async (id, field) => {
    if (editingField.id === id) {     
      // Edit name, price or date     
      let bodyData = {};
      if (field === 'price') {
          const priceValue = getCleanPrice(editPrice);
          bodyData = { price: priceValue };
      } 
      else if (field === 'date') {
          bodyData = { payment_date: editDate };
      }
      else if (field === 'name') {
          bodyData = { name: editName};
      }
      
      // Send to server (PATCH)
      const response = await fetch(`/api/myexpenses/${id}/`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(bodyData)
      });
      const result = await response.json().catch(() => ({}));
      console.log('Server response:', response.status, result);

      // Update the local table
      setRows(rows.map(row =>
          row.id === id ? {  ...row, ...bodyData} : row
      ));

      setEditingField({id: null, field: null});
      setEditPrice('');
      setEditDate('');
    } else {
        // Edit price and payment date
        const expense = rows.find(row => row.id === id);

        if (!expense) {
            alert('Row with this id not found!');
            return;
        }

        setEditPrice(expense.price);
        setEditDate(expense.payment_date);
        setEditingField({id: id, field: null});
    }
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
    
        switch (selectedInterval) {
            case "today":
                return (
                rowDate.getFullYear() === today.getFullYear() &&
                rowDate.getMonth() === today.getMonth() &&
                rowDate.getDate() === today.getDate()
                );
            case "year":
                return rowDate >= firstDayOfYear && rowDate <= lastDayOfYear;
            case "month":
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
      currentMonth,
      currentYear,
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
      setDateFrom: setDateFrom,
      setDateTo: setDateTo,
  }), [
      selectedInterval, dateFrom, dateTo, startDate, endDate,
      categories, expenses, checkedCategories, checkedExpenses,
      isFilterOpen, searchWord, minPrice, maxPrice, priceError,
      today, currentMonth, currentYear, filteredRowsByDate, filteredRows,
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
      descriptionMap: descriptionMap,     
      currentPage, 
      categoriesMap,
      setCurrentPage,
      totalPrice: totalPrice,
      monthlyTotalPrice: monthlyTotalPrice,
      allRowsTotalPrice: allRowsTotalPrice,
      setEditDate: setEditDate,       
      getToday: getToday,
      getFirstDayOfYear: getFirstDayOfYear,
      applyChanges: applyChanges,
      deleteExpense: deleteExpense,
      handleSave: handleSave,
      setSelectedCategory: setSelectedCategory,
      setSelectedExpense: setSelectedExpense,
      setPrice: setPrice,
      setEditPrice: setEditPrice,
      setEditName: setEditName,
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
  }), [descriptionMap, setHasDescription, receipts, rows])


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
      setIsModalSortOpen,
      setIsModalLoginOpen,
      setIsModalRegistrationOpen,
      setIsModalCustomDateOpen,
    };


  return (
    <> 
      <AuthContext.Provider value={authProviderValues}>
        <ModalContext.Provider value={modalProviderValues}>
          <FilterContext.Provider value={filterProviderValues}>
            <ExpensesContext.Provider value={expensesProviderValues}>
              <DescriptionContext.Provider value={descriptionProviderValues}>
                <Main />
              </DescriptionContext.Provider>
            </ExpensesContext.Provider>
          </FilterContext.Provider>
        </ModalContext.Provider>
      </AuthContext.Provider>  
    </>
  );
}

export  {App};
