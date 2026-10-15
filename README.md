# DentaCare – Dental Clinic Management System

Node.js + Express (MVC, REST) · MySQL · jQuery/AJAX frontend · bcrypt + session auth.

## Setup
1. Install Node.js 18+ and MySQL 8+.
2. `cd dental-clinic && npm install`
3. Create DB and seed data: `mysql -u root -p < schema.sql`
4. In`.env` set `DB_PASSWORD`, `SESSION_SECRET` (and optionally the admin login).
5. `npm start` (or `npm run dev`) and open http://localhost:3000

**Default login:** `admin@clinic.com` / `Admin@123`. The admin is created on first start with a bcrypt-hashed password; change it in `.env` **before** first run.

## Structure
```
server.js            app entry, sessions, error handler, admin bootstrap
config/db.js         MySQL pool          middleware/auth.js  session guards
models/              base.js (generic parameterised CRUD) + index.js (table definitions)
controllers/         crud.js, appointments.js (booking, status, mock payment), dashboard.js (cards, CSV)
routes/index.js      all REST routes under /api (login is the only public one)
views/               login.html, app.html (protected page)
public/              css/style.css, js/app.js (jQuery + AJAX)
schema.sql           tables + seed data
```

## Modules
Dentists, Patients (search + History shortcut), Services, Appointments (date filter, service cost auto-applied, double-booking blocked per dentist/date/time), Treatment history (diagnosis, prescription), Dashboard (patients, today's appointments, revenue, pending) with CSV export/print, and mock payments (choose Cash/Card/UPI/Insurance → Paid with fake `TXN…` reference; revert to Pending).

## API (all require login except `/api/auth/*`)
`POST /api/auth/login|logout` · `GET|POST /api/{patients|dentists|services|treatments|appointments}` (`?q=` search, `?date=` for appointments) · `GET|PUT|DELETE /api/{resource}/:id` · `PATCH /api/appointments/:id/status|pay` · `GET /api/dashboard` · `GET /api/reports/appointments.csv?from=&to=`

## Security notes
bcrypt hashing, httpOnly session cookie, every `/api` route guarded, parameterised SQL, server-side required/numeric validation, HTML-escaped output. For production add HTTPS, `cookie.secure`, a persistent session store, and rate limiting on login.
