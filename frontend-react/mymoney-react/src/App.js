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
  const [selectedInterval, setSelectedInterval] = useState('month')
  const [searchWord, setSearchWord] = useState('');
  const [filteredRowsByDate, setFilteredRowsByDate] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);


  //Modal
  const [isModalSortOpen, setIsModalSortOpen] = useState(false);
  const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);
  const [isModalRegistrationOpen, setIsModalRegistrationOpen] = useState(false);


  //Fetch expenses from django server
  const fetchExpenses = async () => {
      const response = await fetch('/api/myexpenses/');
      const data = await response.json();
      // console.log("data:", data)
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
      fetch('/api/categories/')
          .then(res => res.json())
          .then(data => {
          setCategories(data);
          })
          .catch(error => {
          console.error('Fetch error:', error);
          });
      }, []);


  useEffect(() => {
      fetch('/api/expenses/')
          .then(res => res.json())
          .then(data => {
          setExpenses(data);
          })
          .catch(error => {
          console.error('Fetch error:', error);
          });
        }, []);


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
          return filteredRows.reduce((prevTotal, row) => prevTotal + Number(row.price), 0)
      } 
      else { return ''}
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
      return today.toLocaleString('en', { day: 'numeric', month: 'long', year: 'numeric' });
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


  const selectedCategoryObj = categories.find(
      cat => String(cat.id) === String(selectedCategory)
  );

  const getCleanPrice = (price) => {
      let cleanPrice = price;
      if (typeof cleanPrice === 'string') {
          cleanPrice = cleanPrice.replace(',', '.').replace(/[^\d.]/g, '');
      }
      return cleanPrice;
  }


  //Login, authorization

  const handleLogin = async (e) => {
      e.preventDefault();
      const csrfToken = getCookie('csrftoken');  // Get the token 

      setMessage('');

      const loginPayload = {
        login: loginValue,
        password: loginPassword,
      };

      console.log("login value: ",loginValue)
              
      try {
          // const response = await fetch('http://127.0.0.1:8000/api/login/', {
          const response = await fetch('/api/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,  // Add the token to the headers          
          },
            
            body: JSON.stringify(loginPayload),
          });
    
        if (response.ok) {
          const data = await response.json(); //Get username from response
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
      if (!isLoggedIn) {
          alert('Your entries will not be saved! Please log in')
      }
      else {
          e.preventDefault();

      
      //Validation and creation of newJangoExpense    
      const selectedCategoryObj = categories.find(
          cat => String(cat.id) === String(selectedCategory)
      );
  
      const isMisc = selectedCategoryObj?.name === "Miscellaneous";
      const expenseName = isMisc ? miscExpense : selectedExpense;
  
      const paymentDate = document.querySelector('input[name="paymentDate"]')?.value;
  
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

      const csrfToken = getCookie('csrftoken');  // Get the token 
  
      if (isLoggedIn) {
          try {
              const response = await fetch('/api/myexpenses/', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'X-CSRFToken': csrfToken,  // Add the token to the headers 
                  },
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

      else {
          const newLocalExpense = {
              id: Date.now(),
              category: selectedCategoryObj?.id || '',
              name: expenseName,
              price: getCleanPrice(price),
              payment_date: paymentDate ? paymentDate : getToday(),  
          }
          setRows(prevRows => [newLocalExpense, ...prevRows]);   
      }    

          // Clear form
          setSelectedCategory('all');
          setSelectedExpense('all');
          setName('');
          setPrice('');
          setPaymentDate(getToday());
      }   
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
    const csrfToken = getCookie('csrftoken');  // Get the token 
    if (!id) {
      alert('Error: id undefined!');
      return;
    }
    try {
      const response = await fetch(`/api/myexpenses/${id}/`, {
        method: 'DELETE',
        'X-CSRFToken': csrfToken,  // Add the token
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
    const csrfToken = getCookie('csrftoken');  // Get the token 
    if (editingField.id === id) {     
      // Edit name, price or date     
      let bodyData = {};
      if (field === 'price') {
          bodyData = { price: Number(editPrice) };
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
          headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,  // Add the token to the headers
          },
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

  const setHasDescription = (id, value) => {
      console.log('setHasDescription called with:', id, typeof id);
      setDescriptionMap(prev => ({ ...prev, [id]: value }));
  };


  //Filtering

  const allRows = useMemo(() => {
      return rows || [];
    }, [rows]);


  const categoriesMap = {};
      categories.forEach(category => {
          categoriesMap[category.id] = category;
  });


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
          newChecked = checkedCategories.filter(id => id !== checkedID);  //If the category is already selected, it is removed from the list
      } else {
          newChecked = [...checkedCategories, checkedID]; //Otherwise, it is added to the list of selected categories
      }
      setCheckedCategories(newChecked);
      console.log("new checked: ", newChecked)

      const rowsToFilter = filteredRowsByDate.length ? filteredRowsByDate : expensesProviderValues.rows || [];

      const filtered = rowsToFilter.filter(row =>
          newChecked.length === 0 ||
          newChecked.map(String).includes(String(row.category))
        );
        setFilteredRows(filtered);

      console.log("rows:", filteredRows)
  };


  const handleAllCategories = () => {
      setCheckedCategories([]);
      setFilteredRows(rows || []);
  };


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

  const filterProviderValues = {       
      selectedInterval: selectedInterval,
      dateFrom: dateFrom,
      dateTo: dateTo,       
      startDate: startDate,
      endDate: endDate,       
      categories: categories,
      checkedCategories, 
      isFilterOpen, 
      searchWord, 
      today,
      currentMonth,
      currentYear,
      filteredRowsByDate,
      filteredRows,
      setFilteredRows,
      closeFilter,
      filterBySearchWord,
      setSearchWord,
      setIsFilterOpen,
      setCheckedCategories,
      handleCategoryCheckbox,
      handleAllCategories,
      setSelectedCategory: setSelectedCategory,
      handleDateFilter: handleDateFilter,
      formatDate: formatDate,
      getToday: getToday,
      getFirstDayOfMonth: getFirstDayOfMonth,
      setSelectedInterval: setSelectedInterval,
      setDateFrom: setDateFrom,
      setDateTo: setDateTo,
  }

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
  }), [descriptionMap, setHasDescription])


  


  const authProviderValues = {
      isLoggedIn,
      loginEmail, 
      loginUsername,
      loginPassword, 
      loginValue,
      registrationUsername,
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
      setIsModalSortOpen,
      setIsModalLoginOpen,
      setIsModalRegistrationOpen,      
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
