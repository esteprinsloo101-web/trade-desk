# Trade Desk

**Trade Desk** is a polished, mobile-first static web demo of a South African **solo trade job pipeline** (plumber / electrician / handyman).

Sample business: **Mokoena Plumbing · Bloemfontein**. Demo / sample ZAR data only. **Not** legal or tax advice.

Shared DNA with [Life Desk](https://esteprinsloo101-web.github.io/life-desk/) and [Farm Desk](https://esteprinsloo101-web.github.io/farm-desk/): the app **reminds, chases, prepares, closes**; human **Approves** price overrides / discounts / money sends.

## Live URL

**https://esteprinsloo101-web.github.io/trade-desk/**

(GitHub Pages from `main`; allow a minute after push for first deploy.)

## Modules

| Module | Role |
|--------|------|
| **Today** | Due **processes** (tap → guided wizard) · reminders · history · day cash KPI |
| **Jobs** | Pipeline Lead → Quoted → Deposit → Doing → Done → Paid |
| **Money** | Day cash log · invoices · outstanding |
| **Quotes** | Draft / sent / accepted |
| **Customers** | Leads · repeats |
| **Stock / parts** | Reorder points |
| **Contacts** | Suppliers · helpers |
| **Settings** | Module toggles · add/edit processes · reset demo |

## Process types (ProcessRunner)

- **New quote** — scope → price → send (account / WhatsApp links)
- **Deposit chase** — review → chase → log
- **Job day run** — before photo slots → work notes → after photos → done
- **Invoice** — review → send → log
- **Stock reorder** — check lows → order → log

Click outstanding → wizard → Done → set **next due** → item returns to Today when due approaches. Add account links in Settings.

## Open locally

```bash
python3 -m http.server 8771
# http://127.0.0.1:8771/
```

Files: `index.html` · `styles.css` · `app.js` · `README.md`  
Storage key: `trade-desk-v1`

## Disclaimer

Demo / sample data only. Not legal or tax advice. Trade Desk does **not** send WhatsApp, file VAT, or move money for you.
