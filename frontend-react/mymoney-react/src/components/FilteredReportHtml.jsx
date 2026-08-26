const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const buildFilteredReportHtmlContent = ({
  printableRows,
  periodLabel,
  generatedAt,
  total,
  formatDate,
  getRowDate,
  getRowCategoryName,
  getRowExpenseName, 
  categoryBreakdown = [],
}) => {
  const rowsHtml = printableRows
    .map((row, index) => {
      const date = formatDate(getRowDate(row));     
      const category = getRowCategoryName(row);
      const expense = getRowExpenseName(row);
      const price = Number(row.price || 0).toFixed(2);

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${date}</td>
          <td>${escapeHtml(category)}</td>
          <td>${escapeHtml(expense)}</td>          
          <td>€ ${price}</td>
        </tr>
      `;
    })
    .join("");

  const breakdownHtml = categoryBreakdown
    .map((item) => {
      return `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>€ ${Number(item.sum || 0).toFixed(2)}</td>
          <td>${Number(item.percent || 0).toFixed(1)}%</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="report-header">
      <div>
        <h1 style="margin:0;font-size:20px">Expenses Report</h1>
        <div style="color:#6b7280;font-size:12px">Filtered report for the selected budget period</div>
      </div>
      <div class="report-meta">
        <div class="meta"><strong>Period</strong><div>${escapeHtml(periodLabel)}</div></div>
        <div class="meta"><strong>Generated</strong><div>${escapeHtml(generatedAt)}</div></div>
        <div class="meta"><strong>Total</strong><div>€ ${Number(total).toFixed(2)}</div></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:44px;text-align:center">#</th>
          <th style="width:98px;text-align:center">Date</th>
          <th style="width:180px;text-align:center">Category</th>
          <th style="width:200px;text-align:center">Expense</th>      
          <th style="width:110px;text-align:center">Price</th>
        </tr>
      </thead>
      <tbody>
        ${
          rowsHtml ||
          `<tr><td colspan="5" style="text-align:center;padding:18px">No filtered expenses found</td></tr>`
        }
      </tbody>
      <tfoot></tfoot>
    </table>

    <div style="margin: 18px 0 14px 0;">
      <h2 style="margin:0 0 8px 0; font-size:16px;">Categories Breakdown</h2>
      <table style="margin-bottom: 16px;">
        <thead>
          <tr>
            <th style="text-align:center">Category</th>
            <th style="width:120px;text-align:center">Total</th>
            <th style="width:90px;text-align:center">Share</th>
          </tr>
        </thead>
        <tbody>
          ${
            breakdownHtml ||
            `<tr><td colspan="3" style="text-align:center;padding:18px">No category summary available</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
};