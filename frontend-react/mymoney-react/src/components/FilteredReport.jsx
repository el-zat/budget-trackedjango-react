import React, { useMemo } from "react";
import "../styles/FilteredReport.scss";

const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const buildPrintableHtml = ({ htmlContent, title = "Expenses Report" }) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #fff;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        color: #111827;
        padding: 12mm;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 12px;
      }

      th,
      td {
        border: 1px solid #e5e7eb;
        padding: 8px 10px;
        vertical-align: top;
        word-break: break-word;
      }

      thead {
        display: table-header-group;
      }

      tfoot {
        display: table-footer-group;
      }

      thead th {
        background: #f1f5f9;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 11px;
      }

      tfoot td {
        font-weight: 700;
        background: #f8fafc;
      }

      .report-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
      }

      .report-meta {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .meta {
        background: #f8fafc;
        padding: 8px 10px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        font-size: 12px;
      }

      @page {
        size: A4;
        margin: 12mm;
      }
    </style>
  </head>
  <body>
    ${htmlContent}
  </body>
</html>`;

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
    row.spent_at || row.expense_date || row.date || row.created_at || row.updated_at || "";

  const printableRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const dateA = new Date(getRowDate(a)).getTime() || 0;
      const dateB = new Date(getRowDate(b)).getTime() || 0;
      return dateB - dateA;
    });
  }, [filteredRows]);

  const generatedAt = new Date().toLocaleString("en-GB");

  const handlePrint = (event) => {
    event?.preventDefault();

    const rowsHtml = printableRows
      .map((row, index) => {
        const date = formatDate(getRowDate(row));
        const expense = getRowExpenseName(row);
        const category = getRowCategoryName(row);
        const price = Number(row.price || 0).toFixed(2);

        return `
          <tr>
            <td style="text-align:center">${index + 1}</td>
            <td>${date}</td>
            <td>${escapeHtml(expense)}</td>
            <td>${escapeHtml(category)}</td>
            <td style="text-align:right">€ ${price}</td>
          </tr>
        `;
      })
      .join("");

    const htmlContent = `
      <div class="report-header">
        <div>
          <h1 style="margin:0;font-size:20px">Expenses Report</h1>
          <div style="color:#6b7280;font-size:12px">Filtered report for the selected budget period</div>
        </div>
        <div class="report-meta">
          <div class="meta"><strong>Period</strong><div>${escapeHtml(periodLabel)}</div></div>
          <div class="meta"><strong>Generated</strong><div>${escapeHtml(generatedAt)}</div></div>
          <div class="meta"><strong>Rows</strong><div>${printableRows.length}</div></div>
          <div class="meta"><strong>Total</strong><div>€ ${Number(total).toFixed(2)}</div></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:44px">#</th>
            <th style="width:98px">Date</th>
            <th style="width:200px">Expense</th>
            <th style="width:180px">Category</th>
            <th style="width:110px">Price</th>
          </tr>
        </thead>
        <tbody>
          ${
            rowsHtml ||
            `<tr><td colspan="6" style="text-align:center;padding:18px">No filtered expenses found</td></tr>`
          }
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="text-align:right;padding:10px"><strong>Total</strong></td>
            <td style="text-align:right;padding:10px"><strong>€ ${Number(total).toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
    `;

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
          document.body.removeChild(iframe);
        }, 1000);
      }, 300);
    };

    setTimeout(() => {
      try {
        iframeWindow.focus();
        iframeWindow.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }
    }, 500);
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
              <p className="report-subtitle">Filtered report for the selected budget period</p>
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
            <table className="report-table" role="table" aria-label="Filtered expenses table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Expense</th>
                  <th>Category</th>        
                  <th>Price</th>
                </tr>
              </thead>

              <tbody>
                {printableRows.length > 0 ? (
                  printableRows.map((row, index) => (
                    <tr key={row.id || `${getRowDate(row)}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{formatDate(getRowDate(row))}</td>
                      <td>{getRowExpenseName(row)}</td>
                      <td>{getRowCategoryName(row)}</td>
                      <td className="price-cell">€ {Number(row.price || 0).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-report">
                      No filtered expenses found for this selection.
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan="5" className="report-total-label">Total</td>
                  <td className="report-total-value">€ {Number(total).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
};

export { FilteredReport };