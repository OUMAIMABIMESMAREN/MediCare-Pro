const mongoose = require('mongoose');

const MedicamentSchema = new mongoose.Schema({
  nom:        { type: String, required: true },
  dosage:     { type: String },
  frequence:  { type: String },
  duree:      { type: String },
  instructions: { type: String }
}, { _id: false });

const OrdonnanceSchema = new mongoose.Schema({
  patientId:      { type: String, required: true },
  patientNom:     { type: String },
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
  date:           { type: Date, required: true },
  medecin:        { type: String, default: 'Dr. Martin' },
  medicaments:    [MedicamentSchema],
  duree_traitement: { type: String },
  renouvellement: { type: Boolean, default: false },
  notes:          { type: String },
  validite_jours: { type: Number, default: 90 }
}, { timestamps: true });

module.exports = mongoose.model('Ordonnance', OrdonnanceSchema);
