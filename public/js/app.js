const I = { dashboard: '<path d="M4 13h6V4H4zM14 20h6v-9h-6zM14 8h6V4h-6zM4 20h6v-3H4z"/>', patients: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  dentists: '<path d="M6 3v6a4 4 0 008 0V3M10 13v3a4 4 0 008 0v-2"/><circle cx="18" cy="12" r="2"/>', services: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  appointments: '<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/>', treatments: '<path d="M8 4h8v3H8zM6 6h12v15H6zM9 12h6M9 16h4"/>' };
const P = ['Cash', 'Card', 'UPI', 'Insurance'], S = ['Scheduled', 'Completed', 'Cancelled'];
// f: form fields [key,label,type]; c: table columns. 'sel:x' = dropdown loaded from /api/x
const T = {
  dashboard: { t: 'Dashboard' },
  patients: { t: 'Patients', c: ['name', 'phone', 'email', 'dob', 'address'], f: [['name', 'Full name'], ['phone', 'Phone'], ['email', 'Email', 'email'], ['dob', 'Date of birth', 'date'], ['address', 'Address']] },
  dentists: { t: 'Dentists', c: ['name', 'specialization', 'schedule', 'phone'], f: [['name', 'Full name'], ['specialization', 'Specialization'], ['schedule', 'Schedule (e.g. Mon-Fri 09:00-16:00)'], ['phone', 'Phone']] },
  services: { t: 'Services', c: ['name', 'cost', 'duration'], f: [['name', 'Service name'], ['cost', 'Cost', 'number'], ['duration', 'Duration (minutes)', 'number']] },
  appointments: { t: 'Appointments', d: 1, c: ['patient', 'dentist', 'service', 'appt_date', 'appt_time', 'status', 'amount', 'payment_status'],
    f: [['patient_id', 'Patient', 'sel:patients'], ['dentist_id', 'Dentist', 'sel:dentists'], ['service_id', 'Service', 'sel:services'], ['appt_date', 'Date', 'date'], ['appt_time', 'Time', 'time']] },
  treatments: { t: 'Treatment history', c: ['patient', 'dentist', 'visit_date', 'diagnosis', 'prescription'],
    f: [['patient_id', 'Patient', 'sel:patients'], ['dentist_id', 'Dentist', 'sel:dentists'], ['visit_date', 'Visit date', 'date'], ['diagnosis', 'Diagnosis', 'textarea'], ['prescription', 'Prescription', 'textarea']] }
};
let cur, rows = [];
const esc = v => $('<i>').text(v ?? '').html().replace(/"/g, '&quot;');
const api = (m, u, d) => $.ajax({ url: '/api' + u, method: m, contentType: 'application/json', data: d ? JSON.stringify(d) : undefined })
  .fail(x => x.status == 401 ? location = '/login' : alert(x.responseJSON?.error || 'Request failed'));

$('#nav').html(Object.keys(T).map(k => `<a data-k="${k}"><svg viewBox="0 0 24 24">${I[k]}</svg>${T[k].t}</a>`).join('')).on('click', 'a', function () { show($(this).data('k')); });
$('#out').click(() => api('POST', '/auth/logout').done(() => location = '/login'));

function show(k) {
  cur = k; $('#nav a').removeClass('on').filter(`[data-k=${k}]`).addClass('on'); $('#title').text(T[k].t); $('#sub').text(k === 'dashboard' ? new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }) : '');
  if (k === 'dashboard') return dash();
  $('#bar').html(`<input id="q" placeholder="Search…">${T[k].d ? '<input id="d" type="date">' : ''}<button id="add">Add ${T[k].t.toLowerCase().replace(/s$/, '')}</button>`);
  load();
}
function cell(r, x) {
  if (x === 'status') return `<span class="tag ${r[x]}">${r[x]}</span>`;
  if (x === 'payment_status') return `<span class="tag ${r[x]}">${r[x]}</span>${r.payment_mode ? ' ' + esc(r.payment_mode) : ''}`;
  if (x === 'amount' || x === 'cost') return Number(r[x]).toFixed(2);
  return esc(x === 'appt_time' ? (r[x] || '').slice(0, 5) : r[x]);
}
const acts = r => cur === 'appointments'
  ? `<button class="s" data-a="pay" data-id="${r.id}">${r.payment_status === 'Paid' ? 'Mark pending' : 'Take payment'}</button> <select class="st" data-id="${r.id}">${S.map(s => `<option${s === r.status ? ' selected' : ''}>${s}</option>`).join('')}</select> <button class="s r" data-a="del" data-id="${r.id}">Delete</button>`
  : `${cur === 'patients' ? `<button class="s" data-a="hist" data-id="${r.id}">History</button> ` : ''}<button class="s g" data-a="edit" data-id="${r.id}">Edit</button> <button class="s r" data-a="del" data-id="${r.id}">Delete</button>`;

