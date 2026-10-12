require('dotenv').config();
const express = require('express'), session = require('express-session'), path = require('path'), bcrypt = require('bcrypt');
const db = require('./config/db'), { page } = require('./middleware/auth'), app = express();

app.use(express.json(), session({ secret: process.env.SESSION_SECRET || 'dev-secret', resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 864e5 } }));
app.use('/assets', express.static(path.join(__dirname, 'public')));
app.get('/login', (q, s) => s.sendFile(path.join(__dirname, 'views/login.html')));
app.get('/', page, (q, s) => s.sendFile(path.join(__dirname, 'views/app.html')));
app.use('/api', require('./routes'));

const msg = { ER_DUP_ENTRY: 'This dentist already has an appointment at that date and time', ER_ROW_IS_REFERENCED_2: 'Cannot delete: this record is used by appointments or treatments', ER_NO_REFERENCED_ROW_2: 'Selected patient, dentist or service does not exist' };
app.use((e, q, s, n) => { console.error(e.message); s.status(msg[e.code] ? 409 : 500).json({ error: msg[e.code] || 'Server error' }); });

(async () => { // create the first admin (bcrypt-hashed) if the users table is empty
  const [[c]] = await db.query('SELECT COUNT(*) n FROM users');
  if (!c.n) await db.query('INSERT INTO users(email,password) VALUES(?,?)', [process.env.ADMIN_EMAIL || 'admin@clinic.com', await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10)]);
  app.listen(process.env.PORT || 3000, () => console.log('Running on http://localhost:' + (process.env.PORT || 3000)));
})();
