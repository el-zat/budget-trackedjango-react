import './App.css';
import {Main} from "./components/Main"
import React, {useState, useEffect, useMemo, useCallback  } from "react"
import  './styles/Main.scss'
import {FilterContext} from './context/FilterContext'
import {ExpensesContext} from './context/ExpensesContext'
import {AuthContext} from './context/AuthContext'
import {DescriptionContext} from './context/DescriptionContext'
import {SortContext} from './context/SortContext'


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
    
    //Logging
    const [isLoggedIn, setIsLoggedIn] = useState(false);


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


    //Sorting
    const [selectedSort, setSelectedSort] = useState([]);



    // Fetch expenses from django server
    const fetchExpenses = async () => {
        const response = await fetch('http://127.0.0.1:8000/api/myexpenses/');
        const data = await response.json();
        // console.log("data:", data)
        setRows(data);
    };

    // Inintial state (logged out)
    useEffect(() => {
        if (isLoggedIn) {
            fetchExpenses();
        } else {
            setRows([]); // Empty table when logged out
        }
        }, [isLoggedIn]);

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
   

    const totalPrice = () => {      
        if (isLoggedIn) {
            return rows.reduce((prevTotal, row) => prevTotal + Number(row.price), 0)
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
    

    const handleSave = async (e) => {
        console.log(isLoggedIn)
        if (!isLoggedIn) {
            alert('Your entries will not be saved! Please log in')
        }
        else {
            e.preventDefault();

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
            category: selectedCategoryObj?.id || '',
            name: expenseName,
            price: getCleanPrice(price),
            payment_date: paymentDate ? paymentDate : getToday(),
        };
    
        if (isLoggedIn) {
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

                await fetchExpenses();

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

            setSelectedCategory('all');
            setSelectedExpense('all');
            setName('');
            setPrice('');
            setPaymentDate(getToday());
        }   
    }
        
  
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

    // Update editDate after paymentDate was updated
    useEffect(() => {
        setEditDate(paymentDate);
      }, [paymentDate]);


    const applyChanges = async (id, field) => {
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
            const response = await fetch(`http://127.0.0.1:8000/api/myexpenses/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
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


    //Sorting and filtering

    const allRows = useMemo(() => {
        return rows || [];
      }, [rows]);


    const categoriesMap = {};
        categories.forEach(category => {
            categoriesMap[category.id] = category;
    });


    const sortCategoriesAlphabetically = () => {
        const sorted = rows.slice().sort((a, b) => {
          const aKey = categoriesMap[a.category]?.name.toLowerCase() || "";
          const bKey = categoriesMap[b.category]?.name.toLowerCase() || ""      
          const comparison = aKey.localeCompare(bKey, 'en', { sensitivity: 'base', numeric: true });
      
          return comparison;
        });
        setRows(sorted);
    };
    

    const handleSort = (selectedSort) => {
        switch (selectedSort) {
          case "date-dec":
            setRows(rows.slice().sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date)));
            break;
          case "date-inc":
            setRows(rows.slice().sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date)));
            break;
          case "category":
            sortCategoriesAlphabetically("category");
            break;
          case "price-inc":
            setRows(rows.slice().sort((a, b) => a.price - b.price));
            break;
          case "price-dec":
            setRows(rows.slice().sort((a, b) => b.price - a.price));
            break;
          default:
            setRows(rows.slice().sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date)));
            break;
        }     
        setSelectedSort(selectedSort);
      };
    

    const onSortChange = (value) => {
        setSelectedSort(value);
        handleSort(value);  
      };


    const filterRowsByDate = (rows, selectedInterval, startDate, endDate) => {
        if (!rows.length) return [];
        
        return rows.filter(row => {
            const rowDate = new Date(row.payment_date);
            const today = new Date();
            const firstDayOfYear = new Date(today.getFullYear(), 0, 1); // 1.January
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
            switch (selectedInterval) {
                case "today":
                    return (
                    rowDate.getFullYear() === today.getFullYear() &&
                    rowDate.getMonth() === today.getMonth() &&
                    rowDate.getDate() === today.getDate()
                    );
                case "year":
                    return rowDate >= firstDayOfYear && rowDate <= today;
                case "month":
                    return rowDate >= firstDayOfMonth && rowDate <= today;
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

    const sortProviderValues = {
        selectedSort, 
        onSortChange,
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
        // filteredRowsByCategories,
        filteredRows,
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
        isLoggedIn: isLoggedIn,
        setIsLoggedIn: setIsLoggedIn,      
    }

    const descriptionProviderValues = {
        closeDescription: closeDescription,      
        isDescriptionShown: isDescriptionShown,
        currentDescriptionId: currentDescriptionId,
    }


  return (
    <>
    <AuthContext.Provider value={authProviderValues}>
        <FilterContext.Provider value={filterProviderValues}>
            <SortContext.Provider value={sortProviderValues}>
                <ExpensesContext.Provider value={expensesProviderValues}>
                    <DescriptionContext.Provider value={descriptionProviderValues}>
                            <Main />
                    </DescriptionContext.Provider>
                </ExpensesContext.Provider>
            </SortContext.Provider>
        </FilterContext.Provider>
    </AuthContext.Provider>
    </>

  );
}

export  {App};
