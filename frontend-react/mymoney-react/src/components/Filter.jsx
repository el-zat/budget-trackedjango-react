import React, {useContext} from "react"
import  '../styles/Filter.scss'
import { FilterContext } from "../context/FilterContext"


const Filter = () => {

    const filterProviderValues = useContext(FilterContext)


    return  <React.Fragment>                
      
                <div className="filters">         
                  <div className="date-filter">
                  {filterProviderValues.selectedInterval !== "custom" ? (
                    <div className="interval">
                      <select style={{ fontWeight: 'bold' }}
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
                        <option value="select-interval" >Select Interval</option>
                        <option value="month">This Month</option>
                        <option value="today">Today</option>                     
                        <option value="year">This Year</option>                  
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
                        <td>
                          {
                            filterProviderValues.selectedInterval === "select-interval"
                            ? ""                            
                            : filterProviderValues.formatDate(filterProviderValues.startDate)
                          }
                        </td>
                      </tr>
                      <tr>
                        <th>End Date:</th>
                        <td>
                          {
                            filterProviderValues.selectedInterval === "select-interval"
                            ? ""
                            : filterProviderValues.formatDate(filterProviderValues.endDate)
                          }
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="categories">                  
                    <select id="categories-filter" style={{ fontWeight: 'bold' }}
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
                </div>                                      
         
            </React.Fragment>
}
    
export {Filter}