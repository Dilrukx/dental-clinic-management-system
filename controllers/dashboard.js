const db = require('../config/db');
exports.summary = async (q, s) => {
  const [[r]] = await db.query(`SELECT (SELECT COUNT(*) FROM patients) patients,(SELECT COUNT(*) FROM dentists) dentists,
    (SELECT COUNT(*) FROM appointments WHERE appt_date=CURDATE()) today,
    (SELECT COALESCE(SUM(amount),0) FROM appointments WHERE payment_status='Paid') revenue,
    (SELECT COALESCE(SUM(amount),0) FROM appointments WHERE payment_status='Pending' AND status<>'Cancelled') pending`);
  s.json(r);
};
exports.csv = async (q, s) => {
  const { from = '1900-01-01', to = '2999-12-31' } = q.query;
  const [rows] = await db.query(`SELECT a.id,p.name patient,d.name dentist,sv.name service,a.appt_date,a.appt_time,a.status,a.amount,a.payment_status,a.payment_mode,a.txn_ref
    FROM appointments a JOIN patients p ON p.id=a.patient_id JOIN dentists d ON d.id=a.dentist_id JOIN services sv ON sv.id=a.service_id
    WHERE a.appt_date BETWEEN ? AND ? ORDER BY a.appt_date`, [from, to]);
  const h = rows[0] ? Object.keys(rows[0]) : ['id'], esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  s.type('text/csv').attachment('appointments-report.csv').send([h.join(','), ...rows.map(r => h.map(k => esc(r[k])).join(','))].join('\n'));
};
