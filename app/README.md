# Part Hours History

The hosted app automatically loads the latest shared CSV. Any visitor can upload a replacement (up to 40 MB). The server validates uploads before replacing the saved file; the file persists in the droplet's `data/` directory across container rebuilds. Visitors with an already open page refresh to load another visitor's replacement. Searches and collected summaries remain individual browser-session state. The original CSV is not bundled with the app.

Run locally with Node.js using `node server.cjs` (set `PORT` if port 80 is unavailable), or open `index.html` for a local-only preview without shared persistence.

All work-order statuses are included initially. Each history row represents a part/work-order/combo combination. Estimated Work is summed across operations within each Manufacturing Work Center. Combo expansion shows every part and work order found in that combo in the uploaded file, regardless of the selected status filter. Each part's hours are individualized and are summed normally. Quantity is counted once per history row, not once per operation. Empty work centers appear as Unassigned. Dates show Ship By, not actual production dates. Numbers are displayed to three decimal places; calculations and export retain their original precision. Click a column header to sort.

## Host on your droplet

Use **Add to summary** to capture the selected part's work-center totals, total estimated hours, quantity, work-order count, combo count, description, and current status filter. Search another part and add it to build a multi-part summary. Adding the same part again updates its entry rather than duplicating it. Saved entries remain unchanged when searching, changing filters, or uploading another CSV; add a part again to update it from the current data. Remove individual entries or clear the summary. **Export summary** downloads one row per part plus combined quantity and hour totals. Summaries stay in session memory and are cleared by refreshing or closing the page.

When supplied, the part summary displays Last 12 Month's Usage, COLORS, ITEMNO1, ITEMNO2, OVERITEMNO, Label Length, and Label Width. Blank fields are omitted. Values are collected across all records for the selected part, independent of the status filter, and repeated values are shown once rather than summed. Different values are displayed together. Dimensions retain the CSV values without assuming units. CSVs without these optional columns continue to work.

Production deployment uses the repository-root `Dockerfile` and `docker-compose.yml`. Pull the latest `main`, then run `docker compose config` and `docker compose up -d --build` in `/opt/apps/duramark/hours-history`. Compose binds `./data:/data`. Preserve and back up this folder; do not commit its contents to GitHub. The container keeps internal port 80 and the existing Caddy route. No route change is required when upgrading from the static version.

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

The app sends uploaded CSVs to its own server at the relative `api/csv` endpoint. Any visitor can read and replace the shared file. It uses no external scripts, fonts, or services. The example Nginx static-file block above supports local-only behavior; use the Docker server for shared uploads.
