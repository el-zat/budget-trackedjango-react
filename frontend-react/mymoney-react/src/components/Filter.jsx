import React, {useContext} from "react"
import  './Filter.css'
import { FilterContext } from "./FilterContext"


const Filter = () => {

    const filterProviderValues = useContext(FilterContext)


    return  <React.Fragment>                
              <header>               
                <div className="filters">       
                  <select 
                      id="date-filter" 
                      value={filterProviderValues.filter} 
                      onSelect={filterProviderValues.handleDateFilter} 
                      onChange={e => filterProviderValues.setFilter(e.target.value)}
                    >
                    <option value="month">This Month</option>
                    <option value="year" >This Year</option>
                    <option value="day">Today</option>
                    <option value="custom">Custom Interval</option>
                  </select>                        
                  {filterProviderValues.filter === "custom" && (
                    <div className="interval"><p>Input Interval:</p>
                      <input 
                          type="date" 
                          value={filterProviderValues.dateFrom} 
                          onChange={e => filterProviderValues.setDateFrom(e.target.value)}
                        />
                      <input 
                          type="date" 
                          value={filterProviderValues.dateTo} 
                          onChange={e => filterProviderValues.setDateTo(e.target.value)}
                        />
                    </div>
                  )}                                                                                         
                  <table className="date-table">
                    <tbody>
                      <tr>
                        <th>Start Date:</th>
                        <td>{filterProviderValues.formatDate(filterProviderValues.startDate)}</td>
                      </tr>
                      <tr>
                        <th>End Date:</th>
                        <td>{filterProviderValues.formatDate(filterProviderValues.endDate)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="categories">                  
                    <select 
                        value={filterProviderValues.selectedCategory} 
                        onSelect={filterProviderValues.handleDateFilter} 
                        onChange={e => filterProviderValues.setSelectedCategory(e.target.value)}
                      >
                      <option value="all">All Categories</option>
                        {filterProviderValues.categories.map(cat => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                      </option>
                      ))}
                    </select>    
                  </div>
                  {filterProviderValues.filter === "month" && (                           
                    <div className="balance">
                      <div className="total-amount"> Total for Month: € 2000 </div>
                      <div className="income">Income: € 3250</div>                      
                      <div className="rest">Rest Balance: € 3250</div>                      
                    </div>                            
                  )}   
                           
                </div>                                      
              </header>
            </React.Fragment>
}
    
export {Filter}