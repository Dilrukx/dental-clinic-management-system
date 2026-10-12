const bad = (s, e) => s.status(400).json({ error: e });
module.exports = m => ({
  list: async (q, s) => s.json(await m.all(...m.filter(q.query))),
  get: async (q, s) => { const r = await m.get(q.params.id); r ? s.json(r) : s.status(404).json({ error: 'Not found' }); },
  create: async (q, s) => { const e = m.check(q.body); if (e) return bad(s, e); s.status(201).json(await m.get(await m.create(q.body))); },
  update: async (q, s) => { const e = m.check(q.body); if (e) return bad(s, e); await m.update(q.params.id, q.body); s.json(await m.get(q.params.id)); },
  remove: async (q, s) => { await m.remove(q.params.id); s.json({ ok: true }); }
});
