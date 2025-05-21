import React, {useContext} from "react"
import  './Filter.css'
import { FilterContext } from "./FilterContext"


const Filter = () => {

    const filterProviderValues = useContext(FilterContext)


    return  <React.Fragment>                
              <header>               
                <div className="filters">         
                  <div className="date-filter">
                  {filterProviderValues.selectedInterval !== "custom" ? (
                    <div className="interval">
                      <select
                        id="date-filter"
                        value={filterProviderValues.selectedInterval}
                        onChange={e => {
                          const val = e.target.value;
                          filterProviderValues.setSelectedInterval(val);
                          if (val !== "custom") {
                            filterProviderValues.handleDateFilter(val);
                          }
                        }}
                      >
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                        <option value="today">Today</option>
                        <option value="custom">Custom Interval</option>
                      </select>
                    </div>
                  ) : (
                    <div className="custom-interval">
                      <p>Input Interval:</p>
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
                      <div className="set-interval">
                        <button
                          className="set-interval-button"
                          onClick={() => filterProviderValues.handleDateFilter("custom")}
                        >
                          Apply Interval
                        </button>
                      </div>
                    </div>
                  )}
                </div>

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
                        onChange={filterProviderValues.handleCategoryFilter}
                      >
                      <option value="all">All Categories</option>
                        {filterProviderValues.categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
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