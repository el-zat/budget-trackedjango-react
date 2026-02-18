import React, {useContext} from "react"
import  '../styles/Diagram.scss'
import { ExpensesContext } from "../context/ExpensesContext";
import { FilterContext } from "../context/FilterContext";


const Diagram = () => {

    const expensesProviderValues = useContext(ExpensesContext)
    const filterProviderValues = useContext(FilterContext)


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


    function sumByGroup(items) {      
      if (!expensesProviderValues.allRowsTotalPrice) return 0;
      const sum = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
      return sum
    }


    function percentByGroup(items) {
      const sum = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
      if (!expensesProviderValues.allRowsTotalPrice) return 0;
      return ((sum * 100) / expensesProviderValues.allRowsTotalPrice()).toFixed(1);
    }
    
    const grouped = groupedByCategoryName();

    const groupArray = Object.entries(grouped).map(([name, items]) => ({
      name,
      items,
      sum: sumByGroup(items),
      percent: percentByGroup(items)
    }));

    const sortedGroupArray = groupArray.sort((a, b) => b.percent - a.percent);

      
    // Extended color palette with more distinct colors
    const categoryColors = [
      '#9c4fff', // purple
      '#51cf66', // green
      '#4dabf7', // blue
      '#ffd43b', // yellow
      '#ff6b6b', // red
      '#74c0fc', // light blue
      '#ff8787', // coral
      '#69db7c', // light green
      '#ffa94d', // orange
      '#da77f2', // pink
      '#20c997', // teal
      '#fab005', // gold
      '#6c5ce7', // indigo
      '#fd7e14', // dark orange
      '#a5d8ff', // sky blue
      '#ff922b', // tangerine
      '#94d82d', // lime
      '#748ffc', // periwinkle
      '#ffc078', // peach
      '#12b886', // emerald
      '#cc5de8', // violet
      '#38d9a9', // mint
      '#ffa8a8', // salmon
      '#87ceeb', // sky
      '#ff69b4', // hot pink
    ];
    
    // Create a mapping of category names to color indices
    const sortedCategoryNames = [...new Set(sortedGroupArray.map(g => g.name))].sort();
    const categoryColorMap = {};
    sortedCategoryNames.forEach((name, index) => {
      categoryColorMap[name] = categoryColors[index % categoryColors.length];
    });
    
    // Get consistent color for each category
    function getCategoryColor(categoryName) {
      return categoryColorMap[categoryName] || categoryColors[0];
    }


    return <React.Fragment> 
        <div className="category-summary">
            <h2>📊 Categories Summary</h2>
            {sortedGroupArray.map((group) => (
            <div className="category-row" key={group.name}>
                <div className="cat-header">
                  <span>{group.name}</span>
                </div>
                <div className="sum-container">
                  <span className="sum">€ {group.sum.toFixed(2)}</span>
                  <span className="percent">{group.percent}%</span>
                </div>
  
                <div className="bar-container">
                  <div className="bar" 
                        style={{ width: `${group.percent}%`, background: getCategoryColor(group.name) }}>                                                
                  </div>                                
                </div>
            </div>
            ))}
            
            {/* Total Row */}
            <div className="category-row total-row">
                <div className="cat-header">
                  <span><strong>Total for {
                    filterProviderValues.selectedInterval === 'today' ? 'today' :
                    filterProviderValues.selectedInterval === 'month' ? filterProviderValues.currentMonth :
                    filterProviderValues.selectedInterval === 'year' ? filterProviderValues.currentYear :
                    filterProviderValues.selectedInterval === 'all' ? 'All' :
                    filterProviderValues.selectedInterval === 'custom' && filterProviderValues.startDate && filterProviderValues.endDate 
                      ? `${filterProviderValues.startDate} - ${filterProviderValues.endDate}` :
                    'Period'
                  }</strong></span>
                </div>
                <div className="sum-container">
                  <span className="sum"><strong>€ {expensesProviderValues.allRowsTotalPrice().toFixed(2)}</strong></span>
                </div>
                <div className="bar-container"></div>
            </div>
        </div>
  
      </React.Fragment> 

}

export {Diagram}