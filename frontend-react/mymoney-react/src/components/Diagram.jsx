import React, {useContext} from "react"
import  './Diagram.css'
import { ExpensesContext } from "./ExpensesContext";


const Diagram = () => {

    const expensesProviderValues = useContext(ExpensesContext)

    // Groupe expenses by their categories
    const groupedByCategoryName = () => {
        return expensesProviderValues.rows.reduce((acc, expense) => {
          const cat = expensesProviderValues.categories.find(c => String(c.id) === String(expense.category));
          const catName = cat?.name || 'Unknown';
          if (!acc[catName]) acc[catName] = [];
          acc[catName].push(expense);
          return acc;
        }, {});
    };


    function percentByGroup(items) {
      const sum = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
      if (!expensesProviderValues.totalPrice) return 0;
      return ((sum * 100) / expensesProviderValues.totalPrice()).toFixed(1);
    }
    
    const grouped = groupedByCategoryName();

    const groupArray = Object.entries(grouped).map(([name, items]) => ({
      name,
      items,
      percent: percentByGroup(items)
    }));

    const sortedGroupArray = groupArray.sort((a, b) => b.percent - a.percent);

      
    function getRandomHexColor() {
      return '#' + Math.floor(Math.random() * 0xFFFFFF)
        .toString(16)
        .padStart(6, '0');
    }


    return <React.Fragment> 
        <div className="category-summary">
            <h2>Category Summary</h2>
            {sortedGroupArray.map((group) => (

            <div className="category-row" key={group.name}>
                <div className="cat-header">
                  <span>{group.name}</span>
                </div>
                <div className="bar-container">
                  <div className="bar" 
                        style={{ width: `${group.percent}%`, background: getRandomHexColor() }}>                           
                  </div>
                </div>
                <span className="percent"> { group.percent} % </span>           
            </div>
            ))}                                    
        </div>
  
      </React.Fragment> 

}

export {Diagram}