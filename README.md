# Trade Desk

**Trade Desk** is a mobile-first **free try of the live Gumroad** South African **solo trade job pipeline** (plumber / electrician / handyman).

Sample business: **Mokoena Plumbing · Bloemfontein**. Sample ZAR data only. **NOT** financial, legal, or tax advice.

**Buy live unlock (Gumroad):** [Trade Desk — R179](https://stofficial.gumroad.com/l/zomth)  
Also: [Stokvel OS — R99](https://stofficial.gumroad.com/l/ydbgne).

Shared DNA with [Life Desk](https://esteprinsloo101-web.github.io/life-desk/) and [Group Money](https://esteprinsloo101-web.github.io/group-money/): the app **reminds, chases, prepares, closes**; human **Approves** price overrides / irreversible money steps / sends. Installable as a **PWA** (Add to Home Screen) with an offline-ish shell cache.

## Free try (live)

**https://esteprinsloo101-web.github.io/trade-desk/**

GitHub Pages from `main` (allow a minute after merge for deploy). Paid unlock: [Gumroad R179](https://stofficial.gumroad.com/l/zomth).

## Modules

| Module | Role |
|--------|------|
| **Today** | Due processes · job cash loop · day-cash queue · reminders · history |
| **Jobs** | Pipeline Lead → Quoted → Deposit → Doing → Done → Paid |
| **Money** | Day cash log · invoices · outstanding |
| **Quotes** | Draft / sent / accepted |
| **Customers** | Leads · repeats |
| **Stock / parts** | Reorder points |
| **Contacts** | Suppliers · helpers |
| **Settings** | Modules · quiet hours · notifications · export/import |

## Process types (ProcessRunner — not checklists)

- **New quote** — scope → price → send → lock Quoted (unlocks deposit chase)
- **Deposit chase** — review → chase → **Approve log deposit** (irreversible money step) → confirm (unlocks job day)
- **Job day run** — before photos → work → after → done (unlocks invoice)
- **Invoice** — review → send → **Approve issue** → confirm
- **Stock reorder** — check lows → order → log

Click outstanding → wizard → Done → set **next due** → item returns to Today when due approaches. Completing a stage **ensures the next ProcessRunner** in the quote → deposit → job → invoice loop.

## PWA (install + offline shell)

1. Open the live URL or local server in Chrome / Edge / Safari.
2. Use **Install** / **Add to Home Screen** when the banner appears (or browser menu).
3. On iOS Safari: Share → **Add to Home Screen**.
4. The service worker caches the shell: `index.html`, `app.js`, `styles.css`, `manifest.webmanifest` (+ icons). Cache name: **`trade-desk-shell-v2`**. Offline use is **shell-only** — open the app once online first.

## Reminders v1

- **Today → Next reminders** shows the in-app queue for due / lead-window processes (tap to run the wizard).
- **Enable notifications** (or Settings → Request permission). If denied, the UI stays graceful — in-app queue still works.
- **Quiet hours** (default 21:00–07:00) are stored in `localStorage` with app state; alerts are skipped during quiet hours and fire times shift outside them.
- After you finish a process (**Done**), the next reminder is scheduled from the new **next due** (when permission is granted and the tab can run timers).

## Backup (export / import)

In **Settings → Backup**:

1. **Export JSON** — downloads app state (`trade-desk-v4` payload: jobs, quotes, invoices, cash log, processes, history, modules, prefs).
2. **Import JSON** — pick a previous export to restore (round-trip). Invalid files toast an error and leave current data alone.

## Open locally

Plain static files. No build step. **Serve over http(s)** so the service worker and notifications can register.

```bash
# from this folder
python3 -m http.server 8771
# then open http://127.0.0.1:8771/
```

Files: `index.html` · `styles.css` · `app.js` · `manifest.webmanifest` · `service-worker.js` · `icons/` · `README.md`

Storage key: `trade-desk-v4`

## Verify (local)

1. `python3 -m http.server 8771` then open http://127.0.0.1:8771/
2. **Today** — confirm job cash loop (quote → deposit → job → invoice), day-cash queue, due processes, reminders.
3. Run **Quote** → finish → deposit chase appears due; run **Deposit** (Approve log) → job day unlocks; run **Job day** → invoice unlocks; run **Invoice** (Approve issue).
4. **Settings** — quiet hours; request notifications; **Export JSON** then **Import JSON**.
5. DevTools → Application → Manifest + Service Worker (`trade-desk-shell-v2`); optional: go offline and confirm shell still loads.
6. `curl -I https://esteprinsloo101-web.github.io/trade-desk/` after Pages deploy from `main`.

## Disclaimer

Free try / sample data only. **NOT** financial, legal, or tax advice. Trade Desk does **not** send WhatsApp, file VAT, or move money for you. **You Approve** irreversible money steps (deposit log, invoice issue). Confirm real-world compliance yourself.

## Update 2026-09-11

Platform bar: elderly UI, location+purpose onboarding.

**feat/pwa-reminders-export:** PWA manifest + service worker shell cache (`trade-desk-shell-v2`), install affordance, reminders v1 (notifications + quiet hours + post-Done schedule), JSON export/import backup, stronger quote → deposit → job → invoice ProcessRunner loops with Approve on money steps, day-cash Today queue.
