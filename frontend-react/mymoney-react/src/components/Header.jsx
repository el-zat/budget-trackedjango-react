import React, {useState, useEffect} from "react"
import  './Header.css'

const Header = () => {

    const [filter, setFilter] = useState("month");
    const [dateFrom, setDateFrom] = useState(getToday());
    const [dateTo, setDateTo] = useState(getToday());
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);

  
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

    useEffect(() => {
      fetch('http://127.0.0.1:8000/api/categories/')
        .then(res => res.json())
        .then(data => {
          console.log('Категории:', data); // ← здесь должен быть массив
          setCategories(data);
        })
        .catch(error => {
          console.error('Ошибка загрузки категорий:', error);
        });
    }, []);


    return  <React.Fragment>                
              <header>
                <h1>Budget Tracker</h1>
                <div className="filters">       
                  <select id="date-filter" value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                    <option value="day">Today</option>
                    <option value="custom">Custom Interval</option>
                  </select>                        
                  {filter === "custom" && (
                    <div className="interval"><p>Input Interval:</p>
                      <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}/>
                      <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}/>
                    </div>
                  )}                                                                                         
                  {filter === "month" && (                           
                    <div className="balance">
                      <div className="total-amount"> Total Expenses for Month: € 2000 </div>
                      <div className="income">Income: € 3250</div>                      
                      <div className="rest">Rest Balance: € 3250</div> 
                      
                    </div>                            
                  )}                                                                                         
                  <table className="date-table">
                    <tr>
                      <th>Start Date:</th>
                      <td>{formatDate(startDate)}</td>
                    </tr>
                    <tr>
                      <th>End Date:</th>
                      <td>{formatDate(endDate)}</td>
                    </tr>
                  </table> 

                  <div className="categories">                  
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                      <option value="all">All Categories</option>
                        {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                      </option>
                      ))}
                    </select>    
                  </div>   
                           
                </div>                                      
              </header>
            </React.Fragment>
}
    
export {Header}