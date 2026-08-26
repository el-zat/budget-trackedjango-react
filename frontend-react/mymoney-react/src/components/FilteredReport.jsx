import { useMemo } from "react";
import "../styles/FilteredReport.scss";
import { buildFilteredReportHtmlContent } from "./FilteredReportHtml";
import { buildPrintableHtml } from "./PrintableReportHtml";


const FilteredReport = ({
  periodLabel = "All Time",
  filteredRows = [],
  checkedCategories = [],
  checkedExpenses = [],
  categories = [],
  expenses = [],
  minPrice = "",
  maxPrice = "",
  searchWord = "",
  total = 0,
  onClose,
}) => {
  const categoryNames = useMemo(() => {
    if (!checkedCategories.length) return ["All categories"];

    return checkedCategories.map((categoryId) => {
      const foundCategory = categories.find(
        (category) => String(category.id) === String(categoryId)
      );
      return foundCategory ? foundCategory.name : `Category ${categoryId}`;
    });
  }, [checkedCategories, categories]);

  const expenseNames = useMemo(() => {
    if (!checkedExpenses.length) return ["All expenses"];
    return checkedExpenses;
  }, [checkedExpenses]);

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB");
  };

  const getRowCategoryName = (row) => {
    const possibleCategoryId =
      row.category ??
      row.category_id ??
      row.categoryId ??
      row.expense_category ??
      row.expense_category_id;

    const foundCategory = categories.find(
      (category) => String(category.id) === String(possibleCategoryId)
    );

    if (foundCategory) return foundCategory.name;
    if (row.category_name) return row.category_name;
    if (row.categoryName) return row.categoryName;

    return "—";
  };

  const getRowExpenseName = (row) => {
    if (row.name) return row.name;
    if (row.expense_name) return row.expense_name;
    if (row.title) return row.title;

    const possibleExpenseId = row.expense ?? row.expense_id ?? row.expenseId;
    const foundExpense = expenses.find(
      (expense) => String(expense.id) === String(possibleExpenseId)
    );

    return foundExpense ? foundExpense.name : "—";
  };

  const getRowDate = (row) =>
    row.spent_at ||
    row.expense_date ||
    row.date ||
    row.created_at ||
    row.updated_at ||
    "";

  const printableRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const priceA = Number(a.price || 0);
      const priceB = Number(b.price || 0);
      return priceB - priceA;
    });
  }, [filteredRows]);

  const categoryBreakdown = useMemo(() => {
    const grouped = printableRows.reduce((acc, row) => {
      const categoryName = getRowCategoryName(row) || "Uncategorized";
      const price = Number(row.price || 0);

      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          count: 0,
          sum: 0,
        };
      }

      acc[categoryName].count += 1;
      acc[categoryName].sum += price;

      return acc;
    }, {});

    return Object.values(grouped)
      .map((item) => ({
        ...item,
        percent: total > 0 ? (item.sum * 100) / total : 0,
      }))
      .sort((a, b) => b.sum - a.sum);
  }, [printableRows, total, categories]);

  const generatedAt = new Date().toLocaleString("en-GB");

  const handlePrint = (event) => {
    event?.preventDefault();

    const htmlContent = buildFilteredReportHtmlContent({
      printableRows,
      periodLabel,
      generatedAt,
      total,
      categoryBreakdown,
      formatDate,
      getRowDate,
      getRowExpenseName,
      getRowCategoryName,
    });

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");

    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow;
    const iframeDocument = iframeWindow?.document;

    if (!iframeWindow || !iframeDocument) {
      document.body.removeChild(iframe);
      return;
    }

    iframeDocument.open();
    iframeDocument.write(
      buildPrintableHtml({
        htmlContent,
        title: "Expenses Report",
      })
    );
    iframeDocument.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframeWindow.focus();
        iframeWindow.print();

        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }, 300);
    };
  };

  return (
    <div className="report-overlay">
      <div className="filtered-report filtered-report--large">
        <div className="report-toolbar no-print">
          <button
            type="button"
            className="report-print-btn"
            onClick={handlePrint}
            aria-label="Print report"
            title="Print report"
          >
            <i className="material-icons">print</i>
          </button>

          <button type="button" className="report-close-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="report-paper">
          <header className="report-header">
            <div>
              <h1>Expenses Report</h1>
              <p className="report-subtitle">
                Filtered report for the selected budget period
              </p>
            </div>

            <div className="report-meta">
              <div>
                <span className="meta-label">Period</span>
                <span className="meta-value">{periodLabel}</span>
              </div>
              <div>
                <span className="meta-label">Generated</span>
                <span className="meta-value">{generatedAt}</span>
              </div>
              <div>
                <span className="meta-label">Total</span>
                <span className="meta-value">€ {Number(total).toFixed(2)}</span>
              </div>
            </div>
          </header>

          <section className="report-filters-summary">
            <div className="summary-card">
              <div className="summary-title">Categories</div>
              <div className="summary-value">{categoryNames.join(", ")}</div>
            </div>

            <div className="summary-card">
              <div className="summary-title">Expenses</div>
              <div className="summary-value">{expenseNames.join(", ")}</div>
            </div>

            <div className="summary-card">
              <div className="summary-title">Price range</div>
              <div className="summary-value">
                {minPrice || maxPrice
                  ? `€ ${minPrice || "0"} — € ${maxPrice || "∞"}`
                  : "Any price"}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-title">Search</div>
              <div className="summary-value">{searchWord || "Not used"}</div>
            </div>
          </section>

          <section className="report-table-section">
            <table
              className="report-table"
              role="table"
              aria-label="Filtered expenses table"
            >
              <thead>
                <tr>
                  <th></th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Expense</th>                  
                  <th>Price</th>
                </tr>
              </thead>

              <tbody>
                {printableRows.length > 0 ? (
                  printableRows.map((row, index) => (
                    <tr key={row.id || `${getRowDate(row)}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{formatDate(getRowDate(row))}</td>
                      <td>{getRowCategoryName(row)}</td>
                      <td>{getRowExpenseName(row)}</td>                     
                      <td className="price-cell">
                        € {Number(row.price || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-report">
                      No filtered expenses found for this selection.
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot></tfoot>
            </table>
          </section>

          <section className="report-breakdown-section">
            <h2>Categories Breakdown</h2>

            {categoryBreakdown.length > 0 ? (
              <table
                className="report-table report-breakdown-table"
                role="table"
                aria-label="Categories breakdown table"
              >
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBreakdown.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>€ {item.sum.toFixed(2)}</td>
                      <td>{item.percent.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-report">No category summary available.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export { FilteredReport };
