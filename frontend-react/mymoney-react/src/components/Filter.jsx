import React, {useContext, useState} from "react"
import  '../styles/Filter.scss'
import { FilterContext } from "../context/FilterContext"
import { ModalContext } from "../context/ModalContext";
import Modal from './Modal';

const Filter = () => {

    const filterProviderValues = useContext(FilterContext)
    const modalProviderValues = useContext(ModalContext);


    return  <React.Fragment>                
                
                  <Modal isOpen={modalProviderValues.isModalFilterOpen} onClose={() => 
                      modalProviderValues.setModalFilterIsOpen(false)}> 
                      <div className="modal-filter">
                        <div className="date-filter">
                        {filterProviderValues.selectedInterval !== "custom" ? (
                          <div className="interval">
                          <form style={{ fontWeight: 'bold' }}>
                            <div>
                              <label>
                                <input
                                  type="radio"
                                  name="interval"
                                  value="month"
                                  checked={filterProviderValues.selectedInterval === "month"}
                                  onChange={e => {
                                    filterProviderValues.setSelectedInterval(e.target.value);
                                    filterProviderValues.handleDateFilter(e.target.value);
                                  }}
                                />
                                This Month
                              </label>
                            </div>
                            <div>
                              <label>
                                <input
                                  type="radio"
                                  name="interval"
                                  value="today"
                                  checked={filterProviderValues.selectedInterval === "today"}
                                  onChange={e => {
                                    filterProviderValues.setSelectedInterval(e.target.value);
                                    filterProviderValues.handleDateFilter(e.target.value);
                                  }}
                                />
                                Today
                              </label>
                            </div>
                            <div>
                              <label>
                                <input
                                  type="radio"
                                  name="interval"
                                  value="year"
                                  checked={filterProviderValues.selectedInterval === "year"}
                                  onChange={e => {
                                    filterProviderValues.setSelectedInterval(e.target.value);
                                    filterProviderValues.handleDateFilter(e.target.value);
                                  }}
                                />
                                This Year
                              </label>
                            </div>
                            <div>
                              <label>
                                <input
                                  type="radio"
                                  name="interval"
                                  value="custom"
                                  checked={filterProviderValues.selectedInterval === "custom"}
                                  onChange={e => {
                                    filterProviderValues.setSelectedInterval(e.target.value);
                                    // Не вызываем handleDateFilter для custom
                                  }}
                                />
                                Custom Interval
                              </label>
                            </div>
                          </form>
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

                        <div className="categories" style={{ fontWeight: 'bold' }}>
                          <div>
                            <label>
                              <input
                                type="checkbox"
                                value="all"
                                checked={filterProviderValues.selectedCategories.length === 0}
                                onChange={filterProviderValues.handleAllCategories}
                              />
                              All Categories
                            </label>
                          </div>
                          {filterProviderValues.categories.map(cat => (
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
                    
                  </Modal>   
                
              
            </React.Fragment>
}
    
export {Filter}