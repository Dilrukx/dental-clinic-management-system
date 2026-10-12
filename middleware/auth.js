exports.api = (q, s, n) => q.session.uid ? n() : s.status(401).json({ error: 'Login required' });
exports.page = (q, s, n) => q.session.uid ? n() : s.redirect('/login');
