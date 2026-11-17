# apexStore

## Pages

- `index.html` is the welcome page.
- `admin.html` is the sample administrator login and product manager.
- `bills.html` is the administrator bills-review page.
- `statistics.html` is the store statistics page.
- `guest.html` is the guest storefront with product search, category filters, and bills that can be generated for administrator review.

## Run locally

Open `index.html` in a modern browser. If the browser blocks JavaScript modules on local files, serve the folder with VS Code Live Server and visit its local URL instead.

The sample administrator credentials are `admin@apexstore.test` / `admin123`. Product and submitted bill data are stored in this browser's local storage. Statistics show inventory value (price multiplied by current stock), not sales. This is a frontend demo only; the sample login is not secure, and bills do not process orders or payments.