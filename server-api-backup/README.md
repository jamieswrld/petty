Server-only API routes (live chat, player registry, treasury).

These were moved out of `src/app/api` so the site can deploy as a static export on GitHub Pages. The core game runs fully in the browser.

To restore server APIs, move `api/` back to `src/app/api` and remove `output: 'export'` from `next.config.js`.
