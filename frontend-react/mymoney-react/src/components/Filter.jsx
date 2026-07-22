import React, { useContext, useMemo, useState } from "react";
import "../styles/Filter.scss";
import "../styles/FilteredReport.scss";
import { FilterContext } from "../context/FilterContext";
import { FilteredDiagram } from "./FilteredDiagram";
import { FilteredReport } from "./FilteredReport";

const Filter = ({ periodLabel = "All Time" }) => {
  const filterProviderValues = useContext(FilterContext);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const filteredTotal = useMemo(() => {
    return filterProviderValues.filteredRows.reduce((total, row) => {
      return total + (parseFloat(row.price) || 0);
    }, 0);
  }, [filterProviderValues.filteredRows]);

  const handleCreateReport = () => {
    setIsReportOpen(true);
  };

  const handleCloseReport = () => {
    setIsReportOpen(false);
  };

  return (
    <>
      {filterProviderValues.isFilterOpen && (
        <div className="filter-container">
          <div className="filter">
            <div className="filters-row">
              <div className="categories-filter" style={{ fontWeight: "bold" }}>
                <h3>Filter by category</h3>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      value="all"
                      checked={filterProviderValues.checkedCategories.length === 0}
                      onChange={filterProviderValues.handleAllCategories}
                    />
                    All categories
                  </label>

                  {filterProviderValues.categories
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((cat) => (
                      <div className="select-category-checkbox" key={cat.id}>
                        <label>
                          <input
                            type="checkbox"
                            value={cat.id}
                            checked={filterProviderValues.checkedCategories.includes(cat.id)}
                            onChange={() =>
                              filterProviderValues.handleCategoryCheckbox(cat.id)
                            }
                          />
                          {cat.name}
                        </label>
                      </div>
                    ))}
                </div>
              </div>

              <div className="expenses-filter" style={{ fontWeight: "bold" }}>
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

                  {filterProviderValues.expenses
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((exp) => (
                      <div className="select-expense-checkbox" key={exp.id}>
                        <label>
                          <input
                            type="checkbox"
                            value={exp.name}
                            checked={filterProviderValues.checkedExpenses.includes(exp.name)}
                            onChange={() =>
                              filterProviderValues.handleExpenseCheckbox(exp.name)
                            }
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
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
                            filterProviderValues.setMinPrice(value);
                          }
                        }}
                        className={filterProviderValues.priceError ? "error" : ""}
                      />
                    </div>

                    <div className="price-input-group">
                      <label>Max Price (€)</label>
                      <input
                        type="text"
                        placeholder="0.00"
                        value={filterProviderValues.maxPrice || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
                            filterProviderValues.setMaxPrice(value);
                          }
                        }}
                        className={filterProviderValues.priceError ? "error" : ""}
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
                      <span className="filtered-total-value">
                        Total: € {filteredTotal.toFixed(2)}
                      </span>
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
                onClick={() =>
                  filterProviderValues.filterBySearchWord(
                    filterProviderValues.searchWord
                  )
                }
              >
                <i className="material-icons">search</i>
              </button>
            </div>

            <button
              type="button"
              className="create-report-btn"
              onClick={handleCreateReport}
            >
              <i className="material-icons">description</i>
              Create report
            </button>

            <div className="filter-buttons">
              <button
                type="button"
                className="reset-filters-btn"
                onClick={filterProviderValues.resetAllFilters}
              >
                <i className="material-icons">refresh</i>
                Reset filters
              </button>

              <button
                type="button"
                className="close-filter-btn"
                onClick={filterProviderValues.closeFilter}
              >
                Close filter
              </button>
            </div>
          </div>

          {isReportOpen && (
            <FilteredReport
              periodLabel={periodLabel}
              filteredRows={filterProviderValues.filteredRows}
              checkedCategories={filterProviderValues.checkedCategories}
              checkedExpenses={filterProviderValues.checkedExpenses}
              categories={filterProviderValues.categories}
              expenses={filterProviderValues.expenses}
              minPrice={filterProviderValues.minPrice}
              maxPrice={filterProviderValues.maxPrice}
              searchWord={filterProviderValues.searchWord}
              total={filteredTotal}
              onClose={handleCloseReport}
            />
          )}
        </div>
      )}
    </>
  );
};

export { Filter };