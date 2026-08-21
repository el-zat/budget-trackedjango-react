export const buildPrintableHtml = ({
  htmlContent,
  title = "Expenses Report",
}) => `<!doctype html>
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
