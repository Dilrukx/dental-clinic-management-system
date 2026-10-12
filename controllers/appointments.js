const db = require('../config/db'), crud = require('./crud'), A = require('../models').appointments;
const MODES = ['Cash', 'Card', 'UPI', 'Insurance'], bad = (s, e) => s.status(400).json({ error: e });
module.exports = {
  ...crud(A),
  create: async (q, s) => { // amount is copied from the selected service's cost
    const e = A.check(q.body); if (e) return bad(s, e);
    const [[sv]] = await db.query('SELECT cost FROM services WHERE id=?', [q.body.service_id]);
    if (!sv) return bad(s, 'Invalid service');
    s.status(201).json(await A.get(await A.create({ ...q.body, amount: sv.cost })));
  },
  status: async (q, s) => {
    if (!['Scheduled', 'Completed', 'Cancelled'].includes(q.body.status)) return bad(s, 'Invalid status');
    await db.query('UPDATE appointments SET status=? WHERE id=?', [q.body.status, q.params.id]); s.json(await A.get(q.params.id));
  },
  pay: async (q, s) => { // mock payment: no real gateway, just records mode + fake transaction reference
    const { payment_status = 'Paid', payment_mode } = q.body;
    if (payment_status === 'Paid') {
      if (!MODES.includes(payment_mode)) return bad(s, 'Choose a payment mode');
      await db.query("UPDATE appointments SET payment_status='Paid',payment_mode=?,txn_ref=? WHERE id=?", [payment_mode, 'TXN' + Date.now(), q.params.id]);
    } else await db.query("UPDATE appointments SET payment_status='Pending',payment_mode=NULL,txn_ref=NULL WHERE id=?", [q.params.id]);
    s.json(await A.get(q.params.id));
  }
};
