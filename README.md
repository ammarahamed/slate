# Slate

Production management for agencies, with two sides sharing one flow: the agency runs the work, the client sees progress and makes decisions.

This is a front-end prototype. Data lives in the browser (localStorage), so there is no backend, no real logins and no file upload yet.

## Run it

```bash
python3 -m http.server 4765
```

Then open http://localhost:4765/ and pick a side. Open the agency side and the client side in two tabs: what happens on one shows up on the other.

## What is in it

- `index.html`: the door page linking to both sides
- `agency.html`: agency workspace (projects, board, tasks, time, team load, schedule, money, clients, kit)
- `client.html`: client portal (progress, approvals, feedback, change orders, messages, approved files)
- `app.js`: all logic for both sides, no build step
- `styles.css`: styles

## Flow covered

Brief → creative → pre-production (mood board, shot list, equipment) → shoot → edit → delivery → live changes. Every deliverable is versioned, every approval and change is logged with a timestamp, and extra revision rounds become change orders.

## Not built yet

- Backend and database
- Real logins with per-client access
- File and video upload
- Email alerts
