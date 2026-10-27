const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
  patientId:    { type: String, required: true, ref: 'Patient' },
  date:         { type: Date, required: true },
  motif:        { type: String, required: true },
  diagnostic:   { type: String },
  notes:        { type: String },
  tension:      { type: String },
  fc:           { type: Number },
  spo2:         { type: Number },
  glycemie:     { type: Number },
  poids_kg:     { type: Number },
  temperature:  { type: Number },
  traitement:   { type: String },
  arret_travail:{ type: Boolean, default: false },
  arret_jours:  { type: Number },
  medecin:      { type: String, default: 'Dr. Martin' },
  suivi_requis: { type: Boolean, default: false },
  prochain_rdv: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Consultation', ConsultationSchema);