function load() {
  const c = T[cur];
  api('GET', `/${cur}?q=${encodeURIComponent($('#q').val() || '')}&date=${$('#d').val() || ''}`).done(d => {
    rows = d;
    $('#view').html(`<div class="tw"><table><tr>${c.c.map(x => `<th>${x.replace('_', ' ')}</th>`).join('')}<th></th></tr>` +
      (d.map(r => `<tr>${c.c.map(x => `<td>${cell(r, x)}</td>`).join('')}<td>${acts(r)}</td></tr>`).join('') || `<tr><td colspan="9">No records found. Use the Add button to create one.</td></tr>`) + '</table></div>');
  });
}
function dlg(title, html, fn) {
  $('#mf').html(`<h3>${title}</h3>${html}<button>Save</button><button type="button" class="g" id="x">Cancel</button>`);
  $('#modal').addClass('on');
  $('#mf').off('submit').on('submit', e => { e.preventDefault(); fn(Object.fromEntries(new FormData(e.target))).done(() => { $('#modal').removeClass('on'); load(); }); });
}
async function form(r = {}) {
  const inputs = await Promise.all(T[cur].f.map(async ([k, l, t = 'text']) => {
    if (t.startsWith('sel:')) {
      const L = await api('GET', '/' + t.slice(4));
      return `<label>${l}<select name="${k}" required><option value="">Select…</option>${L.map(o => `<option value="${o.id}"${o.id == r[k] ? ' selected' : ''}>${esc(o.name)}</option>`).join('')}</select></label>`;
    }
    return t === 'textarea' ? `<label>${l}<textarea name="${k}" rows="3">${esc(r[k])}</textarea></label>` : `<label>${l}<input name="${k}" type="${t}" value="${esc(r[k])}"${t === 'number' ? ' min="0" step="any"' : ''}></label>`;
  }));
  dlg(`${r.id ? 'Edit' : 'Add'} ${T[cur].t.toLowerCase().replace(/s$/, '')}`, inputs.join(''), d => api(r.id ? 'PUT' : 'POST', `/${cur}${r.id ? '/' + r.id : ''}`, d));
}
const payForm = r => dlg(`Mock payment: ${esc(r.patient)}, ${Number(r.amount).toFixed(2)}`,
  `<label>Payment mode<select name="payment_mode">${P.map(m => `<option>${m}</option>`).join('')}</select></label>`,
  d => api('PATCH', `/appointments/${r.id}/pay`, { ...d, payment_status: 'Paid' }));

function dash() {
  $('#bar').empty();
  api('GET', '/dashboard').done(d => { const m = v => Number(v).toFixed(2); $('#view').html(`<div class="dash">
    <div class="hero"><svg viewBox="0 0 64 64"><use href="#tooth"/></svg><span>Revenue collected</span><div><b>${m(d.revenue)}</b><span>from paid appointments</span></div></div>
    <div class="tile mint"><span>Today's appointments</span><b>${d.today}</b></div>
    <div class="tile"><span>Total patients</span><b>${d.patients}</b></div>
    <div class="tile"><span>Dentists on staff</span><b>${d.dentists}</b></div>
    <div class="tile gum"><span>Pending payments</span><b>${m(d.pending)}</b></div>
    <div class="rep"><h3>Appointments report</h3><p class="muted">Pick a date range, or leave both blank to export everything.</p>
    <div class="bar"><input type="date" id="from"><input type="date" id="to"><button id="exp">Download CSV</button><button class="g" onclick="print()">Print</button></div></div></div>`); });
}
$('#view').on('click', '#exp', () => location = `/api/reports/appointments.csv?from=${$('#from').val() || '1900-01-01'}&to=${$('#to').val() || '2999-12-31'}`)
  .on('click', '[data-a]', function () {
    const id = $(this).data('id'), a = $(this).data('a'), r = rows.find(x => x.id == id);
    if (a === 'del') { if (confirm('Delete this record? This cannot be undone.')) api('DELETE', `/${cur}/${id}`).done(load); }
    else if (a === 'edit') form(r);
    else if (a === 'hist') { show('treatments'); $('#q').val(r.name); load(); }
    else if (r.payment_status === 'Paid') api('PATCH', `/appointments/${id}/pay`, { payment_status: 'Pending' }).done(load); else payForm(r);
  }).on('change', '.st', function () { api('PATCH', `/appointments/${$(this).data('id')}/status`, { status: this.value }).done(load); });
$('#bar').on('input change', '#q,#d', load).on('click', '#add', () => form());
$('#modal').on('click', '#x', () => $('#modal').removeClass('on'));
show('dashboard');
