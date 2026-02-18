import React, {useContext, useEffect} from "react"
import  '../styles/Filter.scss'
import { FilterContext } from "../context/FilterContext"
import { FilteredDiagram } from "./FilteredDiagram"


const Filter = () => {

    const filterProviderValues = useContext(FilterContext)

    // Calculate total of filtered expenses
    const calculateFilteredTotal = () => {
        return filterProviderValues.filteredRows.reduce((total, row) => {
            return total + (parseFloat(row.price) || 0)
        }, 0)
    }

    return  <React.Fragment>                
                
                  {filterProviderValues.isFilterOpen  && 
                  <div className="filter-container">
                    <div className="filter">
                      <div className="filters-row">
                        <div className="categories-filter" style={{ fontWeight: 'bold' }}>
                            <h3>Filter by category</h3>
                              <div >
                                <label>
                                  <input
                                    type="checkbox"
                                    value="all"
                                    checked={filterProviderValues.checkedCategories.length === 0}
                                    onChange={filterProviderValues.handleAllCategories}
                                  />
                                  All categories
                                </label>
                              
                                {filterProviderValues.categories.slice() 
                                .sort((a, b) => a.name.localeCompare(b.name)).map(cat => (
                                  <div className="select-category-checkbox" key={cat.id}>
                                    <label >
                                      <input
                                        type="checkbox"
                                        value={cat.id}
                                        checked={filterProviderValues.checkedCategories.includes(cat.id)}
                                        onChange={() => filterProviderValues.handleCategoryCheckbox(cat.id)}
                                      />
                                      {cat.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                        </div>

                        <div className="expenses-filter" style={{ fontWeight: 'bold' }}>
                            <h3>Filter by Expense</h3>
                              <div>
                                <label>
                                  <input
                                    type="checkbox"
                                    value="all"
                                    checked={filterProviderValues.checkedExpenses.length === 0}
                                    onChange={filterProviderValues.handleAllExpenses}
                                  />
                                  All expenses
                                </label>
                              
                                {filterProviderValues.expenses.slice() 
                                .sort((a, b) => a.name.localeCompare(b.name)).map(exp => (
                                  <div className="select-expense-checkbox" key={exp.id}>
                                    <label>
                                      <input
                                        type="checkbox"
                                        value={exp.name}
                                        checked={filterProviderValues.checkedExpenses.includes(exp.name)}
                                        onChange={() => filterProviderValues.handleExpenseCheckbox(exp.name)}
                                      />
                                      {exp.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                        </div>

                        <div className="price-and-total-column">
                          <div className="price-filter">
                            <h3>Filter by Price</h3>
                            <div className="price-inputs">
                              <div className="price-input-group">
                                <label>Min Price (€)</label>
                                <input
                                  type="text"
                                  placeholder="0.00"
                                  value={filterProviderValues.minPrice || ""}
                                  onChange={e => {
                                    const value = e.target.value;
                                    // Allow numbers, dots and commas
                                    if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
                                      filterProviderValues.setMinPrice(value);
                                    }
                                  }}
                                  className={filterProviderValues.priceError ? 'error' : ''}
                                />
                              </div>
                              <div className="price-input-group">
                                <label>Max Price (€)</label>
                                <input
                                  type="text"
                                  placeholder="0.00"
                                  value={filterProviderValues.maxPrice || ""}
                                  onChange={e => {
                                    const value = e.target.value;
                                    // Allow numbers, dots and commas
                                    if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
                                      filterProviderValues.setMaxPrice(value);
                                    }
                                  }}
                                  className={filterProviderValues.priceError ? 'error' : ''}
                                />
                              </div>
                            </div>
                            {filterProviderValues.priceError && (
                              <div className="price-error">
                                <i className="material-icons">error_outline</i>
                                {filterProviderValues.priceError}
                              </div>
                            )}
                          </div>

                          <div className="filtered-total">
                            <div className="filtered-total-content">
                              <i className="material-icons">receipt_long</i>
                              <div className="filtered-total-info">
                                <span className="filtered-total-label"></span>
                                <span className="filtered-total-value">Total: € {calculateFilteredTotal().toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <FilteredDiagram />
                      </div>
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
                      <div className="filter-buttons">
                        <button 
                            className='reset-filters-btn' 
                            onClick={filterProviderValues.resetAllFilters}
                            >    
                          <i className="material-icons">refresh</i>                      
                          Reset filters
                        </button>
                        <button 
                            className='close-filter-btn' 
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