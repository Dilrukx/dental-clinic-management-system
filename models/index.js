const m = require('./base');
module.exports = {
  patients: m({ table: 'patients', fields: ['name', 'phone', 'email', 'dob', 'address'], required: ['name', 'phone'], search: ['t.name', 't.phone', 't.email'] }),
  dentists: m({ table: 'dentists', fields: ['name', 'specialization', 'schedule', 'phone'], required: ['name', 'specialization'], search: ['t.name', 't.specialization'] }),
  services: m({ table: 'services', fields: ['name', 'cost', 'duration'], required: ['name', 'cost', 'duration'], num: ['cost', 'duration'], search: ['t.name'] }),
  appointments: m({ table: 'appointments', fields: ['patient_id', 'dentist_id', 'service_id', 'appt_date', 'appt_time', 'amount'],
    required: ['patient_id', 'dentist_id', 'service_id', 'appt_date', 'appt_time'],
    join: 'JOIN patients p ON p.id=t.patient_id JOIN dentists d ON d.id=t.dentist_id JOIN services s ON s.id=t.service_id',
    cols: ',p.name patient,d.name dentist,s.name service', search: ['p.name', 'd.name', 's.name'], dateCol: 't.appt_date' }),
  treatments: m({ table: 'treatments', fields: ['patient_id', 'dentist_id', 'visit_date', 'diagnosis', 'prescription'],
    required: ['patient_id', 'dentist_id', 'visit_date', 'diagnosis'],
    join: 'JOIN patients p ON p.id=t.patient_id JOIN dentists d ON d.id=t.dentist_id',
    cols: ',p.name patient,d.name dentist', search: ['p.name', 't.diagnosis'] })
};
