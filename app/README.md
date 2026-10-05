# Part Hours History

Open `index.html` in a modern browser, upload the saved-search CSV, and type a part number. No installation, build, database, or backend is required. All CSV processing takes place in browser memory; refreshing the page starts a new session. The original CSV is not bundled with the app.

All work-order statuses are included initially. Each history row represents a part/work-order/combo combination. Estimated Work is summed across operations within each Manufacturing Work Center. Combo expansion shows every part and work order found in that combo in the uploaded file, regardless of the selected status filter. Each part's hours are individualized and are summed normally. Quantity is counted once per history row, not once per operation. Empty work centers appear as Unassigned. Dates show Ship By, not actual production dates. Numbers are displayed to three decimal places; calculations and export retain their original precision. Click a column header to sort.

## Host on your droplet

Use **Add to summary** to capture the selected part's work-center totals, total estimated hours, quantity, work-order count, combo count, description, and current status filter. Search another part and add it to build a multi-part summary. Adding the same part again updates its entry rather than duplicating it. Saved entries remain unchanged when searching, changing filters, or uploading another CSV; add a part again to update it from the current data. Remove individual entries or clear the summary. **Export summary** downloads one row per part plus combined quantity and hour totals. Summaries stay in session memory and are cleared by refreshing or closing the page.

When supplied, the part summary displays Last 12 Month's Usage, COLORS, ITEMNO1, ITEMNO2, OVERITEMNO, Label Length, and Label Width. Blank fields are omitted. Values are collected across all records for the selected part, independent of the status filter, and repeated values are shown once rather than summed. Different values are displayed together. Dimensions retain the CSV values without assuming units. CSVs without these optional columns continue to work.

Copy `index.html`, `styles.css`, and `app.js` to a directory served by your existing web server, for example `/var/www/part-hours`. Do not copy the source CSV into the web directory.

Example Nginx server block (replace the hostname and add HTTPS using your existing certificate setup):

```nginx
server {
    listen 80;
    server_name hours.example.com;
    root /var/www/part-hours;
    index index.html;
    location / { try_files $uri $uri/ =404; }
}
```

This app sends no CSV data to the server and uses no external scripts, fonts, or services. Access control, if desired, can be configured on your existing web server.
