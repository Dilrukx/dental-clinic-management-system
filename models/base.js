const db = require('../config/db');
// Generic model: all values are bound as parameters (no SQL injection); table/column names are constants.
module.exports = ({ table, fields, required = [], num = [], join = '', cols = '', search = [], dateCol }) => {
  const sel = `SELECT t.*${cols} FROM ${table} t ${join}`;
  const val = d => Object.fromEntries(fields.filter(f => d[f] !== undefined).map(f => [f, d[f] === '' ? null : d[f]]));
  return {
    check: d => required.filter(f => !String(d[f] ?? '').trim()).map(f => `${f} is required`)[0] ||
      num.filter(f => isNaN(d[f]) || d[f] < 0).map(f => `${f} must be a positive number`)[0],
    filter(q) {
      const w = [], p = [];
      if (q.q && search.length) { w.push('(' + search.map(c => c + ' LIKE ?').join(' OR ') + ')'); search.forEach(() => p.push(`%${q.q}%`)); }
      if (q.date && dateCol) { w.push(dateCol + '=?'); p.push(q.date); }
      return [w.length ? 'WHERE ' + w.join(' AND ') : '', p];
    },
    all: async (w = '', p = []) => (await db.query(`${sel} ${w} ORDER BY t.id DESC`, p))[0],
    get: async id => (await db.query(`${sel} WHERE t.id=?`, [id]))[0][0],
    create: async d => (await db.query(`INSERT INTO ${table} SET ?`, [val(d)]))[0].insertId,
    update: async (id, d) => db.query(`UPDATE ${table} SET ? WHERE id=?`, [val(d), id]),
    remove: async id => db.query(`DELETE FROM ${table} WHERE id=?`, [id])
  };
};
