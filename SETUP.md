# Trade Desk — setup

## 1) Open the app (required for PWA)
Unzip this pack. From the `app/` folder run a local static server (service worker needs http/https, not `file://`):

```bash
cd app
python3 -m http.server 8765
```

Open http://localhost:8765 in Chrome/Edge/Safari.

Or upload `app/` to any static host (Netlify drop, GitHub Pages, etc.).

## 2) Install (Add to Home Screen)
- Mobile: browser menu → Add to Home Screen / Install app
- Desktop Chrome: install icon in the address bar when offered

## 3) Clear sample / import your jobs
Demo Mokoena Plumbing ships as sample. Options:
1. Settings → **Export JSON** once you’ve set your own data (backup)
2. Settings → **Import JSON** — confirm replace (wipes current device data)
3. Use `sample/sample-import.json` only to practice Import — then replace with your export

## 4) Quote → deposit → job → invoice
- Today shows due ProcessRunner steps
- Complete a stage → next due returns when due
- Store WhatsApp / bank / supplier links you already use; app opens them — you send / pay

## 5) Notifications
- Settings → enable notifications / request permission
- Quiet hours skip alerts
- **Limitation:** static PWA — no background push. Reminders fire while the tab/PWA is open

## 6) Backup
Settings → Export JSON · Import with confirm replace.
