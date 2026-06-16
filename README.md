# Company Link Board

Simple static page to keep shared links (Google Drive, Docs, Sheets, CRM, etc.) organized into folders. Data is stored locally in `localStorage` so users can run this as a static page; for shared company-wide storage host this on a central server or add a backend.

Usage

- Open `index.html` in a browser. On macOS you can run:

```bash
open index.html
```

- Click "Add Link" to add a URL and choose a folder.
- Click "Add Folder" to create a new folder.

- To remove a link, click the small ✖ button next to the link and confirm.

Notes & next steps

- This prototype uses `localStorage` (per-browser). To enable team-wide editing, add a simple server and replace `localStorage` calls in `app.js` with API calls.
- You can customize icons in `app.js` by changing the `ICONS` map.
