const r = require('express').Router(), bcrypt = require('bcrypt'), db = require('../config/db');
const { api } = require('../middleware/auth'), crud = require('../controllers/crud'), M = require('../models');
const ap = require('../controllers/appointments'), dash = require('../controllers/dashboard');

r.post('/auth/login', async (q, s) => {
  const [[u]] = await db.query('SELECT * FROM users WHERE email=?', [String(q.body.email || '')]);
  if (!u || !(await bcrypt.compare(String(q.body.password || ''), u.password))) return s.status(401).json({ error: 'Wrong email or password' });
  q.session.uid = u.id; s.json({ ok: true });
});
r.post('/auth/logout', (q, s) => q.session.destroy(() => s.json({ ok: true })));

r.use(api); // everything below requires an admin session
r.get('/dashboard', dash.summary);
r.get('/reports/appointments.csv', dash.csv);
for (const n of ['patients', 'dentists', 'services', 'treatments']) {
  const c = crud(M[n]);
  r.get(`/${n}`, c.list); r.get(`/${n}/:id`, c.get); r.post(`/${n}`, c.create); r.put(`/${n}/:id`, c.update); r.delete(`/${n}/:id`, c.remove);
}
r.get('/appointments', ap.list); r.post('/appointments', ap.create); r.delete('/appointments/:id', ap.remove);
r.patch('/appointments/:id/status', ap.status); r.patch('/appointments/:id/pay', ap.pay);
module.exports = r;
