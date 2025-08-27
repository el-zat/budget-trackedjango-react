import React, {useContext, useEffect} from "react"
import  '../styles/Filter.scss'
import { FilterContext } from "../context/FilterContext"


const Filter = () => {

    const filterProviderValues = useContext(FilterContext)

    


    return  <React.Fragment>                
                
                  {filterProviderValues.isFilterOpen  && 
                  <div className="filter-container">
                    <div className="filter">
                      <div className="interval-filter">                        
                        <div className="select-interval">
                          <h3>Select interval</h3>
                          <div className="set-interval">
                            <form style={{ fontWeight: 'bold' }}>
                              <div className="set_this_month">
                                <label>
                                  <input
                                    type="radio"
                                    name="interval"
                                    value="month"
                                    checked={filterProviderValues.selectedInterval === "month"}
                                    onChange={e => {
                                      filterProviderValues.setSelectedInterval(e.target.value);
                                      // filterProviderValues.handleDateFilter(e.target.value);
                                    }}
                                  />
                                  This month
                                </label>
                              </div>                                
                              <div className="set_this_year">
                                <label>
                                  <input
                                    type="radio"
                                    name="interval"
                                    value="year"
                                    checked={filterProviderValues.selectedInterval === "year"}
                                    onChange={e => {
                                      filterProviderValues.setSelectedInterval(e.target.value);
                                    }}
                                  />
                                  This year
                                </label>
                              </div>
                              <div className="set_today">
                                <label>
                                  <input
                                    type="radio"
                                    name="interval"
                                    value="today"
                                    checked={filterProviderValues.selectedInterval === "today"}
                                    onChange={e => {
                                      filterProviderValues.setSelectedInterval(e.target.value);
                                    }}
                                  />
                                  Today
                                </label>
                              </div>
                              <div className="set_custom_interval">
                                <label>
                                  <input
                                    type="radio"
                                    name="interval"
                                    value="custom"
                                    checked={filterProviderValues.selectedInterval === "custom"}
                                    onChange={e => {
                                      filterProviderValues.setSelectedInterval(e.target.value);                               
                                    }}
                                  />
                                  Custom interval
                                </label>

                              </div>
                            </form>
                          </div>
                          {filterProviderValues.selectedInterval === "custom" &&                                  
                          <div className="custom-interval">                        
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
                          }
                        </div>                                  
                      </div>          

                      <div className="categories-filter" style={{ fontWeight: 'bold' }}>
                          <h3>Select category</h3>
                            <div >
                              <label>
                                <input
                                  type="checkbox"
                                  value="all"
                                  checked={filterProviderValues.selectedCategories.length === 0}
                                  onChange={filterProviderValues.handleAllCategories}
                                />
                                All categories
                              </label>
                            
                              {filterProviderValues.categories.slice() 
                              .sort((a, b) => a.name.localeCompare(b.name)).map(cat => (
                                <div key={cat.id}>
                                  <label>
                                    <input
                                      type="checkbox"
                                      value={cat.id}
                                      checked={filterProviderValues.selectedCategories.includes(cat.id)}
                                      onChange={() => filterProviderValues.handleCategoryCheckbox(cat.id)}
                                    />
                                    {cat.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                      </div>

                      <table className="interval-table">
                        <tbody>
                          <tr>
                            <th>Start date:</th>
                            <td>
                              {
                                filterProviderValues.selectedInterval === "select-interval"
                                ? ""                            
                                : filterProviderValues.formatDate(filterProviderValues.startDate)
                              }
                            </td>
                          </tr>
                          <tr>
                            <th>End date:</th>
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
                     </div>

                     <div className="filter-actions">
                      <div className="search-container">
                        <input 
                          id="search-word"
                          type="search" 
                          placeholder="Search..." 
                          name="search" 
                          value={filterProviderValues.searchWord || ""}    
                          onChange={(e) => filterProviderValues.setSearchWord(e.target.value)}                                          
                        /> 
                        <button 
                          type="button"
                          onClick={() => filterProviderValues.filterBySearchWord(filterProviderValues.searchWord)}
                          >
                          <i className="material-icons">search</i>                        
                        </button>
                      </div>       
                      <div className="close-filter">
                        <button 
                            className='close-filter' 
                            onClick={filterProviderValues.closeFilter}
                            >                          
                          Close filter
                        </button>
                      </div>       
                     </div>
                    
                     
                  </div>                    
                  }

            </React.Fragment>
}
    
export {Filter}